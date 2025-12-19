from decouple import config

class Settings:
    DATABASE_URL: str = config("DATABASE_URL")
    SECRET_KEY: str = config("SECRET_KEY", default="your-secret-key-here")
    ALGORITHM: str = config("ALGORITHM", default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        default=30,
        cast=int
    )
    # Normalize CORS_ORIGINS into a list and strip whitespace
    _cors_raw = config(
        "CORS_ORIGINS",
        default="http://localhost:3000"
    )
    # split and strip, filter empties
    CORS_ORIGINS: list = [s.strip() for s in _cors_raw.split(",") if s.strip()]

    # Your existing key (KEEP IT)
    OPENAI_API_KEY: str = config("OPENAI_API_KEY", default="")

    # ⭐ REQUIRED FOR YOUR BACKEND (ADD THIS — DO NOT REMOVE ANYTHING ABOVE)
    OPENROUTER_API_KEY: str = config("OPENROUTER_API_KEY", default="")

settings = Settings()
