
import { NextResponse } from "next/server";
import { animalService } from "@/service/animal_services";

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
                { erro: "ID do animal não informado." },
                { status: 400 }
            );
        }

        const animal = await animalService.consultarPorID(id);

        if (!animal) {
            return NextResponse.json(
                { erro: "Animal não encontrado." },
                { status: 404 }
            );
        }

        return NextResponse.json(animal, { status: 200 });

    } catch (error) {
        console.error("Erro ao consultar animal:", error);

        return NextResponse.json(
            { erro: "Não foi possível consultar o animal." },
            { status: 500 }
        );
    }
}

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

        const animal = await animalService.inativarAnimal(id);

        return NextResponse.json(
            {
                mensagem: "Animal inativado com sucesso.",
                animal
            },
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Não foi possível inativar o animal.";

        const status = mensagem === "Animal não encontrado."
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
                { message: "ID do animal não informado" },
                { status: 400 }
            );
        }

        const animal = await animalService.atualizarAnimal(id, dados)

        return NextResponse.json(
            {
                message: "Animal alterado com sucesso",
                animal
            },
            { status: 200 }
        )

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Não foi possível alterar o animal"
        
        return NextResponse.json(
            { erro: mensagem },
            {status: 400}
        )
    }
}