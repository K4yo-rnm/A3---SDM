
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class VacinacaoAntirrabica(Base):
    __tablename__ = "vacinacoes_antirrabicas"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    operacao_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("operacoes.id"),
        unique=True,
        nullable=False
    )

    microchip: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )

    identificacao_animal: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    data_vacinacao: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    identificacao_vacina: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    fabricante: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    lote: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    identificacao_veterinario: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    data_registro: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False
    )
