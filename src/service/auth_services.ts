
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

class AuthService {
    async autenticarVeterinario(email: string, senha: string) {
        const emailNormalizado = email.trim().toLowerCase();

        if (!emailNormalizado || !senha) {
            throw new Error("E-mail e senha são obrigatórios.");
        }

        const veterinario = await prisma.veterinario.findFirst({
            where: {
                email: emailNormalizado,
            },
        });

        if (!veterinario) {
            throw new Error("E-mail ou senha inválidos.");
        }

        const senhaValida = await compare(
            senha,
            veterinario.hash_senha
        );

        if (!senhaValida) {
            throw new Error("E-mail ou senha inválidos.");
        }

        if (veterinario.situacao !== "ATIVO") {
            throw new Error("Acesso bloqueado. Veterinário inativo.");
        }

        if (!veterinario.senha_confirmada) {
            throw new Error("É necessário confirmar a senha antes de acessar.");
        }

        await prisma.veterinario.update({
            where: {
                id_veterinario: veterinario.id_veterinario,
            },
            data: {
                ultimo_acesso: new Date(),
            },
        });

        return {
            id_veterinario: veterinario.id_veterinario,
            email: veterinario.email,
        };
    }
}

export const authService = new AuthService();
