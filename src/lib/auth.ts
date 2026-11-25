
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const obterChaveSecreta = () => {
    const segredo = process.env.JWT_SECRET;

    if (!segredo) {
        throw new Error("JWT_SECRET não configurado.");
    }

    return new TextEncoder().encode(segredo);
};

export async function gerarToken(idVeterinario: number) {
    return await new SignJWT({
        id_veterinario: idVeterinario,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(obterChaveSecreta());
}

export async function validarToken(token: string) {
    try {
        const { payload } = await jwtVerify(
            token,
            obterChaveSecreta()
        );

        if (typeof payload.id_veterinario !== "number") {
            return null;
        }

        return {
            id_veterinario: payload.id_veterinario,
        };
    } catch {
        return null;
    }
}

export async function obterVeterinarioAutenticado() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return null;
    }

    const sessao = await validarToken(token);

    if (!sessao) {
        return null;
    }

    const veterinario = await prisma.veterinario.findUnique({
        where: {
            id_veterinario: sessao.id_veterinario,
        },
        select: {
            id_veterinario: true,
            email: true,
            situacao: true,
            senha_confirmada: true,
        },
    });

    if (
        !veterinario ||
        veterinario.situacao !== "ATIVO" ||
        !veterinario.senha_confirmada
    ) {
        return null;
    }

    return {
        id_veterinario: veterinario.id_veterinario,
        email: veterinario.email,
    };
}

export async function gerarTokenConfirmacao(idVeterinario: number) {
    return await new SignJWT({
        id_veterinario: idVeterinario,
        finalidade: "confirmacao_senha",
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(obterChaveSecreta());
}

export async function validarTokenConfirmacao(token: string) {
    try {
        const { payload } = await jwtVerify(
            token,
            obterChaveSecreta()
        );

        if (
            typeof payload.id_veterinario !== "number" ||
            payload.finalidade !== "confirmacao_senha"
        ) {
            return null;
        }

        return {
            id_veterinario: payload.id_veterinario,
        };
    } catch {
        return null;
    }
}
