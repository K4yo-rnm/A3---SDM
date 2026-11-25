
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class AnimalCreate(BaseModel):
    microchip: str = Field(min_length=1, max_length=50)
    nome: str = Field(min_length=1, max_length=100)
    data_nascimento: date | None = None
    idade_estimada: int | None = Field(default=None, ge=0)
    sexo: str | None = Field(default=None, max_length=1)
    cor: str | None = Field(default=None, max_length=50)
    peso_atual: Decimal | None = Field(default=None, ge=0)
    especie: str = Field(min_length=1, max_length=50)
    raca: str | None = Field(default=None, max_length=50)


class AnimalUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=100)
    data_nascimento: date | None = None
    idade_estimada: int | None = Field(default=None, ge=0)
    sexo: str | None = Field(default=None, max_length=1)
    cor: str | None = Field(default=None, max_length=50)
    peso_atual: Decimal | None = Field(default=None, ge=0)
    especie: str | None = Field(default=None, min_length=1, max_length=50)
    raca: str | None = Field(default=None, max_length=50)


class AnimalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    microchip: str
    nome: str
    data_nascimento: date | None
    idade_estimada: int | None
    sexo: str | None
    cor: str | None
    peso_atual: Decimal | None
    especie: str
    raca: str | None
    data_cadastro: datetime
    data_atualizacao: datetime

class AnimalUpdateResponse(AnimalResponse):
    protocolo: str

class AnimalCreateResponse(AnimalResponse):
    protocolo: str
