
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OperacaoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    protocolo: str
    tipo_operacao: str
    microchip: str | None
    status: str
    data_requisicao: datetime
    data_resposta: datetime | None
    tentativas: int
    mensagem_erro: str | None
    resultado: str | None
