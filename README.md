# Sistema de Gestão de Clínica Veterinária

Sistema web desenvolvido como Projeto Integrador da disciplina **Sistemas Distribuídos e Mobile (SDM)**. O objetivo é informatizar os processos de uma clínica veterinária, permitindo o gerenciamento de tutores, animais, veterinários, consultas e vacinações, com integração entre serviços por meio de APIs REST.

## Sobre o projeto

A aplicação foi concebida com uma arquitetura composta por três serviços principais:

- **Frontend:** interface web para utilização do sistema.
- **API privada:** responsável pelas regras de negócio, autenticação, validações e persistência dos dados da clínica.
- **API governamental simulada:** serviço independente que representa a integração com um sistema externo para cadastro de animais identificados por microchip e recebimento de informações de vacinação antirrábica.

O sistema também prevê o consumo da API pública **ViaCEP**, utilizada para consulta e preenchimento de endereços a partir do CEP.

> **Importante:** a API governamental deste projeto é uma simulação acadêmica. Ela não representa uma integração oficial com sistemas governamentais reais.

## Objetivos

- Gerenciar os cadastros de tutores e animais.
- Controlar o acesso de veterinários autorizados.
- Registrar consultas e manter o histórico clínico dos animais.
- Registrar aplicações de vacinas e acompanhar próximas doses.
- Controlar a identificação dos animais por microchip RFID.
- Consumir a API ViaCEP para consulta de endereços.
- Integrar a aplicação com uma API governamental simulada.
- Demonstrar comunicação entre serviços, persistência de dados e tratamento de falhas.

## Arquitetura do sistema

A solução é organizada em serviços independentes, que se comunicam por requisições HTTP.

```text
                 ┌──────────────────────┐
                 │      FRONTEND        │
                 │       Next.js        │
                 └──────────┬───────────┘
                            │
                            │ HTTP / REST
                            ▼
                 ┌──────────────────────┐
                 │     API PRIVADA      │
                 │   Regras de negócio  │
                 │   Autenticação       │
                 │   Validações         │
                 └───────┬────────┬─────┘
                         │        │
                ┌────────▼───┐    │
                │  SQLite    │    │
                │ Clínica    │    │
                └────────────┘    │
                                  │ HTTP / REST
                                  ▼
                       ┌─────────────────────┐
                       │ API GOVERNAMENTAL   │
                       │      SIMULADA       │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │ SQLite — Governo    │
                       └─────────────────────┘

          API pública externa: ViaCEP
```

## Tecnologias utilizadas

### Aplicação web

- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- SQLite
- JavaScript

### API governamental simulada

- Python
- FastAPI
- SQLAlchemy
- SQLite

### Integrações

- ViaCEP — consulta pública de CEP.
- Comunicação HTTP entre os serviços.
- APIs REST.

### Ferramentas

- Visual Studio Code
- Git e GitHub
- npm
- Python e pip

## Funcionalidades previstas

### Autenticação e controle de acesso

- Login de veterinários por e-mail e senha.
- Armazenamento seguro de senhas por hash.
- Controle de veterinários ativos e inativos.
- Verificação de confirmação de senha.
- Proteção de funcionalidades restritas.

### Gestão de tutores

- Cadastro e consulta de tutores.
- Atualização e inativação de cadastros.
- Validação de CPF.
- Associação de endereço ao tutor.

### Gestão de animais

- Cadastro e atualização de animais.
- Associação obrigatória a um tutor.
- Controle de espécie e raça.
- Identificação por microchip RFID.
- Histórico de vinculação e substituição de microchips.

### Consultas veterinárias

- Registro de atendimentos.
- Identificação do veterinário responsável.
- Registro de anamnese, sintomas e diagnóstico.
- Histórico clínico dos animais.

### Vacinação

- Registro de aplicações.
- Identificação da vacina e do fabricante.
- Controle de lote e validade.
- Histórico de vacinação.
- Consulta de próximas doses.

### Integração governamental simulada

- Cadastro de animais pelo microchip.
- Consulta e atualização de dados.
- Recebimento de informações de vacinação antirrábica.
- Geração de protocolos de operação.
- Controle de tentativas e resultados de integração.

## Regra de negócio: vacinação antirrábica

Uma das principais regras do projeto é a comunicação obrigatória de toda aplicação efetiva de vacina antirrábica à API governamental simulada.

O fluxo previsto é:

1. O veterinário registra a aplicação da vacina no sistema da clínica.
2. A vacinação é persistida localmente.
3. O sistema gera uma solicitação de comunicação à API governamental simulada.
4. A API externa processa a solicitação e retorna o resultado.
5. O sistema registra o protocolo e a situação da integração.

Caso o serviço externo esteja indisponível, a vacinação permanece registrada localmente e a comunicação fica pendente para nova tentativa.

A repetição de uma solicitação deve utilizar controle de idempotência para evitar registros duplicados no serviço externo.

Vacinas que não sejam antirrábicas não estão sujeitas a essa comunicação obrigatória.

## Banco de dados

O projeto utiliza bancos relacionais SQLite, com separação entre os dados da clínica e os dados da API governamental simulada.

O modelo de dados do sistema contempla as seguintes entidades previstas:

- Tutor
- Animal
- Espécie
- Raça
- Endereço
- Veterinário
- Consulta
- Vacina
- VínculoMicrochip
- IntegraçãoGoverno

A estrutura do banco da aplicação web é gerenciada pelo Prisma ORM.

## Instalação e execução

### Pré-requisitos

- Node.js 20.9 ou superior.
- npm.
- Python 3.10 ou superior.
- Git.

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta do projeto:

```bash
cd clinica-veterinaria
```

### 2. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto, utilizando como referência:

```env
DATABASE_URL="file:./database/clinica-dev.db"
JWT_SECRET="SEU_SEGREDO_FORTE"
API_GOVERNAMENTAL_URL="http://127.0.0.1:8001"
CRON_SECRET="OUTRO_SEGREDO_FORTE"
```

**Não compartilhe senhas, tokens ou segredos no repositório público.**

### 3. Instalar dependências do frontend e backend privado

Na raiz do projeto:

```bash
npm install
```

Gere o cliente Prisma:

```bash
npx prisma generate
```

Aplique as migrações do banco:

```bash
npx prisma migrate deploy
```

### 4. Preparar a API governamental simulada

Entre na pasta:

```bash
cd api_governamental
```

Crie um ambiente virtual:

```bash
python -m venv .venv
```

Ative o ambiente virtual no Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

### 5. Executar a API governamental simulada

Na pasta `api_governamental`:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

### 6. Executar a aplicação web

Em outro terminal, retorne à raiz do projeto:

```bash
npm run dev
```

A aplicação web deverá estar disponível em:

http://localhost:3000

A documentação interativa do FastAPI, quando o serviço estiver inicializado, poderá ser acessada em:

http://127.0.0.1:8001/docs

> **Nota de instalação:** os comandos acima descrevem o procedimento previsto. Antes de considerar a API governamental executável, confira se todos os módulos importados pelo projeto estão presentes, incluindo os modelos e serviços necessários. O pacote analisado apresentou dependências ausentes nessa parte.

## Testes

O projeto possui cenários de teste planejados para validar:

- Autenticação e controle de acesso.
- Cadastro de tutores e animais.
- Validação de CPF e microchip.
- Consulta de CEP.
- Registro de consultas e vacinas.
- Comunicação com a API governamental simulada.
- Tratamento de indisponibilidade.
- Reenvio de operações pendentes.
- Controle de duplicidade por idempotência.

Os resultados dos testes devem ser registrados com evidências de execução. A existência de cenários documentados não significa que todos tenham sido executados ou aprovados.

## Estrutura do projeto

```text
clinica-veterinaria/
│
├── api_governamental/
│   ├── app/
│   │   ├── database/
│   │   ├── routers/
│   │   └── main.py
│   └── requirements.txt
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   └── ...
│
├── .env
├── package.json
├── prisma7.config.ts
└── README.md
```

*Estrutura resumida dos diretórios identificados no pacote do projeto.*

## Documentação do projeto

Os documentos complementares incluem:

- Documento de requisitos e descrição da arquitetura.
- Diagrama Entidade-Relacionamento (DER).
- Modelo relacional.
- Script/procedimento de criação e inicialização dos bancos.
- Documentação dos endpoints.
- Coleção de testes das APIs.
- Relatório dos testes executados.
- Instruções de instalação e execução.

Os links dos artefatos complementares poderão ser disponibilizados nesta seção após sua publicação no Google Drive ou no GitHub.
