
import { NextResponse } from "next/server";
import { animalService } from "@/service/animal_services";

export async function GET() {
    try {
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
