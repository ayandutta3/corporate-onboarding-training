import chromadb
from typing import List, Dict, Any

class VectorRepository:
    def __init__(self, collection_name: str = "corporate_knowledge", persist_directory: str = "./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.collection_name = collection_name
        self.collection = None
        self.create_index()

    def create_index(self):
        # Gets or creates the collection
        self.collection = self.client.get_or_create_collection(name=self.collection_name)

    def insert_chunks(self, ids: List[str], embeddings: List[List[float]], metadatas: List[Dict[str, Any]], documents: List[str]):
        if not ids:
            return
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=documents
        )

    def search(self, query_embedding: List[float], top_k: int = 5, where: Dict[str, Any] = None) -> Dict[str, Any]:
        kwargs = {
            "query_embeddings": [query_embedding],
            "n_results": top_k,
            "include": ["documents", "metadatas", "distances"]
        }
        if where:
            kwargs["where"] = where
            
        results = self.collection.query(**kwargs)
        return results

    def update(self, ids: List[str], embeddings: List[List[float]], metadatas: List[Dict[str, Any]], documents: List[str]):
        self.collection.update(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=documents
        )

    def delete(self, ids: List[str]):
        self.collection.delete(ids=ids)
