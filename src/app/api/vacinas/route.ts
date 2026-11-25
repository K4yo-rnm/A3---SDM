
import { NextRequest, NextResponse } from "next/server";
import { vacinaService } from "@/service/vacina_services";
import { obterVeterinarioAutenticado } from "@/lib/auth";

// GET - Listar todas as vacinas
export async function GET() {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { mensagem: "Acesso não autorizado. Faça login." },
                { status: 401 }
            );
        }
        const vacinas = await vacinaService.listarTodas();

        return NextResponse.json(
            vacinas,
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro interno ao listar vacinas.";

        return NextResponse.json(
            { erro: mensagem },
            { status: 500 }
        );
    }
}

// POST - Cadastrar aplicação de vacina
export async function POST(request: NextRequest) {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { mensagem: "Acesso não autorizado. Faça login." },
                { status: 401 }
            );
        }
        const dados = await request.json();

        if (!dados.data_aplicacao) {
            return NextResponse.json(
                { erro: "A data de aplicação é obrigatória." },
                { status: 400 }
            );
        }

        const dataAplicacao = new Date(dados.data_aplicacao);

        if (Number.isNaN(dataAplicacao.getTime())) {
            return NextResponse.json(
                { erro: "Data de aplicação inválida." },
                { status: 400 }
            );
        }

        const proximaDose = dados.proxima_dose
            ? new Date(dados.proxima_dose)
            : null;

        const validadeLote = dados.validade_lote
            ? new Date(dados.validade_lote)
            : null;

        if (
            (proximaDose && Number.isNaN(proximaDose.getTime())) ||
            (validadeLote && Number.isNaN(validadeLote.getTime()))
        ) {
            return NextResponse.json(
                { erro: "Data da próxima dose ou validade do lote inválida." },
                { status: 400 }
            );
        }

        const resultado = await vacinaService.cadastrarVacina({
            ...dados,
            id_veterinario: veterinario.id_veterinario,
            data_aplicacao: dataAplicacao,
            proxima_dose: proximaDose,
            validade_lote: validadeLote
        });

        const { vacina, integracao } = resultado;

        return NextResponse.json(
            {
                mensagem: "Vacina registrada com sucesso.",
                vacina,
                integracao
            },
            { status: 201 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro interno ao registrar vacina.";

        const status = mensagem.includes("não encontrado")
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
