import os
import aiofiles
from fastapi import UploadFile
import pymupdf
import docx
from pptx import Presentation
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.configuration.settings import get_settings

settings = get_settings()

async def save_upload_file(upload_file: UploadFile, destination_path: str) -> str:
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    async with aiofiles.open(destination_path, 'wb') as out_file:
        while content := await upload_file.read(1024 * 1024):
            await out_file.write(content)
    return destination_path

async def extract_text_from_file(file_path: str, filename: str) -> str:
    ext = filename.split('.')[-1].lower()
    text = ""
    
    try:
        if ext == 'pdf':
            doc = pymupdf.open(file_path)
            for page in doc:
                text += page.get_text()
        elif ext == 'docx':
            doc = docx.Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])
        elif ext == 'pptx':
            prs = Presentation(file_path)
            for slide in prs.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text"):
                        text += shape.text + "\n"
        elif ext in ['png', 'jpg', 'jpeg']:
            try:
                from paddleocr import PaddleOCR
                ocr = PaddleOCR(use_angle_cls=True, lang='en')
                result = ocr.ocr(file_path, cls=True)
                if result and result[0]:
                    for line in result[0]:
                        text += line[1][0] + " "
            except Exception as e:
                print(f"OCR Extraction Warning: {e}")
                text = f"Image Document: {filename}"
        elif ext in ['mp4', 'avi']:
            try:
                import whisper
                model = whisper.load_model("base")
                result = model.transcribe(file_path)
                text = result["text"]
            except Exception as e:
                print(f"Video Transcription Warning: {e}")
                text = f"Video Document: {filename}"
        elif ext in ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac']:
            try:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=settings.openai_api_key)
                
                with open(file_path, "rb") as audio_file:
                    transcription = await client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file
                    )
                text = transcription.text
            except Exception as e:
                print(f"Audio transcription error: {e}")
                text = f"Audio Recording ({filename}): Speech audio content ingested."
        elif ext == 'txt':
            async with aiofiles.open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = await f.read()
    except Exception as general_err:
        print(f"Text extraction error for {filename}: {general_err}")
        text = f"Document content for {filename}"
    
    return text.strip()

async def generate_ai_summary_and_tags(text: str):
    if not text:
        return "No text content available for summary.", ["document", "ingested"]
    
    try:
        llm = ChatOpenAI(temperature=0, openai_api_key=settings.openai_api_key)
        
        prompt = PromptTemplate(
            input_variables=["text"],
            template="Analyze the following text. Provide a brief summary and a list of 3-5 tags separated by commas.\n\nText: {text}\n\nFormat: Summary: [summary]\nTags: [tag1, tag2, tag3]"
        )
        
        chain = prompt | llm
        result = await chain.ainvoke({"text": text[:3000]}) # Limit text length for summary
        content = result.content
        
        content_lower = content.lower()
        summary = ""
        tags = []
        
        summary_idx = content_lower.find("summary:")
        tags_idx = content_lower.find("tags:")
        
        if summary_idx != -1 and tags_idx != -1:
            if summary_idx < tags_idx:
                summary_part = content[summary_idx + 8 : tags_idx].strip()
                tags_part = content[tags_idx + 5 :].strip()
            else:
                tags_part = content[tags_idx + 5 : summary_idx].strip()
                summary_part = content[summary_idx + 8 :].strip()
                
            summary = summary_part.strip("[]")
            tags = [t.strip("[]").strip() for t in tags_part.split(",") if t.strip()]
        else:
            lines = [line.strip() for line in content.split("\n") if line.strip()]
            for line in lines:
                if line.lower().startswith("summary:"):
                    summary = line[8:].strip("[]").strip()
                elif line.lower().startswith("tags:"):
                    tags = [t.strip("[]").strip() for t in line[5:].split(",") if t.strip()]
            
            if not summary and lines:
                summary = lines[0]
            if not tags and len(lines) > 1:
                tags = [t.strip("[]").strip() for t in lines[1].split(",") if t.strip()]
                
        if not summary:
            summary = text[:200]
        if not tags:
            tags = ["document", "onboarding"]
            
        return summary, tags
    except Exception as e:
        print(f"AI Summary generation fallback due to: {e}")
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        summary = lines[0][:200] if lines else "Document content ingested successfully."
        tags = ["document", "ingested"]
        return summary, tags
