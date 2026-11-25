
# Estado inicial da API Governamental
servico_disponivel = True


def verificar_disponibilidade():
    return servico_disponivel


def alterar_disponibilidade(disponivel: bool):
    global servico_disponivel

    servico_disponivel = disponivel

    return servico_disponivel
