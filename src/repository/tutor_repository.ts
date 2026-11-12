import { prisma } from '@/lib/prisma'

export class TutorRepository{
    //Verificar CPF já cadastadro
    async buscaPorCPF(cpf: string) {
        return await prisma.tutor.findUnique({
            where: {
                cpf,
            },
        });
    }
    
    async criar(dados: {
        nome_completo: string,
        cpf: string,
        data_nascimento?: Date | null;
        email?: string | null;
        telefone?: string | null;
        enderecos: {
            cep: string;
            logradouro: string;
            numero: string;
            complemento?: string | null;
            bairro: string;
            cidade: string;
            uf: string;
            id_ibge_municipio?: string | null;
        }[];
    }) {
        return await prisma.tutor.create({
            data: {
                nome_completo: dados.nome_completo,
                cpf: dados.cpf,
                data_nascimento: dados.data_nascimento,
                email: dados.email,
                telefone: dados.telefone,
                situacao: "ATIVO",
                enderecos: {
                    create: dados.enderecos,
                },
            },
            include: {
                enderecos: true,
            },
        });
    }

    async bucarPorID(id: number) {
        return await prisma.tutor.findUnique({
            where: {
                id_tutor: id,
            },
                include: {
                    enderecos: true,
                },
        });
    }

    async bucarTodods() {
        return await prisma.tutor.findMany({
            include: {
                enderecos: true,
            },
            orderBy: {
                id_tutor: "asc",
            },
        });
    }
    
    //Não Usar
    async deletarPorId(id: number) {
        return await prisma.tutor.delete({
            where: {
                id_tutor: id,
            },
        });
    }
}

export const tutorRepository = new TutorRepository();