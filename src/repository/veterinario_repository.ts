
import { prisma } from "@/lib/prisma";

export class VeterinarioRepository {

    //Buscar veterinario por nome
    async buscarPorNome(nome: string) {
        return await prisma.veterinario.findFirst({
            where: {
                nome_completo: {
                    equals: nome,
                }
            }
        });
    }

    // Buscar veterinário pelo ID
    async buscarPorID(id: number) {
        return await prisma.veterinario.findUnique({
            where: {
                id_veterinario: id
            }
        });
    }

    // Buscar veterinário pelo CPF
    async buscarPorCPF(cpf: string) {
        return await prisma.veterinario.findFirst({
            where: {
                cpf: cpf
            }
        });
    }

    // Buscar veterinário pelo e-mail
    async buscarPorEmail(email: string) {
        return await prisma.veterinario.findFirst({
            where: {
                email: email
            }
        });
    }

    // Cadastrar veterinário
    async criar(dados: {
        nome_completo: string;
        cpf: string;
        num_cmrv: string;
        uf_cmrv: string;
        email: string;
        telefone: string;
        hash_senha: string;
        senha_confirmada?: boolean;
        data_confirmacao?: Date | null;
        data_cadastro?: Date | null;
        situacao?: string;
        ultimo_acesso?: Date | null;
    }) {
        return await prisma.veterinario.create({
            data: {
                nome_completo: dados.nome_completo,
                cpf: dados.cpf,
                num_cmrv: dados.num_cmrv,
                uf_cmrv: dados.uf_cmrv,
                email: dados.email,
                telefone: dados.telefone,
                hash_senha: dados.hash_senha,
                senha_confirmada: dados.senha_confirmada ?? false,
                data_confirmacao: dados.data_confirmacao,
                data_cadastro: dados.data_cadastro ?? new Date(),
                situacao: dados.situacao ?? "ATIVO",
                ultimo_acesso: dados.ultimo_acesso
            }
        });
    }

    // Listar todos os veterinários
    async buscarTodos() {
        return await prisma.veterinario.findMany({
            orderBy: {
                id_veterinario: "asc"
            }
        });
    }

    // Atualizar dados do veterinário
    async atualizarVeterinario(id: number, dados: {
        nome_completo?: string;
        cpf?: string;
        num_cmrv?: string;
        uf_cmrv?: string;
        email?: string;
        telefone?: string;
        hash_sevha?: string;
        senha_confirmada?: boolean;
        data_confirmacao?: Date | null;
        situacao?: string;
        ultimo_acesso?: Date | null;
    }) {
        return await prisma.veterinario.update({
            where: {
                id_veterinario: id
            },
            data: dados
        });
    }

    // Inativar veterinário
    async inativarVeterinario(id: number) {
        return await prisma.veterinario.update({
            where: {
                id_veterinario: id
            },
            data: {
                situacao: "INATIVO"
            }
        });
    }
}

export const veterinarioRepository = new VeterinarioRepository()