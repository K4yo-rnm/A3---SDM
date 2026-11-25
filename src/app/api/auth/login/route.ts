
import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/service/auth_services";
import { gerarToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const dados = await request.json();

        const { email, senha } = dados;

        if (
            typeof email !== "string" ||
            typeof senha !== "string" ||
            !email.trim() ||
            !senha
        ) {
            return NextResponse.json(
                { mensagem: "Informe o e-mail e a senha." },
                { status: 400 }
            );
        }

        const veterinario = await authService.autenticarVeterinario(
            email,
            senha
        );

        const token = await gerarToken(
            veterinario.id_veterinario
        );

        const resposta = NextResponse.json({
            mensagem: "Login realizado com sucesso.",
            veterinario,
        });

        resposta.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 8,
        });

        return resposta;

    } catch (erro) {
        const mensagem = erro instanceof Error
            ? erro.message
            : "Erro interno ao realizar login.";

        const errosDeAutenticacao = [
            "E-mail ou senha inválidos.",
            "Acesso bloqueado. Veterinário inativo.",
            "É necessário confirmar a senha antes de acessar.",
            "E-mail e senha são obrigatórios.",
        ];

        if (errosDeAutenticacao.includes(mensagem)) {
            return NextResponse.json(
                { mensagem },
                { status: 401 }
            );
        }

        console.error("Erro no login:", erro);

        return NextResponse.json(
            { mensagem: "Erro interno ao realizar login." },
            { status: 500 }
        );
    }
}
