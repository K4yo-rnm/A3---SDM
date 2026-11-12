import { prisma } from "@/lib/prisma"

export class AnimalRepository{

    async cadastrarAnimal(dados: {
        nome: string;
        data_nascimento?: Date | null;
        idade_estimada?: number | null;
        sexo?: string | null;
        cor?: string | null;
        peso_atual?: number | null;
        id_tutor: number;
        id_especie: number;
        id_raca?: number | null;
        situacao: string;
    }) {
        return await prisma.animal.create({
            data: {
                nome: dados.nome,
                data_nascimento: dados.data_nascimento,
                idade_estimada: dados.idade_estimada,
                sexo: dados.sexo,
                cor: dados.cor,
                peso_atual: dados.peso_atual,
                situacao: dados.situacao,

                tutor: {
                    connect: {
                        id_tutor: dados.id_tutor
                    }
                },

                especie: {
                    connect: {
                        id_especie: dados.id_especie
                    }
                },

                raca: dados.id_raca
                    ? {
                        connect: {
                            id_raca: dados.id_raca
                        }
                    }
                    : undefined
            }
        });
    }

    async buscarPorID(id: string) {
        return await prisma.animal.findUnique({
            where: {
                id_animal: id
            },
            include: {
                tutor: true,
                especie: true,
                raca: true
            }
        });
    }

    async listarTodos() {
        return await prisma.animal.findMany({
            include: {
                tutor: true,
                especie: true,
                raca: true
            },
            orderBy: {
                nome: "asc"
            }
        });
    }

    async atualizarAnimal(id: string, dados: {
        nome?: string;
        data_nascimento?: Date | null;
        idade_estimada?: number | null;
        sexo?: string | null;
        cor?: string | null;
        peso_atual?: number | null;
        id_tutor?: number;
        id_especie?: number;
        id_raca?: number | null;
        situacao?: string;
    }) {
        return await prisma.animal.update({
            where: {
                id_animal: id
            },
            data: {
                nome: dados.nome,
                data_nascimento: dados.data_nascimento,
                idade_estimada: dados.idade_estimada,
                sexo: dados.sexo,
                cor: dados.cor,
                peso_atual: dados.peso_atual,
                situacao: dados.situacao,

                tutor: dados.id_tutor !== undefined
                    ? {
                        connect: {
                            id_tutor: dados.id_tutor
                        }
                    }
                    : undefined,

                especie: dados.id_especie !== undefined
                    ? {
                        connect: {
                            id_especie: dados.id_especie
                        }
                    }
                    : undefined,

                raca: dados.id_raca !== undefined
                    ? dados.id_raca === null
                        ? { disconnect: true }
                        : {
                            connect: {
                                id_raca: dados.id_raca
                            }
                        }
                    : undefined
            }
        });
    }

}

export const animalRepository = new AnimalRepository()