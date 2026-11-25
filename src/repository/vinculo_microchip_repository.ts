
import { prisma } from "@/lib/prisma";

export class VinculoMicrochipRepository {

    // Buscar vínculo pelo ID
    async buscarPorID(id: number) {
        return await prisma.vinculoMicrochip.findUnique({
            where: {
                id_vinculo_microchip: id
            },
            include: {
                animal: true,
                veterinario: true
            }
        });
    }

    // Buscar microchip pelo código
    async buscarPorCodigo(codigo: string) {
        return await prisma.vinculoMicrochip.findUnique({
            where: {
                codigo_microchip: codigo
            },
            include: {
                animal: true,
                veterinario: true
            }
        });
    }

    // Buscar vínculo ativo de um animal
    async buscarAtivoPorAnimal(id_animal: string) {
        return await prisma.vinculoMicrochip.findFirst({
            where: {
                id_animal: id_animal,
                situacao: "ATIVO"
            },
            include: {
                animal: true,
                veterinario: {
                    select: {
                        id_veterinario: true,
                        num_cmrv: true,
                        uf_cmrv: true
                    }
                }
            },
            orderBy: {
                data_vinculacao: "desc"
            }
        });
    }

    // Consultar histórico de microchips de um animal
    async buscarHistoricoPorAnimal(id_animal: string) {
        return await prisma.vinculoMicrochip.findMany({
            where: {
                id_animal: id_animal
            },
            include: {
                veterinario: {
                    select: {
                        id_veterinario: true,
                        num_cmrv: true,
                        uf_cmrv: true
                    }
                }
            },
            orderBy: {
                data_vinculacao: "desc"
            }
        });
    }

    // Listar todos os vínculos
    async buscarTodos() {
        return await prisma.vinculoMicrochip.findMany({
            include: {
                animal: true,
                veterinario: true
            },
            orderBy: {
                data_vinculacao: "desc"
            }
        });
    }

    // Registrar novo vínculo de microchip
    async criar(dados: {
        id_animal: string;
        codigo_microchip: string;
        data_vinculacao?: Date;
        id_veterinario: number;
        situacao?: string;
        data_desvinculacao?: Date | null;
        motivo_substituicao?: string | null;
        observacoes?: string | null;
    }) {
        return await prisma.vinculoMicrochip.create({
            data: {
                codigo_microchip: dados.codigo_microchip,
                data_vinculacao: dados.data_vinculacao ?? new Date(),
                situacao: dados.situacao ?? "ATIVO",
                data_desvinculacao: dados.data_desvinculacao,
                motivo_substituicao: dados.motivo_substituicao,
                observacoes: dados.observacoes,

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

    // Atualizar dados de um vínculo
    async atualizarVinculo(id: number, dados: {
        codigo_microchip?: string;
        situacao?: string;
        data_desvinculacao?: Date | null;
        motivo_substituicao?: string | null;
        observacoes?: string | null;
    }) {
        return await prisma.vinculoMicrochip.update({
            where: {
                id_vinculo_microchip: id
            },
            data: dados
        });
    }

    // Substituir microchip em uma única transação
    async substituir(id: number, dados: {
        id_animal: string;
        codigo_microchip: string;
        id_veterinario: number;
        motivo_substituicao: string;
        observacoes?: string | null;
    }) {
        return await prisma.$transaction(async (tx) => {

            // Inativar o vínculo anterior
            await tx.vinculoMicrochip.update({
                where: {
                    id_vinculo_microchip: id
                },
                data: {
                    situacao: "INATIVO",
                    data_desvinculacao: new Date(),
                    motivo_substituicao: dados.motivo_substituicao
                }
            });

            // Criar o novo vínculo
            return await tx.vinculoMicrochip.create({
                data: {
                    codigo_microchip: dados.codigo_microchip,
                    data_vinculacao: new Date(),
                    situacao: "ATIVO",
                    observacoes: dados.observacoes,
                    motivo_substituicao: dados.motivo_substituicao,

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
        });
    }

    // Desvincular microchip preservando o histórico
    async desvincular(id: number, motivo?: string | null) {
        return await prisma.vinculoMicrochip.update({
            where: {
                id_vinculo_microchip: id
            },
            data: {
                situacao: "INATIVO",
                data_desvinculacao: new Date(),
                motivo_substituicao: motivo
            }
        });
    }
}

export const vinculoMicrochipRepository = new VinculoMicrochipRepository()