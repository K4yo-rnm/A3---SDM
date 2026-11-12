import { prisma } from "@/lib/prisma";

export class EspecieRepository {

    async cadastrar(dados: {
    nome: string;
    descricao?: string | null;
    situacao: string;
    }) {
        return await prisma.especie.create({
            data: {
                nome: dados.nome,
                descricao: dados.descricao,
                situacao: dados.situacao
            }
        });
    }

    async atualizar(id: number, dados: {
        nome?: string;
        descricao?: string | null;
        situacao?: string;
    }) {
        return await prisma.especie.update({
            where: {
                id_especie: id
            },
            data: dados
        });
    }

    async inativar(id: number) {
        return await prisma.especie.update({
            where: {
                id_especie: id
            },
            data: {
                situacao: "INATIVO"
            }
        });
    }

    async buscarPorID(id: number) {
        return await prisma.especie.findUnique({
            where: {
                id_especie: id
            }
        });
    }

    async listarTodas() {
        return await prisma.especie.findMany({
            orderBy: {
                nome: "asc"
            }
        });
    }

}

export const especieRepository = new EspecieRepository();