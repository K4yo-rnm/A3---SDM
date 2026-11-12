
import { prisma } from "@/lib/prisma";

export class RacaRepository {

    async cadastrar(dados: {
        nome: string;
        descricao?: string | null;
        situacao: string;
        id_especie: number;
    }) {
        return await prisma.raca.create({
            data: {
                nome: dados.nome,
                descricao: dados.descricao,
                situacao: dados.situacao,
                especie: {
                    connect: {
                        id_especie: dados.id_especie
                    }
                }
            }
        });
    }

    async atualizar(id: number, dados: {
        nome?: string;
        descricao?: string | null;
        situacao?: string;
        id_especie?: number;
    }) {
        return await prisma.raca.update({
            where: {
                id_raca: id
            },
            data: {
                nome: dados.nome,
                descricao: dados.descricao,
                situacao: dados.situacao,
                especie: dados.id_especie
                    ? {
                        connect: {
                            id_especie: dados.id_especie
                        }
                    }
                    : undefined
            }
        });
    }

    async inativar(id: number) {
        return await prisma.raca.update({
            where: {
                id_raca: id
            },
            data: {
                situacao: "INATIVO"
            }
        });
    }

    async buscarPorID(id: number) {
        return await prisma.raca.findUnique({
            where: {
                id_raca: id
            },
            include: {
                especie: true
            }
        });
    }

    async listarTodas() {
        return await prisma.raca.findMany({
            include: {
                especie: true
            },
            orderBy: {
                nome: "asc"
            }
        });
    }

    async buscarPorNomeEEspecie(nome: string, id_especie: number) {
        return await prisma.raca.findFirst({
            where: {
                nome: {
                    equals: nome,
                    mode: "insensitive"
                },
                id_especie: id_especie
            }
        });
    }

}

export const racaRepository = new RacaRepository();
