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
        from paddleocr import PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang='en')
        result = ocr.ocr(file_path, cls=True)
        if result and result[0]:
            for line in result[0]:
                text += line[1][0] + " "
    elif ext in ['mp4', 'avi', 'mp3', 'wav']:
        import whisper
        # Handle video to audio if needed, Whisper can often process video files directly
        model = whisper.load_model("base")
        result = model.transcribe(file_path)
        text = result["text"]
    
    return text.strip()

async def generate_ai_summary_and_tags(text: str):
    if not text:
        return "", []
    
    llm = ChatOpenAI(temperature=0, openai_api_key=settings.openai_api_key)
    
    prompt = PromptTemplate(
        input_variables=["text"],
        template="Analyze the following text. Provide a brief summary and a list of 3-5 tags separated by commas.\n\nText: {text}\n\nFormat: Summary: [summary]\nTags: [tag1, tag2, tag3]"
    )
    
    chain = prompt | llm
    result = await chain.ainvoke({"text": text[:3000]}) # Limit text length for summary
    content = result.content
    
    summary = ""
    tags = []
    
    if "Summary:" in content and "Tags:" in content:
        parts = content.split("Tags:")
        summary = parts[0].replace("Summary:", "").strip()
        tags = [t.strip() for t in parts[1].split(",")]
    
    return summary, tags
