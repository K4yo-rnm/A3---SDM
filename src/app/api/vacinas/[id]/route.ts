
import { NextRequest, NextResponse } from "next/server";
import { vacinaService } from "@/service/vacina_services";

// GET - Consultar vacina por ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idVacina = Number(id);

        if (!Number.isInteger(idVacina) || idVacina <= 0) {
            return NextResponse.json(
                { erro: "ID da vacina inválido." },
                { status: 400 }
            );
        }

        const vacina = await vacinaService.consultarPorID(idVacina);

        return NextResponse.json(vacina, { status: 200 });

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar vacina.";

        const status = mensagem.includes("não encontrada")
            || mensagem.includes("não encontrado")
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}

// PUT - Atualizar vacina
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idVacina = Number(id);

        if (!Number.isInteger(idVacina) || idVacina <= 0) {
            return NextResponse.json(
                { erro: "ID da vacina inválido." },
                { status: 400 }
            );
        }

        const dados = await request.json();

        if (dados.data_aplicacao !== undefined) {
            dados.data_aplicacao = new Date(dados.data_aplicacao);

            if (Number.isNaN(dados.data_aplicacao.getTime())) {
                return NextResponse.json(
                    { erro: "Data de aplicação inválida." },
                    { status: 400 }
                );
            }
        }

        if (dados.proxima_dose !== undefined) {
            dados.proxima_dose = dados.proxima_dose
                ? new Date(dados.proxima_dose)
                : null;

            if (
                dados.proxima_dose &&
                Number.isNaN(dados.proxima_dose.getTime())
            ) {
                return NextResponse.json(
                    { erro: "Data da próxima dose inválida." },
                    { status: 400 }
                );
            }
        }

        if (dados.validade_lote !== undefined) {
            dados.validade_lote = dados.validade_lote
                ? new Date(dados.validade_lote)
                : null;

            if (
                dados.validade_lote &&
                Number.isNaN(dados.validade_lote.getTime())
            ) {
                return NextResponse.json(
                    { erro: "Data de validade do lote inválida." },
                    { status: 400 }
                );
            }
        }

        const vacina = await vacinaService.atualizarVacina(
            idVacina,
            dados
        );

        return NextResponse.json(
            {
                mensagem: "Vacina atualizada com sucesso.",
                vacina
            },
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao atualizar vacina.";

        const status = mensagem.includes("não encontrada")
            || mensagem.includes("não encontrado")
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}

// DELETE - Cancelar registro de vacinação
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idVacina = Number(id);

        if (!Number.isInteger(idVacina) || idVacina <= 0) {
            return NextResponse.json(
                { erro: "ID da vacina inválido." },
                { status: 400 }
            );
        }

        const resultado = await vacinaService.cancelarVacina(idVacina);

        return NextResponse.json(
            {
                mensagem: "Registro de vacinação cancelado com sucesso.",
                resultado
            },
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao cancelar vacinação.";

        const status = mensagem.includes("não encontrada")
            || mensagem.includes("não encontrado")
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
