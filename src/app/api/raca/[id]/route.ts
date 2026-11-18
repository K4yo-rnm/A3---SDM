import { NextResponse } from "next/server";
import { racaService } from "@/service/raca_services";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(
    request: Request,
    { params }: RouteContext
) {
    try {
        const { id } = await params;

        if (!id || !id.trim()) {
            return NextResponse.json(
                { message: "ID da raça não informado" },
                { status: 400 }
            );
        }

        const id_number = Number(id)

        const raca = await racaService.consultarPorID(id_number)

        if (!raca) {
            return NextResponse.json(
                { erro: "Raca não encontrada" },
                {status: 404}
            )
        }

        return NextResponse.json(raca, {status: 200})

    } catch (error) {
        console.error("Erro ao consultar + ", error)

        return NextResponse.json(
            { erro: "Não foi possivel consultar Raça" },
            { status: 500 }
        );
    }
}

//Temporario
export async function DELETE(
    request: Request,
    { params }: RouteContext
) {
    try {
        const { id } = await params;
        if (!id || !id.trim()) {
            return NextResponse.json(
                { erro: "ID do animal não informado." },
                { status: 400 }
            );
        }

        const id_number = Number(id)
        const raca = racaService.inativar(id_number)

        return NextResponse.json(
            {
                mensagem: "Raca INATIVADA com sucesso.",
                raca
            },
            { status: 200 }
        );
    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Não foi possível inativar o raça.";

        const status = mensagem === "raça não encontrada."
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }

}

export async function PUT(
    request: Request,
    { params }: RouteContext 
) {
    try {
        const { id } = await params;
        const dados = await request.json()

        if (!id || !id.trim()) {
            return NextResponse.json(
                { message: "ID da raça não informado" },
                { status: 400 }
            );
        }

        const id_number = Number(id)

        const raca = await racaService.atualizar(id_number, dados)

        return NextResponse.json(
            {
                message: "Raça alterado com sucesso",
                raca
            },
            { status: 200 }
        )

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Não foi possível alterar a raça"
        
        return NextResponse.json(
            { erro: mensagem },
            {status: 400}
        )
    }
}