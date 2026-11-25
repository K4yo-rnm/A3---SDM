'use service'

import { createHash } from "node:crypto";

import { animalRepository } from "@/repository/animal_repository";
import { tutorRepository } from "@/repository/tutor_repository";
import { especieRepository } from "@/repository/especie_repository";
import { racaRepository } from "@/repository/raca_repository";
import { vinculoMicrochipRepository } from "@/repository/vinculo_microchip_repository";

import {
    atualizarAnimalGoverno
} from "@/service/governo_service";

import {
    integracaoGovernoService
} from "@/service/integracao_governo_service";

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

        // 1. Atualiza primeiro o banco local.
        const animalAtualizado = await animalRepository.atualizarAnimal(
            id,
            dadosTratados
        );

        // 2. Busca os dados completos do animal atualizado.
        try {
            const animalCompleto = await animalRepository.buscarPorID(id);

            if (!animalCompleto) {
                throw new Error("Animal não encontrado após a atualização.");
            }

            // 3. Verifica se existe microchip ativo.
            const vinculo = await vinculoMicrochipRepository.buscarAtivoPorAnimal(id);

            // Sem microchip ativo, não há cadastro para sincronizar.
            if (!vinculo) {
                return animalAtualizado;
            }

            const dadosGoverno = {
                nome: animalCompleto.nome,
                data_nascimento: animalCompleto.data_nascimento
                    ? new Date(animalCompleto.data_nascimento).toISOString().slice(0, 10)
                    : null,
                idade_estimada: animalCompleto.idade_estimada,
                sexo: animalCompleto.sexo === "MACHO"
                    ? "M"
                    : animalCompleto.sexo === "FEMEA"
                        ? "F"
                        : null,
                cor: animalCompleto.cor,
                peso_atual: animalCompleto.peso_atual !== null
                    ? Number(animalCompleto.peso_atual)
                    : null,
                especie: animalCompleto.especie.nome,
                raca: animalCompleto.raca?.nome ?? null
            };

            // 4. Gera uma chave estável para os mesmos dados.
            const hashDados = createHash("sha256")
                .update(JSON.stringify(dadosGoverno))
                .digest("hex");

            const chaveIdempotencia =
                `ATUALIZACAO_ANIMAL_${id}_${vinculo.codigo_microchip}_${hashDados}`;

            // 5. Registra ou recupera a operação de integração.
            const integracao = await integracaoGovernoService.registrarIntegracaoAnimal({
                id_animal: id,
                tipo_operacao: "ATUALIZACAO_ANIMAL",
                chave_idempotencia: chaveIdempotencia
            });

            // Não envia novamente uma operação já confirmada.
            if (integracao.situacao_operacao !== "CONFIRMADA") {
                try {
                    // 6. Envia a atualização para a API governamental.
                    const resposta = await atualizarAnimalGoverno(
                        vinculo.codigo_microchip,
                        dadosGoverno
                    );

                    // 7. Confirma a integração.
                    await integracaoGovernoService.confirmarIntegracao(
                        integracao.id_integracao,
                        resposta.protocolo
                    );
                } catch (erro) {
                    const mensagem = erro instanceof Error
                        ? erro.message
                        : "Erro desconhecido na integração governamental.";

                    await integracaoGovernoService.registrarTentativa(
                        integracao.id_integracao,
                        mensagem
                    );

                    console.error(
                        "Falha ao atualizar animal na API governamental:",
                        mensagem
                    );
                }
            }
        } catch (erro) {
            console.error(
                "Erro ao processar integração do animal:",
                erro
            );
        }

        // 8. Mantém o resultado da atualização local.
        return animalAtualizado;
    }

    async inativarAnimal(id: string) {
        if (!id || !id.trim()) {
            throw new Error("ID do animal inválido.");
        }

        const animal = await animalRepository.buscarPorID(id);

        if (!animal) {
            throw new Error("Animal não encontrado.");
        }

        if (animal.situacao === "INATIVO") {
            throw new Error("Este animal já está inativo.");
        }

        return await animalRepository.inativarAnimal(id);
    }
}

export const animalService = new AnimalService();
