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

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_cpf_key" ON "Tutor"("cpf");
