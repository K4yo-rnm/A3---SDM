from fastapi import APIRouter

from app.services.estado_servico import (
    verificar_disponibilidade,
    alterar_disponibilidade
)


router = APIRouter(
    prefix="/api/governo/simulacao",
    tags=["Simulação do Serviço"]
)


@router.get("/disponibilidade")
def consultar_disponibilidade():
    return {
        "disponivel": verificar_disponibilidade()
    }


@router.post("/disponibilidade")
def definir_disponibilidade(disponivel: bool):
    estado_atual = alterar_disponibilidade(disponivel)

    return {
        "mensagem": (
            "Serviço governamental disponível."
            if estado_atual
            else "Serviço governamental indisponível."
        ),
        "disponivel": estado_atual
    }