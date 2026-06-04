from dotenv.main import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()


gllm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview", temperature=0.7)
