
from app.database.connection import Base, engine
from app import models


def inicializar_banco():
    Base.metadata.create_all(bind=engine)
    print("Banco governamental inicializado com sucesso!")


if __name__ == "__main__":
    inicializar_banco()
