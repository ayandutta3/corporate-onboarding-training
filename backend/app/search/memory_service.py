import json
import logging
from typing import List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.configuration.settings import get_settings
from app.configuration.http_client import get_http_client, get_async_http_client
from datetime import datetime

logger = logging.getLogger(__name__)
settings = get_settings()

class MemoryService:
    # In-memory Short-Term Conversation turns indexed by user_email
    _short_term_history: Dict[str, List[Dict[str, str]]] = {}

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db["user_memories"]
        self.llm = ChatOpenAI(
            model=settings.llm_model,
            temperature=0,
            openai_api_key=settings.openai_api_key,
            openai_api_base=settings.openai_api_base,
            http_client=get_http_client(),
            http_async_client=get_async_http_client()
        )

    async def add_short_term_turn(self, user_email: str, role: str, query: str, answer: str):
        if user_email not in self._short_term_history:
            self._short_term_history[user_email] = []

        self._short_term_history[user_email].append({
            "query": query,
            "answer": answer,
            "timestamp": datetime.utcnow().isoformat()
        })

        # Keep last 20 turns in short-term memory
        if len(self._short_term_history[user_email]) > 20:
            self._short_term_history[user_email].pop(0)

        # Trigger Long-Term Memory Fact Extraction after every 2 turns
        if len(self._short_term_history[user_email]) % 2 == 0:
            await self.extract_and_persist_long_term_memory(user_email, role)

    @classmethod
    def get_short_term_turns(cls, user_email: str) -> List[Dict[str, Any]]:
        return cls._short_term_history.get(user_email, [])

    @classmethod
    def clear_short_term_turns(cls, user_email: str):
        if user_email in cls._short_term_history:
            cls._short_term_history[user_email] = []
        try:
            from app.search.semantic_cache import SemanticCacheService
            SemanticCacheService().clear_user_cache(user_email)
        except Exception:
            pass

    async def get_user_long_term_facts(self, user_email: str, role: str) -> List[str]:
        doc = await self.collection.find_one({"user_email": user_email})
        if doc and "facts" in doc:
            return doc["facts"]
        return []

    async def extract_and_persist_long_term_memory(self, user_email: str, role: str):
        turns = self._short_term_history.get(user_email, [])
        if not turns:
            return

        chat_summary = "\n".join([f"User: {t['query']}\nAssistant: {t['answer']}" for t in turns[-4:]])

        prompt = PromptTemplate(
            input_variables=["role", "history"],
            template="""Analyze the following recent chat history for a corporate user with role '{role}'.
Extract 2 to 4 key persistent facts, preferences, or primary focus areas about the user (e.g. 'Interested in WFH policy', 'Engineering manager for DevOps').

Chat History:
{history}

Format your output strictly as a JSON array of string facts:
["fact 1", "fact 2"]
"""
        )

        try:
            chain = prompt | self.llm
            result = await chain.ainvoke({"role": role, "history": chat_summary})
            content = result.content.strip()

            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            content = content.strip()

            new_facts = json.loads(content)
            if isinstance(new_facts, list):
                # Update MongoDB
                existing = await self.collection.find_one({"user_email": user_email})
                existing_facts = set(existing.get("facts", [])) if existing else set()
                existing_facts.update(new_facts)

                updated_facts_list = list(existing_facts)[:8] # Keep up to 8 core facts

                await self.collection.update_one(
                    {"user_email": user_email},
                    {
                        "$set": {
                            "user_email": user_email,
                            "role": role,
                            "facts": updated_facts_list,
                            "updated_at": datetime.utcnow().isoformat()
                        }
                    },
                    upsert=True
                )
        except Exception as err:
            logger.warning(f"Long-term memory extraction exception: {err}")
