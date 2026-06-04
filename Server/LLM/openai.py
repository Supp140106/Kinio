import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()
# Option B — OpenAI via GitHub Models (uncomment to use)
github_token = os.getenv("GITHUB_TOKEN")
llm = ChatOpenAI(
    model="gpt-4o",
    openai_api_key=github_token,
    openai_api_base="https://models.inference.ai.azure.com",
    max_tokens=4000,
)
