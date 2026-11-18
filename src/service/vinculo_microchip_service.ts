
import { vinculoMicrochipRepository } from "@/repository/vinculo_microchip_repository";
import { animalRepository } from "@/repository/animal_repository";
import { veterinarioRepository } from "@/repository/veterinario_repository";

export class VinculoMicrochipService {

    // Validar animal e veterinário
    private async validarResponsaveis(id_animal: string, id_veterinario: number) {

        const animal = await animalRepository.buscarPorID(id_animal);

        if (!animal) {
            throw new Error("Animal não encontrado.");
        }

        if (animal.situacao !== "ATIVO") {
            throw new Error("Não é possível vincular microchip a um animal inativo.");
        }

        const veterinario = await veterinarioRepository.buscarPorID(id_veterinario);

        if (!veterinario) {
            throw new Error("Veterinário não encontrado.");
        }

        if (veterinario.situacao !== "ATIVO") {
            throw new Error("Veterinário inativo não pode vincular microchips.");
        }

        if (!veterinario.senha_confirmada) {
            throw new Error("O veterinário ainda não confirmou sua senha.");
        }
    }

    // Vincular microchip a um animal
    async vincularMicrochip(dados: {
        id_animal: string;
        codigo_microchip: string;
        id_veterinario: number;
        observacoes?: string | null;
    }) {

        if (!dados.id_animal || !dados.id_animal.trim()) {
            throw new Error("O animal deve ser informado.");
        }

        const codigo = dados.codigo_microchip?.trim();

        if (!codigo) {
            throw new Error("O código do microchip é obrigatório.");
        }

        if (!Number.isInteger(dados.id_veterinario) || dados.id_veterinario <= 0) {
            throw new Error("Veterinário inválido.");
        }

        await this.validarResponsaveis(
            dados.id_animal,
            dados.id_veterinario
        );

        const microchipExistente = await vinculoMicrochipRepository.buscarPorCodigo(codigo);

        if (microchipExistente) {
            throw new Error("Este código de microchip já foi utilizado.");
        }

        const vinculoAtivo = await vinculoMicrochipRepository.buscarAtivoPorAnimal(
            dados.id_animal
        );

        if (vinculoAtivo) {
            throw new Error("Este animal já possui um microchip ativo. Utilize a operação de substituição.");
        }

        return await vinculoMicrochipRepository.criar({
            id_animal: dados.id_animal,
            codigo_microchip: codigo,
            id_veterinario: dados.id_veterinario,
            observacoes: dados.observacoes,
            situacao: "ATIVO",
            data_vinculacao: new Date()
        });
    }

    // Consultar vínculo pelo ID
    async consultarPorID(id: number) {

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID do vínculo inválido.");
        }

        const vinculo = await vinculoMicrochipRepository.buscarPorID(id);

        if (!vinculo) {
            throw new Error("Vínculo de microchip não encontrado.");
        }

        return vinculo;
    }

    // Consultar microchip pelo código
    async consultarPorCodigo(codigo: string) {

        if (!codigo || !codigo.trim()) {
            throw new Error("Código do microchip inválido.");
        }

        const vinculo = await vinculoMicrochipRepository.buscarPorCodigo(
            codigo.trim()
        );

        if (!vinculo) {
            throw new Error("Microchip não encontrado.");
        }

        return vinculo;
    }

    // Consultar microchip ativo de um animal
    async consultarAtivoPorAnimal(id_animal: string) {

        if (!id_animal || !id_animal.trim()) {
            throw new Error("ID do animal inválido.");
        }

        const animal = await animalRepository.buscarPorID(id_animal);

        if (!animal) {
            throw new Error("Animal não encontrado.");
        }

        return await vinculoMicrochipRepository.buscarAtivoPorAnimal(id_animal);
    }

    // Consultar histórico de microchips de um animal
    async consultarHistoricoAnimal(id_animal: string) {

        if (!id_animal || !id_animal.trim()) {
            throw new Error("ID do animal inválido.");
        }

        const animal = await animalRepository.buscarPorID(id_animal);

        if (!animal) {
            throw new Error("Animal não encontrado.");
        }

        return await vinculoMicrochipRepository.buscarHistoricoPorAnimal(id_animal);
    }

    // Listar todos os vínculos
    async listarTodos() {
        return await vinculoMicrochipRepository.buscarTodos();
    }

    // Substituir microchip
    async substituirMicrochip(id: number, dados: {
        codigo_microchip: string;
        id_veterinario: number;
        motivo_substituicao: string;
        observacoes?: string | null;
    }) {

        const vinculoAnterior = await this.consultarPorID(id);

        if (vinculoAnterior.situacao !== "ATIVO") {
            throw new Error("Somente um microchip ativo pode ser substituído.");
        }

        const codigo = dados.codigo_microchip?.trim();

        if (!codigo) {
            throw new Error("O novo código do microchip é obrigatório.");
        }

        if (!dados.motivo_substituicao?.trim()) {
            throw new Error("O motivo da substituição é obrigatório.");
        }

        await this.validarResponsaveis(
            vinculoAnterior.id_animal,
            dados.id_veterinario
        );

        const microchipExistente = await vinculoMicrochipRepository.buscarPorCodigo(codigo);

        if (microchipExistente) {
            throw new Error("Este código de microchip já foi utilizado.");
        }

        // Desvincular o microchip anterior
        await vinculoMicrochipRepository.desvincular(
            id,
            dados.motivo_substituicao.trim()
        );

        // Criar o novo vínculo, preservando o anterior
        return await vinculoMicrochipRepository.criar({
            id_animal: vinculoAnterior.id_animal,
            codigo_microchip: codigo,
            id_veterinario: dados.id_veterinario,
            observacoes: dados.observacoes,
            motivo_substituicao: dados.motivo_substituicao.trim(),
            situacao: "ATIVO",
            data_vinculacao: new Date()
        });
    }

    // Desvincular microchip
    async desvincularMicrochip(id: number, motivo?: string) {

        const vinculo = await this.consultarPorID(id);

        if (vinculo.situacao !== "ATIVO") {
            throw new Error("Este microchip já está desvinculado.");
        }

        if (!motivo || !motivo.trim()) {
            throw new Error("O motivo da desvinculação é obrigatório.");
        }

        return await vinculoMicrochipRepository.desvincular(
            id,
            motivo.trim()
        );
    }
}

export const vinculoMicrochipService = new VinculoMicrochipService();
