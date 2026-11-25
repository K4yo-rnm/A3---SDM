
from fastapi import FastAPI

from app.routers.animais import router as animais_router
from app.routers.vacinacoes import router as vacinacoes_router
from app.routers.operacoes import router as operacoes_router
from app.routers.simulacao import router as simulacao_router


app = FastAPI(
    title="API Governamental Simulada",
    description=(
        "Serviço simulado de registro de animais por microchip RFID "
        "e recebimento de vacinação antirrábica."
    ),
    version="1.0.0"
)


# Registro das rotas
app.include_router(animais_router)
app.include_router(vacinacoes_router)
app.include_router(operacoes_router)
app.include_router(simulacao_router)


@app.get("/")
def inicio():
    return {
        "mensagem": "API Governamental Simulada em funcionamento",
        "servico": "Registro de animais e vacinação antirrábica"
    }


@app.get("/health")
def verificar_saude():
    return {
        "status": "online"
    }


