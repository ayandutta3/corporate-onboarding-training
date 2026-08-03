from app.ingestion.models import DocumentModel, DocumentChunkModel
from app.ingestion.repository import DocumentRepository, DocumentChunkRepository
from app.vector.repository import VectorRepository
from app.vector.embedding import EmbeddingService
from motor.motor_asyncio import AsyncIOMotorDatabase
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
import time

class LazyEmbeddingService:
    def __init__(self, db: AsyncIOMotorDatabase, vector_repo: VectorRepository, embedding_service: EmbeddingService):
        self.doc_repo = DocumentRepository(db)
        self.chunk_repo = DocumentChunkRepository(db)
        self.vector_repo = vector_repo
        self.embedding_service = embedding_service
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    async def ensure_embeddings(self, candidates: List[DocumentModel]) -> tuple[List[DocumentModel], int, int]:
        total_embedding_time_ms = 0
        embedding_generated_count = 0
        
        for doc in candidates:
            if not doc.embedding_generated and doc.extracted_text:
                start_time = time.time()
                
                chunks = self.text_splitter.create_documents([doc.extracted_text])
                
                ids = []
                embeddings = []
                metadatas = []
                documents = []
                
                for i, chunk in enumerate(chunks):
                    chunk_id = f"{doc.id}-chunk-{i}"
                    embedding, _ = await self.embedding_service.generate_embedding(chunk.page_content)
                    
                    ids.append(chunk_id)
                    embeddings.append(embedding)
                    documents.append(chunk.page_content)
                    metadatas.append({
                        "document_id": str(doc.id), 
                        "chunk_id": chunk_id,
                        "document_name": doc.filename,
                        "department": doc.department,
                        "division": doc.division or "Corporate",
                        "businessLine": doc.businessLine or "",
                        "timestamp": str(doc.created_at),
                        "version": doc.version
                    })
                    
                    # Skip saving chunk metadata to MongoDB because it's already in ChromaDB
                    
                self.vector_repo.insert_chunks(ids, embeddings, metadatas, documents)
                
                # Update Document in MongoDB
                doc.embedding_generated = True
                await self.doc_repo.update(doc.id, doc, embedding_generated=True)
                
                total_embedding_time_ms += int((time.time() - start_time) * 1000)
                embedding_generated_count += 1
                
        return candidates, total_embedding_time_ms, embedding_generated_count
