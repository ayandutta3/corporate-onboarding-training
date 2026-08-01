from fastapi import APIRouter, Depends, HTTPException, status
from app.authentication.dependencies import get_current_user
from app.authentication.models import UserInDB, Role
from app.configuration.settings import get_settings
import httpx
from typing import Optional

settings = get_settings()
router = APIRouter(prefix="/monitoring", tags=["Monitoring"])

@router.get("/traces", summary="Get Execution Traces", description="Retrieves execution traces from Langfuse for monitoring. Available to all roles.")
async def get_traces(
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    limit: int = 50,
    current_user: UserInDB = Depends(get_current_user)
):
    if not settings.langfuse_secret_key or not settings.langfuse_public_key:
        raise HTTPException(status_code=500, detail="Langfuse credentials not configured.")
        
    params = {"limit": limit}
    if user_id:
        params["userId"] = user_id
    if session_id:
        params["sessionId"] = session_id
        
    # The user requested SSL verification to be false for Langfuse calls
    async with httpx.AsyncClient(verify=False) as client:
        try:
            response = await client.get(
                f"{settings.langfuse_host.rstrip('/')}/api/public/traces",
                params=params,
                auth=(settings.langfuse_public_key, settings.langfuse_secret_key),
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to fetch traces from Langfuse: {str(e)}"
            )
