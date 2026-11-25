
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class Operacao(Base):
    __tablename__ = "operacoes"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    protocolo: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    tipo_operacao: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    chave_idempotencia: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True,
        index=True
    )

    microchip: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pendente"
    )

    data_requisicao: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False
    )

    data_resposta: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    tentativas: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False
    )

    mensagem_erro: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    resultado: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )
