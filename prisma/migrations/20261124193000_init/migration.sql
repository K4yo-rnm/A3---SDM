-- CreateTable
CREATE TABLE "Tutor" (
    "id_tutor" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_completo" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "data_nascimento" DATETIME,
    "email" TEXT,
    "telefone" TEXT,
    "data_cadastro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "situacao" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Endereco" (
    "id_endereco" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cep" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "id_ibge_municipio" TEXT,
    "id_tutor" INTEGER NOT NULL,
    CONSTRAINT "Endereco_id_tutor_fkey" FOREIGN KEY ("id_tutor") REFERENCES "Tutor" ("id_tutor") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Especie" (
    "id_especie" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "situacao" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Animal" (
    "id_animal" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "data_nascimento" DATETIME,
    "idade_estimada" INTEGER,
    "sexo" TEXT,
    "cor" TEXT,
    "peso_atual" REAL,
    "id_tutor" INTEGER NOT NULL,
    "id_especie" INTEGER NOT NULL,
    "id_raca" INTEGER,
    "situacao" TEXT NOT NULL,
    CONSTRAINT "Animal_id_raca_fkey" FOREIGN KEY ("id_raca") REFERENCES "Raca" ("id_raca") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Animal_id_especie_fkey" FOREIGN KEY ("id_especie") REFERENCES "Especie" ("id_especie") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Animal_id_tutor_fkey" FOREIGN KEY ("id_tutor") REFERENCES "Tutor" ("id_tutor") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Raca" (
    "id_raca" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_especie" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "situacao" TEXT NOT NULL,
    CONSTRAINT "Raca_id_especie_fkey" FOREIGN KEY ("id_especie") REFERENCES "Especie" ("id_especie") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Veterinario" (
    "id_veterinario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_completo" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "num_cmrv" TEXT NOT NULL,
    "uf_cmrv" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "hash_sevha" TEXT NOT NULL,
    "senha_confirmada" BOOLEAN NOT NULL,
    "data_confirmacao" DATETIME,
    "data_cadastro" DATETIME,
    "situacao" TEXT NOT NULL,
    "ultimo_acesso" DATETIME
);

-- CreateTable
CREATE TABLE "Vacinas" (
    "id_vacina" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_animal" TEXT NOT NULL,
    "id_veterinario" INTEGER NOT NULL,
    "nome_vacina" TEXT NOT NULL,
    "tipo_vacina" TEXT NOT NULL,
    "antirrabica" BOOLEAN NOT NULL,
    "fabricante" TEXT NOT NULL,
    "numero_lote" TEXT NOT NULL,
    "data_aplicacao" DATETIME NOT NULL,
    "dose_esquema" TEXT NOT NULL,
    "via_aplicacao" TEXT NOT NULL,
    "proxima_dose" DATETIME,
    "validade_lote" DATETIME,
    "observacoes" TEXT,
    "situacao" TEXT NOT NULL,
    CONSTRAINT "Vacinas_id_veterinario_fkey" FOREIGN KEY ("id_veterinario") REFERENCES "Veterinario" ("id_veterinario") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vacinas_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "Animal" ("id_animal") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Consultas" (
    "id_consulta" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_animal" TEXT NOT NULL,
    "id_veterinario" INTEGER NOT NULL,
    "data_hora" DATETIME NOT NULL,
    "motivo_atendimento" TEXT NOT NULL,
    "anamnese" TEXT,
    "sintomas" TEXT,
    "diagnostico" TEXT,
    "tratamento_prescrito" TEXT,
    "prescricao_medicamentos" TEXT,
    "peso_registrado" REAL,
    "temperatura" REAL,
    "observacoes" TEXT,
    "situacao" TEXT NOT NULL,
    CONSTRAINT "Consultas_id_veterinario_fkey" FOREIGN KEY ("id_veterinario") REFERENCES "Veterinario" ("id_veterinario") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Consultas_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "Animal" ("id_animal") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vinculo_Microchip" (
    "id_vinculo_microchip" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_animal" TEXT NOT NULL,
    "codigo_microchip" TEXT NOT NULL,
    "data_vinculacao" DATETIME NOT NULL,
    "id_veterinario" INTEGER NOT NULL,
    "situacao" TEXT NOT NULL,
    "data_desvinculacao" DATETIME,
    "motivo_substituicao" TEXT,
    "observacoes" TEXT,
    CONSTRAINT "Vinculo_Microchip_id_veterinario_fkey" FOREIGN KEY ("id_veterinario") REFERENCES "Veterinario" ("id_veterinario") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vinculo_Microchip_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "Animal" ("id_animal") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Integracao_Governo" (
    "id_integracao" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_animal" TEXT NOT NULL,
    "id_vacina" INTEGER NOT NULL,
    "tipo_operacao" TEXT NOT NULL,
    "protocolo_externo" TEXT,
    "chave_idempotencia" TEXT NOT NULL,
    "situacao_operacao" TEXT NOT NULL,
    "data_solicitacao" DATETIME NOT NULL,
    "data_resposta" DATETIME,
    "quantidade_tentativas" INTEGER NOT NULL,
    "mensagem_erro" TEXT,
    CONSTRAINT "Integracao_Governo_id_vacina_fkey" FOREIGN KEY ("id_vacina") REFERENCES "Vacinas" ("id_vacina") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Integracao_Governo_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "Animal" ("id_animal") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_cpf_key" ON "Tutor"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Especie_nome_key" ON "Especie"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Vinculo_Microchip_codigo_microchip_key" ON "Vinculo_Microchip"("codigo_microchip");

-- CreateIndex
CREATE UNIQUE INDEX "Integracao_Governo_chave_idempotencia_key" ON "Integracao_Governo"("chave_idempotencia");
