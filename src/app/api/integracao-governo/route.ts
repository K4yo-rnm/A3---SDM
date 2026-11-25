
import { NextRequest, NextResponse } from "next/server";
import { integracaoGovernoService } from "@/service/integracao_governo_service";
import { obterVeterinarioAutenticado } from "@/lib/auth";

// GET - Listar todas as integrações governamentais
export async function GET() {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { erro: "Acesso não autorizado. Faça login." },
                { status: 401 }
            );
        }
        const integracoes = await integracaoGovernoService.listarTodas();

        return NextResponse.json(
            integracoes,
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao listar integrações governamentais.";

        return NextResponse.json(
            { erro: mensagem },
            { status: 500 }
        );
    }
}

// POST - Registrar uma operação de integração
export async function POST(request: NextRequest) {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { erro: "Acesso não autorizado. Faça login." },
                { status: 401 }
            );
        }
        const dados = await request.json();

        if (
            typeof dados.id_animal !== "string" ||
            !dados.id_animal.trim()
        ) {
            return NextResponse.json(
                { erro: "O ID do animal é obrigatório." },
                { status: 400 }
            );
        }

        const idVacina = Number(dados.id_vacina);

        if (!Number.isInteger(idVacina) || idVacina <= 0) {
            return NextResponse.json(
                { erro: "ID da vacina inválido." },
                { status: 400 }
            );
        }

        if (
            typeof dados.tipo_operacao !== "string" ||
            !dados.tipo_operacao.trim()
        ) {
            return NextResponse.json(
                { erro: "O tipo de operação é obrigatório." },
                { status: 400 }
            );
        }

        if (
            typeof dados.chave_idempotencia !== "string" ||
            !dados.chave_idempotencia.trim()
        ) {
            return NextResponse.json(
                { erro: "A chave de idempotência é obrigatória." },
                { status: 400 }
            );
        }

        const integracao =
            await integracaoGovernoService.registrarIntegracao({
                id_animal: dados.id_animal.trim(),
                id_vacina: idVacina,
                tipo_operacao: dados.tipo_operacao.trim(),
                chave_idempotencia: dados.chave_idempotencia.trim()
            });

        return NextResponse.json(
            {
                mensagem: "Operação de integração registrada com sucesso.",
                integracao
            },
            { status: 201 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao registrar integração governamental.";

        const status = mensagem.includes("não encontrado")
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
