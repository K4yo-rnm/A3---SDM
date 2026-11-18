
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@/generated/prisma/client";

export class VacinaRepository {

    // Buscar vacina pelo ID
    async buscarPorID(id: number) {
        return await prisma.vacina.findUnique({
            where: {
                id_vacina: id
            },
            include: {
                animal: true,
                veterinario: true,
                integracoes: true
            }
        });
    }

    // Buscar todas as vacinas de um animal
    async buscarPorAnimal(id_animal: string) {
        return await prisma.vacina.findMany({
            where: {
                id_animal: id_animal
            },
            include: {
                veterinario: true,
                integracoes: true
            },
            orderBy: {
                data_aplicacao: "desc"
            }
        });
    }

    // Listar todas as vacinas
    async buscarTodos() {
        return await prisma.vacina.findMany({
            include: {
                animal: true,
                veterinario: true
            },
            orderBy: {
                data_aplicacao: "desc"
            }
        });
    }

    // Cadastrar aplicação de vacina
    async criar(dados: {
        id_animal: string;
        id_veterinario: number;
        nome_vacina: string;
        tipo_vacina: string;
        antirrabica: boolean;
        fabricante: string;
        numero_lote: string;
        data_aplicacao: Date;
        dose_esquema: string;
        via_aplicacao: string;
        proxima_dose?: Date | null;
        validade_lote?: Date | null;
        observacoes?: string | null;
        situacao?: string;
    },
        client: Pick<PrismaClient, "vacina"> = prisma
    ) {
        return await client.vacina.create({
            data: {
                nome_vacina: dados.nome_vacina,
                tipo_vacina: dados.tipo_vacina,
                antirrabica: dados.antirrabica,
                fabricante: dados.fabricante,
                numero_lote: dados.numero_lote,
                data_aplicacao: dados.data_aplicacao,
                dose_esquema: dados.dose_esquema,
                via_aplicacao: dados.via_aplicacao,
                proxima_dose: dados.proxima_dose,
                validade_lote: dados.validade_lote,
                observacoes: dados.observacoes,
                situacao: dados.situacao ?? "APLICADA",

                animal: {
                    connect: {
                        id_animal: dados.id_animal
                    }
                },

                veterinario: {
                    connect: {
                        id_veterinario: dados.id_veterinario
                    }
                }
            }
        });
    }

    // Atualizar dados da vacinação
    async atualizarVacina(id: number, dados: {
        nome_vacina?: string;
        tipo_vacina?: string;
        antirrabica?: boolean;
        fabricante?: string;
        numero_lote?: string;
        data_aplicacao?: Date;
        dose_esquema?: string;
        via_aplicacao?: string;
        proxima_dose?: Date | null;
        validade_lote?: Date | null;
        observacoes?: string | null;
        situacao?: string;
    }) {
        return await prisma.vacina.update({
            where: {
                id_vacina: id
            },
            data: dados
        });
    }

    // Inativar registro de vacinação
    async inativarVacina(id: number) {
        return await prisma.vacina.update({
            where: {
                id_vacina: id
            },
            data: {
                situacao: "CANCELADA"
            }
        });
    }
}

export const vacinaRepository = new VacinaRepository()
