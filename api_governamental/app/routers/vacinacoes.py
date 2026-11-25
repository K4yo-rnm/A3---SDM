
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.operacao import Operacao
from app.models.vacinacao import VacinacaoAntirrabica
from app.schemas.operacao import OperacaoResponse
from app.schemas.vacinacao import VacinacaoAntirrabicaCreate
from app.services.estado_servico import verificar_disponibilidade


router = APIRouter(
    prefix="/api/governo",
    tags=["Vacinações Antirrábicas"]
)


@router.post(
    "/vacinacoes-antirrabicas",
    response_model=OperacaoResponse,
    status_code=status.HTTP_201_CREATED
)
def receber_vacinacao(
    dados: VacinacaoAntirrabicaCreate,
    response: Response,
    db: Session = Depends(get_db)
):
    # Verifica se a solicitação já foi recebida
    operacao_existente = db.query(Operacao).filter(
        Operacao.chave_idempotencia == dados.chave_idempotencia
    ).first()

    if operacao_existente:
        vacinacao_existente = db.query(VacinacaoAntirrabica).filter(
            VacinacaoAntirrabica.operacao_id == operacao_existente.id
        ).first()

        if not vacinacao_existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A chave de idempotência já está vinculada a outra operação."
            )

        # Impede reutilização da chave com dados diferentes
        campos = [
            "microchip",
            "identificacao_animal",
            "data_vacinacao",
            "identificacao_vacina",
            "fabricante",
            "lote",
            "identificacao_veterinario"
        ]

        for campo in campos:
            if getattr(vacinacao_existente, campo) != getattr(dados, campo):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A chave de idempotência já foi utilizada com dados diferentes."
                )

        response.status_code = status.HTTP_200_OK
        return operacao_existente

    # Simula a indisponibilidade do serviço governamental
    if not verificar_disponibilidade():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço governamental temporariamente indisponível."
        )

    # Gera um protocolo único
    protocolo = (
        f"GOV-{datetime.now():%Y%m%d}-"
        f"{uuid4().hex[:12].upper()}"
    )

    agora = datetime.now()

    # Cria o registro da operação
    nova_operacao = Operacao(
        protocolo=protocolo,
        tipo_operacao="vacinacao_antirrabica",
        chave_idempotencia=dados.chave_idempotencia,
        microchip=dados.microchip,
        status="confirmada",
        data_requisicao=agora,
        data_resposta=agora,
        tentativas=1,
        resultado="Vacinação antirrábica recebida e registrada com sucesso."
    )

    try:
        db.add(nova_operacao)
        db.flush()

        # Registra os dados da vacinação
        nova_vacinacao = VacinacaoAntirrabica(
            operacao_id=nova_operacao.id,
            microchip=dados.microchip,
            identificacao_animal=dados.identificacao_animal,
            data_vacinacao=dados.data_vacinacao,
            identificacao_vacina=dados.identificacao_vacina,
            fabricante=dados.fabricante,
            lote=dados.lote,
            identificacao_veterinario=dados.identificacao_veterinario
        )

        db.add(nova_vacinacao)
        db.commit()
        db.refresh(nova_operacao)

    except Exception:
        db.rollback()
        raise

    return nova_operacao
