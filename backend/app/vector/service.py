from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.ingestion.models import DocumentModel, DocumentChunkModel
from app.ingestion.repository import DocumentChunkRepository
from app.vector.repository import VectorRepository
from app.vector.embedding import EmbeddingService

class VectorService:
    def __init__(self, chunk_repo: DocumentChunkRepository, vector_repo: VectorRepository, embedding_service: EmbeddingService):
        self.chunk_repo = chunk_repo
        self.embedding_service = embedding_service
        self.vector_repo = vector_repo
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    async def process_document(self, doc: DocumentModel):
        if not doc.extracted_text:
            return
            
        chunks = self.text_splitter.create_documents(
            texts=[doc.extracted_text]
        )
        
        ids = []
        embeddings = []
        metadatas = []
        documents = []

        for i, chunk in enumerate(chunks):
            chunk_id = f"{doc.id}-chunk-{i}"
            
            # Generate embedding
            embedding, _ = await self.embedding_service.generate_embedding(chunk.page_content)
            
            # Prepare ChromaDB insert
            ids.append(chunk_id)
            embeddings.append(embedding)
            documents.append(chunk.page_content)
            metadatas.append({
                "document_id": str(doc.id), 
                "chunk_id": chunk_id,
                "document_name": doc.filename,
                "department": doc.department,
                "timestamp": str(doc.created_at),
                "version": doc.version
            })
            
            # Skip saving chunk metadata to MongoDB because it's already in ChromaDB
            
        # Insert all into ChromaDB
        self.vector_repo.insert_chunks(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=documents
        )
