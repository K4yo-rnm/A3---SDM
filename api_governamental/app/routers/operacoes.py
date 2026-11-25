
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.operacao import Operacao
from app.schemas.operacao import OperacaoResponse


router = APIRouter(
    prefix="/api/governo/operacoes",
    tags=["Operações"]
)


@router.get(
    "/{protocolo}",
    response_model=OperacaoResponse
)
def consultar_operacao(
    protocolo: str,
    db: Session = Depends(get_db)
):
    operacao = db.query(Operacao).filter(
        Operacao.protocolo == protocolo
    ).first()

    if not operacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Protocolo de operação não encontrado."
        )

    return operacao
