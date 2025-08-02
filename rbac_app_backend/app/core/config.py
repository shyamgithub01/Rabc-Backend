from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RBAC App"
    API_V1_STR: str = "/api"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"

    # Connection pool tuning
    DB_POOL_SIZE: int = 50
    DB_MAX_OVERFLOW: int = 100
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800
    DB_STMT_TIMEOUT_MS: int = 0  # in milliseconds; 0 disables per-statement timeout

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def SERVER_SETTINGS(self) -> dict[str, str]:
        """Optional per-connection server settings for asyncpg."""
        settings = {"application_name": self.PROJECT_NAME}
        if self.DB_STMT_TIMEOUT_MS > 0:
            settings["statement_timeout"] = str(self.DB_STMT_TIMEOUT_MS)
        return settings

# Instantiate settings
settings = Settings()