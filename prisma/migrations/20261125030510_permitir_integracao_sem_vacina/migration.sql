-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Integracao_Governo" (
    "id_integracao" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_animal" TEXT NOT NULL,
    "id_vacina" INTEGER,
    "tipo_operacao" TEXT NOT NULL,
    "protocolo_externo" TEXT,
    "chave_idempotencia" TEXT NOT NULL,
    "situacao_operacao" TEXT NOT NULL,
    "data_solicitacao" DATETIME NOT NULL,
    "data_resposta" DATETIME,
    "quantidade_tentativas" INTEGER NOT NULL,
    "mensagem_erro" TEXT,
    CONSTRAINT "Integracao_Governo_id_vacina_fkey" FOREIGN KEY ("id_vacina") REFERENCES "Vacinas" ("id_vacina") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Integracao_Governo_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "Animal" ("id_animal") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Integracao_Governo" ("chave_idempotencia", "data_resposta", "data_solicitacao", "id_animal", "id_integracao", "id_vacina", "mensagem_erro", "protocolo_externo", "quantidade_tentativas", "situacao_operacao", "tipo_operacao") SELECT "chave_idempotencia", "data_resposta", "data_solicitacao", "id_animal", "id_integracao", "id_vacina", "mensagem_erro", "protocolo_externo", "quantidade_tentativas", "situacao_operacao", "tipo_operacao" FROM "Integracao_Governo";
DROP TABLE "Integracao_Governo";
ALTER TABLE "new_Integracao_Governo" RENAME TO "Integracao_Governo";
CREATE UNIQUE INDEX "Integracao_Governo_chave_idempotencia_key" ON "Integracao_Governo"("chave_idempotencia");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
