
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class VacinacaoAntirrabicaCreate(BaseModel):
    chave_idempotencia: str = Field(min_length=1, max_length=100)

    microchip: str = Field(min_length=1, max_length=50)
    identificacao_animal: str = Field(min_length=1, max_length=100)

    data_vacinacao: date

    identificacao_vacina: str = Field(min_length=1, max_length=100)
    fabricante: str = Field(min_length=1, max_length=100)
    lote: str = Field(min_length=1, max_length=100)

    identificacao_veterinario: str = Field(min_length=1, max_length=100)


class VacinacaoAntirrabicaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    microchip: str
    identificacao_animal: str
    data_vacinacao: date
    identificacao_vacina: str
    fabricante: str
    lote: str
    identificacao_veterinario: str
    data_registro: datetime
