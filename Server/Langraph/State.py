from typing import List, Optional

from pydantic import BaseModel, Field


class AgentState(BaseModel):
    prompt: str
    plan: Optional[str] = None
    code: Optional[str] = None
    previous_code: Optional[str] = None
    previous_plan: Optional[str] = None
    current_error: Optional[str] = None
    error_type: Optional[str] = None
    worker_output: List[str] = Field(default_factory=list)
    # Cloudinary public URLs for each successfully rendered video
    video_urls: List[str] = Field(default_factory=list)
    iteration: int = 0
    max_iterations: int = 5

    is_edit_request: bool = False
