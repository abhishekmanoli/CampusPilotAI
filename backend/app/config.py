import os
from pathlib import Path
from dotenv import load_dotenv

# Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
load_dotenv(BASE_DIR / ".env")

class Settings:
    # Local Ollama Gemma 4 Model Configuration
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "gemma4:e4b")
    
    # Server configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
        if origin.strip()
    ]
    
    # Directories
    DATA_DIR: Path = BASE_DIR / os.getenv("DATA_DIR", "data")
    UPLOAD_DIR: Path = BASE_DIR / os.getenv("UPLOAD_DIR", "uploads")
    SAMPLE_DATA_DIR: Path = BASE_DIR / "sample_data"
    SAMPLE_DIR: Path = BASE_DIR / "sample_data"

    def ensure_directories(self):
        self.DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.SAMPLE_DATA_DIR.mkdir(parents=True, exist_ok=True)

settings = Settings()
settings.ensure_directories()
