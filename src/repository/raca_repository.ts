
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
        const racas = await prisma.raca.findMany({
            where: {
                id_especie: id_especie
            }
        });

        const nomeNormalizado = nome.trim().toLocaleLowerCase("pt-BR")

        return racas.find(
            (raca) => raca.nome.trim().toLocaleLowerCase("pt-BR") === nomeNormalizado
        ) ?? null
    }

    //Temporario
    async deletarPorID(id: number) {
        return await prisma.raca.delete({
            where: {
                id_raca: id
            },
            include: {
                especie: true
            }
        });
    }
}

export const racaRepository = new RacaRepository();
