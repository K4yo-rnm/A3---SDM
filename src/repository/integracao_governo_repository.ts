
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@/generated/prisma/client";

export class IntegracaoGovernoRepository {

    // Buscar integração pelo ID
    async buscarPorID(id: number) {
        return await prisma.integracaoGoverno.findUnique({
            where: {
                id_integracao: id
            },
            include: {
                animal: true,
                vacina: true
            }
        });
    }

    // Buscar operação pela chave de idempotência
    async buscarPorChaveIdempotencia(chave: string) {
        return await prisma.integracaoGoverno.findUnique({
            where: {
                chave_idempotencia: chave
            },
            include: {
                animal: true,
                vacina: true
            }
        });
    }

    // Buscar integrações relacionadas a uma vacina
    async buscarPorVacina(id_vacina: number) {
        return await prisma.integracaoGoverno.findMany({
            where: {
                id_vacina: id_vacina
            },
            include: {
                animal: true,
                vacina: true
            },
            orderBy: {
                data_solicitacao: "desc"
            }
        });
    }

    // Buscar integrações relacionadas a um animal
    async buscarPorAnimal(id_animal: string) {
        return await prisma.integracaoGoverno.findMany({
            where: {
                id_animal: id_animal
            },
            include: {
                vacina: true
            },
            orderBy: {
                data_solicitacao: "desc"
            }
        });
    }

    // Buscar operações pendentes
    async buscarPendentes() {
        return await prisma.integracaoGoverno.findMany({
            where: {
                situacao_operacao: "PENDENTE"
            },
            include: {
                animal: true,
                vacina: true
            },
            orderBy: {
                data_solicitacao: "asc"
            }
        });
    }

    // Listar todas as integrações
    async buscarTodos() {
        return await prisma.integracaoGoverno.findMany({
            include: {
                animal: true,
                vacina: true
            },
            orderBy: {
                data_solicitacao: "desc"
            }
        });
    }

    // Registrar nova operação de integração
    async criar(dados: {
        id_animal: string;
        id_vacina: number;
        tipo_operacao: string;
        protocolo_externo?: string | null;
        chave_idempotencia: string;
        situacao_operacao?: string;
        data_solicitacao?: Date;
        data_resposta?: Date | null;
        quantidade_tentativas?: number;
        mensagem_erro?: string | null;
    },
    client: Pick<PrismaClient, "integracaoGoverno"> = prisma
    ) {
        return await client.integracaoGoverno.create({
            data: {
                tipo_operacao: dados.tipo_operacao,
                protocolo_externo: dados.protocolo_externo,
                chave_idempotencia: dados.chave_idempotencia,
                situacao_operacao: dados.situacao_operacao ?? "PENDENTE",
                data_solicitacao: dados.data_solicitacao ?? new Date(),
                data_resposta: dados.data_resposta,
                quantidade_tentativas: dados.quantidade_tentativas ?? 0,
                mensagem_erro: dados.mensagem_erro,

                animal: {
                    connect: {
                        id_animal: dados.id_animal
                    }
                },

                vacina: {
                    connect: {
                        id_vacina: dados.id_vacina
                    }
                }
            }
        });
    }

    // Atualizar resultado de uma integração
    async atualizarIntegracao(id: number, dados: {
        tipo_operacao?: string;
        protocolo_externo?: string | null;
        situacao_operacao?: string;
        data_resposta?: Date | null;
        mensagem_erro?: string | null;
    }) {
        return await prisma.integracaoGoverno.update({
            where: {
                id_integracao: id
            },
            data: dados
        });
    }

    // Registrar uma nova tentativa de envio
    async registrarTentativa(id: number, mensagem_erro?: string | null) {
        return await prisma.integracaoGoverno.update({
            where: {
                id_integracao: id
            },
            data: {
                quantidade_tentativas: {
                    increment: 1
                },
                mensagem_erro: mensagem_erro,
                situacao_operacao: "PENDENTE"
            }
        });
    }

    // Marcar operação como enviada
    async marcarComoEnviada(id: number, protocolo: string) {
        return await prisma.integracaoGoverno.update({
            where: {
                id_integracao: id
            },
            data: {
                situacao_operacao: "ENVIADA",
                protocolo_externo: protocolo,
                data_resposta: new Date(),
                mensagem_erro: null
            }
        });
    }

    // Marcar operação como confirmada
    async marcarComoConfirmada(id: number, protocolo?: string | null) {
        return await prisma.integracaoGoverno.update({
            where: {
                id_integracao: id
            },
            data: {
                situacao_operacao: "CONFIRMADA",
                protocolo_externo: protocolo,
                data_resposta: new Date(),
                mensagem_erro: null
            }
        });
    }

    // Marcar operação como falha
    async marcarComoFalha(id: number, mensagem: string) {
        return await prisma.integracaoGoverno.update({
            where: {
                id_integracao: id
            },
            data: {
                situacao_operacao: "FALHA",
                data_resposta: new Date(),
                mensagem_erro: mensagem
            }
        });
    }
}

export const integracaoGovernoRepository = new IntegracaoGovernoRepository()
