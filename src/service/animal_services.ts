'use service'


import { animalRepository } from "@/repository/animal_repository";
import { tutorRepository } from "@/repository/tutor_repository";
import { especieRepository } from "@/repository/especie_repository";
import { racaRepository } from "@/repository/raca_repository";

export class AnimalService {

    async cadastrarAnimal(dados: {
        nome: string;
        data_nascimento?: Date | null;
        idade_estimada?: number | null;
        sexo?: string | null;
        cor?: string | null;
        peso_atual?: number | null;
        id_tutor: number;
        id_especie: number;
        id_raca?: number | null;
        situacao?: string;
    }) {

        //Validar o nome
        if (!dados.nome || !dados.nome.trim()) {
            throw new Error("O nome do animal é obrigatório.");
        }

        //Validar o tutor
        if (!dados.id_tutor || dados.id_tutor <= 0) {
            throw new Error("Um tutor válido deve ser informado.");
        }

        const tutor = await tutorRepository.bucarPorID(dados.id_tutor);

        if (!tutor) {
            throw new Error("Tutor não encontrado.");
        }

        if (tutor.situacao !== "ATIVO") {
            throw new Error("Não é possível cadastrar animal para um tutor inativo.");
        }

        //Validar a espécie
        if (!dados.id_especie || dados.id_especie <= 0) {
            throw new Error("Uma espécie válida deve ser informada.");
        }

        const especie = await especieRepository.buscarPorID(dados.id_especie);

        if (!especie) {
            throw new Error("Espécie não encontrada.");
        }

        if (especie.situacao !== "ATIVO") {
            throw new Error("Não é possível cadastrar animal com espécie inativa.");
        }

        //Validar a raça, quando informada
        if (dados.id_raca !== undefined && dados.id_raca !== null) {

            if (dados.id_raca <= 0) {
                throw new Error("Raça inválida.");
            }

            const raca = await racaRepository.buscarPorID(dados.id_raca);

            if (!raca) {
                throw new Error("Raça não encontrada.");
            }

            if (raca.situacao !== "ATIVO") {
                throw new Error("Não é possível cadastrar animal com raça inativa.");
            }

            if (raca.id_especie !== dados.id_especie) {
                throw new Error("A raça selecionada não pertence à espécie informada.");
            }
        }

        // 5. Validar o peso
        if (dados.peso_atual !== undefined &&
            dados.peso_atual !== null &&
            dados.peso_atual < 0) {
            throw new Error("O peso não pode ser negativo.");
        }

        //Preparar os dados para o cadastro
        const dadosTratados = {
            ...dados,
            nome: dados.nome.trim(),
            situacao: dados.situacao ?? "ATIVO"
        };

        //Cadastrar o animal
        return await animalRepository.cadastrarAnimal(dadosTratados);
    }

        async consultarPorID(id: string) {
        if (!id || !id.trim()) {
            throw new Error("ID do animal inválido.");
        }

        const animal = await animalRepository.buscarPorID(id);

        if (!animal) {
            throw new Error("Animal não encontrado.");
        }

        return animal;
    }

    async listarTodos() {
        return await animalRepository.listarTodos();
    }

    async atualizarAnimal(id: string, dados: {
        nome?: string;
        data_nascimento?: Date | null;
        idade_estimada?: number | null;
        sexo?: string | null;
        cor?: string | null;
        peso_atual?: number | null;
        id_tutor?: number;
        id_especie?: number;
        id_raca?: number | null;
        situacao?: string;
    }) {
        if (!id || !id.trim()) {
            throw new Error("ID do animal inválido.");
        }

        const animal = await animalRepository.buscarPorID(id);

        if (!animal) {
            throw new Error("Animal não encontrado.");
        }

        if (dados.nome !== undefined && !dados.nome.trim()) {
            throw new Error("O nome do animal não pode ficar vazio.");
        }

        if (dados.peso_atual !== undefined && dados.peso_atual !== null && dados.peso_atual < 0) {
            throw new Error("O peso não pode ser negativo.");
        }

        const idTutor = dados.id_tutor ?? animal.id_tutor;
        const idEspecie = dados.id_especie ?? animal.id_especie;
        const idRaca = dados.id_raca !== undefined
            ? dados.id_raca
            : animal.id_raca;

        if (dados.id_tutor !== undefined) {
            const tutor = await tutorRepository.bucarPorID(idTutor);

            if (!tutor) {
                throw new Error("Tutor não encontrado.");
            }

            if (tutor.situacao !== "ATIVO") {
                throw new Error("Não é possível vincular o animal a um tutor inativo.");
            }
        }

        if (dados.id_especie !== undefined) {
            const especie = await especieRepository.buscarPorID(idEspecie);

            if (!especie) {
                throw new Error("Espécie não encontrada.");
            }

            if (especie.situacao !== "ATIVO") {
                throw new Error("Não é possível vincular o animal a uma espécie inativa.");
            }
        }

        if (idRaca !== null && idRaca !== undefined) {
            const raca = await racaRepository.buscarPorID(idRaca);

            if (!raca) {
                throw new Error("Raça não encontrada.");
            }

            if (raca.situacao !== "ATIVO") {
                throw new Error("Não é possível vincular o animal a uma raça inativa.");
            }

            if (raca.id_especie !== idEspecie) {
                throw new Error("A raça selecionada não pertence à espécie informada.");
            }
        }

        const dadosTratados = {
            ...dados,
            nome: dados.nome?.trim()
        };

        return await animalRepository.atualizarAnimal(id, dadosTratados);
    }

}

export const animalService = new AnimalService();
