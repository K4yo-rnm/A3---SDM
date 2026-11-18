
import { integracaoGovernoRepository } from "@/repository/integracao_governo_repository";
import { animalRepository } from "@/repository/animal_repository";
import { vacinaRepository } from "@/repository/vacina_repository";

export class IntegracaoGovernoService {

    // Registrar operação de integração
    async registrarIntegracao(dados: {
        id_animal: string;
        id_vacina: number;
        tipo_operacao: string;
        chave_idempotencia: string;
    }) {

        if (!dados.id_animal || !dados.id_animal.trim()) {
            throw new Error("O animal deve ser informado.");
        }

        if (!Number.isInteger(dados.id_vacina) || dados.id_vacina <= 0) {
            throw new Error("Vacina inválida.");
        }

        if (!dados.tipo_operacao || !dados.tipo_operacao.trim()) {
            throw new Error("O tipo de operação é obrigatório.");
        }

        if (!dados.chave_idempotencia || !dados.chave_idempotencia.trim()) {
            throw new Error("A chave de idempotência é obrigatória.");
        }

        const animal = await animalRepository.buscarPorID(dados.id_animal);

        if (!animal) {
            throw new Error("Animal não encontrado.");
        }

        const vacina = await vacinaRepository.buscarPorID(dados.id_vacina);

        if (!vacina) {
            throw new Error("Vacina não encontrada.");
        }

        if (vacina.id_animal !== dados.id_animal) {
            throw new Error("A vacina informada não pertence ao animal selecionado.");
        }

        if (!vacina.antirrabica || vacina.situacao !== "APLICADA") {
            throw new Error("Somente vacinas antirrábicas aplicadas podem gerar esta integração.");
        }

        const integracaoExistente =
            await integracaoGovernoRepository.buscarPorChaveIdempotencia(
                dados.chave_idempotencia.trim()
            );

        if (integracaoExistente) {
            return integracaoExistente;
        }

        return await integracaoGovernoRepository.criar({
            id_animal: dados.id_animal,
            id_vacina: dados.id_vacina,
            tipo_operacao: dados.tipo_operacao.trim(),
            chave_idempotencia: dados.chave_idempotencia.trim(),
            situacao_operacao: "PENDENTE",
            data_solicitacao: new Date(),
            quantidade_tentativas: 0
        });
    }

    // Consultar integração pelo ID
    async consultarPorID(id: number) {

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID da integração inválido.");
        }

        const integracao = await integracaoGovernoRepository.buscarPorID(id);

        if (!integracao) {
            throw new Error("Integração não encontrada.");
        }

        return integracao;
    }

    // Consultar operação pela chave de idempotência
    async consultarPorChave(chave: string) {

        if (!chave || !chave.trim()) {
            throw new Error("Chave de idempotência inválida.");
        }

        const integracao =
            await integracaoGovernoRepository.buscarPorChaveIdempotencia(
                chave.trim()
            );

        if (!integracao) {
            throw new Error("Operação de integração não encontrada.");
        }

        return integracao;
    }

    // Consultar integrações de um animal
    async consultarPorAnimal(id_animal: string) {

        if (!id_animal || !id_animal.trim()) {
            throw new Error("ID do animal inválido.");
        }

        const animal = await animalRepository.buscarPorID(id_animal);

        if (!animal) {
            throw new Error("Animal não encontrado.");
        }

        return await integracaoGovernoRepository.buscarPorAnimal(id_animal);
    }

    // Consultar integrações de uma vacina
    async consultarPorVacina(id_vacina: number) {

        if (!Number.isInteger(id_vacina) || id_vacina <= 0) {
            throw new Error("ID da vacina inválido.");
        }

        const vacina = await vacinaRepository.buscarPorID(id_vacina);

        if (!vacina) {
            throw new Error("Vacina não encontrada.");
        }

        return await integracaoGovernoRepository.buscarPorVacina(id_vacina);
    }

    // Listar operações pendentes
    async listarPendentes() {
        return await integracaoGovernoRepository.buscarPendentes();
    }

    // Listar todas as operações
    async listarTodas() {
        return await integracaoGovernoRepository.buscarTodos();
    }

    // Registrar tentativa de envio
    async registrarTentativa(id: number, mensagem_erro?: string) {

        const integracao = await this.consultarPorID(id);

        if (integracao.situacao_operacao === "CONFIRMADA") {
            throw new Error("Esta operação já foi confirmada e não precisa de novo envio.");
        }

        return await integracaoGovernoRepository.registrarTentativa(
            id,
            mensagem_erro ?? null
        );
    }

    // Atualizar operação como enviada
    async marcarComoEnviada(id: number, protocolo: string) {

        const integracao = await this.consultarPorID(id);

        if (!protocolo || !protocolo.trim()) {
            throw new Error("O protocolo externo é obrigatório.");
        }

        if (integracao.situacao_operacao === "CONFIRMADA") {
            throw new Error("Esta operação já está confirmada.");
        }

        return await integracaoGovernoRepository.marcarComoEnviada(
            id,
            protocolo.trim()
        );
    }

    // Confirmar operação
    async confirmarIntegracao(id: number, protocolo?: string) {

        const integracao = await this.consultarPorID(id);

        if (integracao.situacao_operacao === "CONFIRMADA") {
            return integracao;
        }

        return await integracaoGovernoRepository.marcarComoConfirmada(
            id,
            protocolo?.trim() || integracao.protocolo_externo
        );
    }

    // Marcar operação como falha
    async marcarComoFalha(id: number, mensagem: string) {

        await this.consultarPorID(id);

        if (!mensagem || !mensagem.trim()) {
            throw new Error("A mensagem de erro é obrigatória.");
        }

        return await integracaoGovernoRepository.marcarComoFalha(
            id,
            mensagem.trim()
        );
    }
}

export const integracaoGovernoService = new IntegracaoGovernoService();
