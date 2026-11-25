
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class Animal(Base):
    __tablename__ = "animais"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    microchip: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    nome: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    data_nascimento: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    idade_estimada: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    sexo: Mapped[str | None] = mapped_column(
        String(1),
        nullable=True
    )

    cor: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    peso_atual: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 2),
        nullable=True
    )

    especie: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    raca: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    data_cadastro: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False
    )

    data_atualizacao: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        onupdate=datetime.now,
        nullable=False
    )
