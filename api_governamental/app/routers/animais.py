
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database.connection import get_db
from app.models.animal import Animal
from app.services.estado_servico import verificar_disponibilidade
from app.schemas.animal import (
    AnimalCreate,
    AnimalResponse,
    AnimalUpdate,
    AnimalUpdateResponse,
    AnimalCreateResponse
)

from datetime import datetime
from uuid import uuid4

from app.models.operacao import Operacao


router = APIRouter(
    prefix="/api/governo/animais",
    tags=["Animais"]
)



@router.post(
    "",
    response_model=AnimalCreateResponse,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_animal(
    dados: AnimalCreate,
    db: Session = Depends(get_db)
):
    if not verificar_disponibilidade():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço governamental temporariamente indisponível."
        )

    animal_existente = db.query(Animal).filter(
        Animal.microchip == dados.microchip
    ).first()

    if animal_existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um animal cadastrado com esse microchip."
        )

    novo_animal = Animal(**dados.model_dump())

    protocolo = str(uuid4())
    agora = datetime.now()

    nova_operacao = Operacao(
        protocolo=protocolo,
        tipo_operacao="cadastro_animal",
        chave_idempotencia=f"CADASTRO_ANIMAL_{dados.microchip}",
        microchip=dados.microchip,
        status="confirmada",
        data_requisicao=agora,
        data_resposta=agora,
        tentativas=1,
        resultado="Animal cadastrado com sucesso."
    )

    try:
        db.add(novo_animal)
        db.add(nova_operacao)
        db.commit()
        db.refresh(novo_animal)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não foi possível cadastrar: microchip ou operação já registrada."
        )

    dados_resposta = AnimalResponse.model_validate(
        novo_animal
    ).model_dump()

    dados_resposta["protocolo"] = protocolo

    return AnimalCreateResponse.model_validate(dados_resposta)

    if not verificar_disponibilidade():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço governamental temporariamente indisponível."
        )

    animal_existente = db.query(Animal).filter(
        Animal.microchip == dados.microchip
    ).first()

    if animal_existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um animal cadastrado com esse microchip."
        )

    novo_animal = Animal(**dados.model_dump())

    try:
        db.add(novo_animal)
        db.commit()
        db.refresh(novo_animal)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não foi possível cadastrar: microchip já utilizado."
        )

    return novo_animal


@router.get(
    "/{microchip}",
    response_model=AnimalResponse
)
def consultar_animal(
    microchip: str,
    db: Session = Depends(get_db)
):
    animal = db.query(Animal).filter(
        Animal.microchip == microchip
    ).first()

    if not animal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Animal não encontrado."
        )

    return animal


@router.put(
    "/{microchip}",
    response_model=AnimalUpdateResponse
)
def atualizar_animal(
    microchip: str,
    dados: AnimalUpdate,
    db: Session = Depends(get_db)
):
    animal = db.query(Animal).filter(
        Animal.microchip == microchip
    ).first()

    if not animal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Animal não encontrado."
        )

    atualizacoes = dados.model_dump(exclude_unset=True)

    for campo in ("nome", "especie"):
        if campo in atualizacoes and atualizacoes[campo] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"O campo '{campo}' não pode ser nulo."
            )

    for campo, valor in atualizacoes.items():
        setattr(animal, campo, valor)

    # Gera o protocolo da atualização.
    protocolo = str(uuid4())
    agora = datetime.now()

    # Registra a operação governamental.
    nova_operacao = Operacao(
        protocolo=protocolo,
        tipo_operacao="atualizacao_animal",
        microchip=microchip,
        status="confirmada",
        data_requisicao=agora,
        data_resposta=agora,
        tentativas=1,
        resultado="Dados do animal atualizados com sucesso."
    )

    try:
        db.add(nova_operacao)
        db.commit()
        db.refresh(animal)

    except Exception:
        db.rollback()
        raise

    # Monta a resposta com os dados do animal e o protocolo.
    dados_resposta = AnimalResponse.model_validate(
        animal
    ).model_dump()

    dados_resposta["protocolo"] = protocolo

    return AnimalUpdateResponse.model_validate(dados_resposta)

    animal = db.query(Animal).filter(
        Animal.microchip == microchip
    ).first()

    if not animal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Animal não encontrado."
        )

    atualizacoes = dados.model_dump(exclude_unset=True)

    for campo in ("nome", "especie"):
        if campo in atualizacoes and atualizacoes[campo] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"O campo '{campo}' não pode ser nulo."
            )

    for campo, valor in atualizacoes.items():
        setattr(animal, campo, valor)

    db.commit()
    db.refresh(animal)

    # Gera o protocolo da operação.
    protocolo = str(uuid4())

    # Primeiro converte os dados do animal.
    dados_resposta = AnimalResponse.model_validate(animal).model_dump()

    # Acrescenta o protocolo.
    dados_resposta["protocolo"] = protocolo

    return AnimalUpdateResponse.model_validate(dados_resposta)
    animal = db.query(Animal).filter(
        Animal.microchip == microchip
    ).first()

    if not animal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Animal não encontrado."
        )

    atualizacoes = dados.model_dump(exclude_unset=True)

    for campo in ("nome", "especie"):
        if campo in atualizacoes and atualizacoes[campo] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"O campo '{campo}' não pode ser nulo."
            )

    for campo, valor in atualizacoes.items():
        setattr(animal, campo, valor)

    db.commit()
    db.refresh(animal)

    protocolo = str(uuid4())

    return AnimalUpdateResponse.model_validate(animal).model_copy(
        update={"protocolo": protocolo}
    )
