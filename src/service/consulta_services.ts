
import { consultaRepository } from "@/repository/consulta_repository";
import { animalRepository } from "@/repository/animal_repository";
import { veterinarioRepository } from "@/repository/veterinario_repository";

export class ConsultaService {

    // Validar animal e veterinário
    private async validarResponsaveis(id_animal: string, id_veterinario: number) {

        const animal = await animalRepository.buscarPorID(id_animal);

        if (!animal) {
            throw new Error("Animal não encontrado.");
        }

        if (animal.situacao !== "ATIVO") {
            throw new Error("Não é possível registrar consulta para um animal inativo.");
        }

        const veterinario = await veterinarioRepository.buscarPorID(id_veterinario);

        if (!veterinario) {
            throw new Error("Veterinário não encontrado.");
        }

        if (veterinario.situacao !== "ATIVO") {
            throw new Error("Veterinário inativo não pode realizar consultas.");
        }

        if (!veterinario.senha_confirmada) {
            throw new Error("O veterinário ainda não confirmou sua senha.");
        }
    }

    // Registrar consulta
    async cadastrarConsulta(dados: {
        id_animal: string;
        id_veterinario: number;
        data_hora: Date;
        motivo_atendimento: string;
        anamnese?: string | null;
        sintomas?: string | null;
        diagnostico?: string | null;
        tratamento_prescrito?: string | null;
        prescricao_medicamentos?: string | null;
        peso_registrado?: number | null;
        temperatura?: number | null;
        observacoes?: string | null;
        situacao?: string;
    }) {

        if (!dados.id_animal || !dados.id_animal.trim()) {
            throw new Error("O animal deve ser informado.");
        }

        if (!Number.isInteger(dados.id_veterinario) || dados.id_veterinario <= 0) {
            throw new Error("Veterinário inválido.");
        }

        if (!dados.motivo_atendimento || !dados.motivo_atendimento.trim()) {
            throw new Error("O motivo do atendimento é obrigatório.");
        }

        if (!(dados.data_hora instanceof Date) || isNaN(dados.data_hora.getTime())) {
            throw new Error("Data e hora da consulta inválidas.");
        }

        if (dados.peso_registrado !== undefined &&
            dados.peso_registrado !== null &&
            dados.peso_registrado <= 0) {
            throw new Error("O peso registrado deve ser maior que zero.");
        }

        if (dados.temperatura !== undefined &&
            dados.temperatura !== null &&
            dados.temperatura <= 0) {
            throw new Error("A temperatura deve ser maior que zero.");
        }

        await this.validarResponsaveis(
            dados.id_animal,
            dados.id_veterinario
        );

        const situacoes = ["AGENDADA", "REALIZADA", "CANCELADA", "NAO_COMPARECEU"];

        const situacao = dados.situacao ?? "AGENDADA";

        if (!situacoes.includes(situacao)) {
            throw new Error("Situação da consulta inválida.");
        }

        return await consultaRepository.criar({
            ...dados,
            motivo_atendimento: dados.motivo_atendimento.trim(),
            situacao
        });
    }

    // Consultar consulta por ID
    async consultarPorID(id: number) {

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID da consulta inválido.");
        }

        const consulta = await consultaRepository.buscarPorID(id);

        if (!consulta) {
            throw new Error("Consulta não encontrada.");
        }

        return consulta;
    }

    // Consultar histórico de um animal
    async consultarHistoricoAnimal(id_animal: string) {

        if (!id_animal || !id_animal.trim()) {
            throw new Error("ID do animal inválido.");
        }

        const animal = await animalRepository.buscarPorID(id_animal);

        if (!animal) {
            throw new Error("Animal não encontrado.");
        }

        return await consultaRepository.buscarPorAnimal(id_animal);
    }

    // Listar consultas
    async listarTodas() {
        return await consultaRepository.buscarTodos();
    }

    // Atualizar consulta
    async atualizarConsulta(id: number, dados: {
        data_hora?: Date;
        motivo_atendimento?: string;
        anamnese?: string | null;
        sintomas?: string | null;
        diagnostico?: string | null;
        tratamento_prescrito?: string | null;
        prescricao_medicamentos?: string | null;
        peso_registrado?: number | null;
        temperatura?: number | null;
        observacoes?: string | null;
        situacao?: string;
    }) {

        await this.consultarPorID(id);

        if (dados.motivo_atendimento !== undefined && !dados.motivo_atendimento.trim()) {
            throw new Error("O motivo do atendimento não pode ficar vazio.");
        }

        if (dados.data_hora !== undefined &&
            (!(dados.data_hora instanceof Date) || isNaN(dados.data_hora.getTime()))) {
            throw new Error("Data e hora da consulta inválidas.");
        }

        if (dados.peso_registrado !== undefined &&
            dados.peso_registrado !== null &&
            dados.peso_registrado <= 0) {
            throw new Error("O peso deve ser maior que zero.");
        }

        if (dados.temperatura !== undefined &&
            dados.temperatura !== null &&
            dados.temperatura <= 0) {
            throw new Error("A temperatura deve ser maior que zero.");
        }

        if (dados.situacao !== undefined) {
            const situacoes = ["AGENDADA", "REALIZADA", "CANCELADA", "NAO_COMPARECEU"];

            if (!situacoes.includes(dados.situacao)) {
                throw new Error("Situação da consulta inválida.");
            }
        }

        return await consultaRepository.atualizarConsulta(id, dados);
    }

    // Cancelar consulta
    async cancelarConsulta(id: number) {

        const consulta = await this.consultarPorID(id);

        if (consulta.situacao === "CANCELADA") {
            throw new Error("Esta consulta já está cancelada.");
        }

        return await consultaRepository.inativarConsulta(id);
    }
}

export const consultaService = new ConsultaService();
