
import { NextResponse } from "next/server";
import { animalService } from "@/service/animal_services";
import { obterVeterinarioAutenticado } from "@/lib/auth";

export async function GET() {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { mensagem: "Acesso não autorizado. Faça login." },
                { status: 401 }
            );
        }
        const animais = await animalService.listarTodos();

        return NextResponse.json(animais, {
            status: 200
        });
    } catch (error) {
        console.error("Erro ao listar animais:", error);

        return NextResponse.json(
            { erro: "Não foi possível listar os animais." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { mensagem: "Acesso não autorizado. Faça login." },
                { status: 401 }
            );
        }
        const dados = await request.json()

        const animal = await animalService.cadastrarAnimal(dados)

        return NextResponse.json({
            message: "Animal cadastrado com sucesso",
            animal
        },
        { status: 201}
        )
        
    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Não foi possivél cadastrar Animal"
        
        return NextResponse.json(
            { erro: mensagem },
            { status: 400 }
        );
    }
}
