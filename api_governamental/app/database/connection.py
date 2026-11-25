from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


# Localização do banco de dados
BASE_DIR = Path(__file__).resolve().parents[2]
DATABASE_DIR = BASE_DIR / "database"

DATABASE_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = f"sqlite:///{DATABASE_DIR / 'governo.db'}"


# Conexão com o SQLite
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


# Gerenciador de sessões
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Classe base dos modelos
class Base(DeclarativeBase):
    pass


# Dependência para disponibilizar sessões aos endpoints
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
