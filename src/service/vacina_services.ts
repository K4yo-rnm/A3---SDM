
import { vacinaRepository } from "@/repository/vacina_repository";
import { animalRepository } from "@/repository/animal_repository";
import { veterinarioRepository } from "@/repository/veterinario_repository";
import { prisma } from "@/lib/prisma";
import { integracaoGovernoRepository } from "@/repository/integracao_governo_repository";

export class VacinaService {

    // Validar animal e veterinário
    private async validarResponsaveis(id_animal: string, id_veterinario: number) {

        const animal = await animalRepository.buscarPorID(id_animal);

        if (!animal) {
            throw new Error("Animal não encontrado.");
        }

        if (animal.situacao !== "ATIVO") {
            throw new Error("Não é possível registrar vacina para um animal inativo.");
        }

        const veterinario = await veterinarioRepository.buscarPorID(id_veterinario);

        if (!veterinario) {
            throw new Error("Veterinário não encontrado.");
        }

        if (veterinario.situacao !== "ATIVO") {
            throw new Error("Veterinário inativo não pode aplicar vacinas.");
        }

        if (!veterinario.senha_confirmada) {
            throw new Error("O veterinário ainda não confirmou sua senha.");
        }
    }

    // Cadastrar aplicação de vacina
    async cadastrarVacina(dados: {
        id_animal: string;
        id_veterinario: number;
        nome_vacina: string;
        tipo_vacina: string;
        antirrabica: boolean;
        fabricante: string;
        numero_lote: string;
        data_aplicacao: Date;
        dose_esquema: string;
        via_aplicacao: string;
        proxima_dose?: Date | null;
        validade_lote?: Date | null;
        observacoes?: string | null;
        situacao?: string;
    }) {

        if (!dados.nome_vacina?.trim()) {
            throw new Error("O nome da vacina é obrigatório.");
        }

        if (!dados.tipo_vacina?.trim()) {
            throw new Error("O tipo da vacina é obrigatório.");
        }

        if (!dados.fabricante?.trim()) {
            throw new Error("O fabricante é obrigatório.");
        }

        if (!dados.numero_lote?.trim()) {
            throw new Error("O número do lote é obrigatório.");
        }

        if (!dados.dose_esquema?.trim()) {
            throw new Error("A dose ou etapa do esquema vacinal é obrigatória.");
        }

        if (!dados.via_aplicacao?.trim()) {
            throw new Error("A via de aplicação é obrigatória.");
        }

        if (typeof dados.antirrabica !== "boolean") {
            throw new Error("A classificação antirrábica deve ser informada.");
        }

        if (
            !(dados.data_aplicacao instanceof Date) ||
            isNaN(dados.data_aplicacao.getTime())
        ) {
            throw new Error("Data de aplicação inválida.");
        }

        if (dados.data_aplicacao > new Date()) {
            throw new Error("A data de aplicação não pode estar no futuro.");
        }

        if (
            dados.proxima_dose &&
            isNaN(dados.proxima_dose.getTime())
        ) {
            throw new Error("Data da próxima dose inválida.");
        }

        if (
            dados.validade_lote &&
            isNaN(dados.validade_lote.getTime())
        ) {
            throw new Error("Data de validade do lote inválida.");
        }

        if (
            dados.validade_lote &&
            dados.validade_lote < dados.data_aplicacao
        ) {
            throw new Error("O lote não pode estar vencido na data da aplicação.");
        }

        await this.validarResponsaveis(
            dados.id_animal,
            dados.id_veterinario
        );

        const situacoes = ["AGENDADA", "APLICADA", "CANCELADA"];
        const situacao = dados.situacao ?? "APLICADA";

        if (!situacoes.includes(situacao)) {
            throw new Error("Situação da vacinação inválida.");
        }

        // Executar cadastro e integração na mesma transação
        return await prisma.$transaction(async (tx) => {

            const vacina = await vacinaRepository.criar(
                {
                    ...dados,
                    nome_vacina: dados.nome_vacina.trim(),
                    tipo_vacina: dados.tipo_vacina.trim(),
                    fabricante: dados.fabricante.trim(),
                    numero_lote: dados.numero_lote.trim(),
                    dose_esquema: dados.dose_esquema.trim(),
                    via_aplicacao: dados.via_aplicacao.trim(),
                    situacao
                },
                tx
            );

            let integracao = null;

            if (vacina.antirrabica && vacina.situacao === "APLICADA") {

                const chaveIdempotencia =
                    `VACINA-ANTIRRABICA-${vacina.id_vacina}`;

                const integracaoExistente =
                    await tx.integracaoGoverno.findUnique({
                        where: {
                            chave_idempotencia: chaveIdempotencia
                        }
                    });

                if (!integracaoExistente) {
                    integracao =
                        await integracaoGovernoRepository.criar(
                            {
                                id_animal: vacina.id_animal,
                                id_vacina: vacina.id_vacina,
                                tipo_operacao: "REGISTRO_VACINA_ANTIRRABICA",
                                chave_idempotencia: chaveIdempotencia,
                                situacao_operacao: "PENDENTE",
                                data_solicitacao: new Date(),
                                quantidade_tentativas: 0
                            },
                            tx
                        );
                } else {
                    integracao = integracaoExistente;
                }
            }

            return {
                vacina,
                integracao
            };
        });
    }

    // Consultar vacina por ID
    async consultarPorID(id: number) {

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID da vacina inválido.");
        }

        const vacina = await vacinaRepository.buscarPorID(id);

        if (!vacina) {
            throw new Error("Vacina não encontrada.");
        }

        return vacina;
    }

    // Consultar histórico de vacinação de um animal
    async consultarHistoricoAnimal(id_animal: string) {

        if (!id_animal || !id_animal.trim()) {
            throw new Error("ID do animal inválido.");
        }

        const animal = await animalRepository.buscarPorID(id_animal);

        if (!animal) {
            throw new Error("Animal não encontrado.");
        }

        return await vacinaRepository.buscarPorAnimal(id_animal);
    }

    // Consultar próximas doses previstas
    async consultarProximasDoses(id_animal: string) {

        const vacinas = await this.consultarHistoricoAnimal(id_animal);

        return vacinas.filter(vacina =>
            vacina.situacao === "APLICADA" &&
            vacina.proxima_dose !== null &&
            vacina.proxima_dose !== undefined
        );
    }

    // Listar vacinas
    async listarTodas() {
        return await vacinaRepository.buscarTodos();
    }

    // Atualizar vacina
    async atualizarVacina(id: number, dados: {
        nome_vacina?: string;
        tipo_vacina?: string;
        antirrabica?: boolean;
        fabricante?: string;
        numero_lote?: string;
        data_aplicacao?: Date;
        dose_esquema?: string;
        via_aplicacao?: string;
        proxima_dose?: Date | null;
        validade_lote?: Date | null;
        observacoes?: string | null;
        situacao?: string;
    }) {

        await this.consultarPorID(id);

        if (dados.nome_vacina !== undefined && !dados.nome_vacina.trim()) {
            throw new Error("O nome da vacina não pode ficar vazio.");
        }

        if (dados.data_aplicacao !== undefined &&
            (!(dados.data_aplicacao instanceof Date) ||
            isNaN(dados.data_aplicacao.getTime()))) {
            throw new Error("Data de aplicação inválida.");
        }

        if (dados.situacao !== undefined) {
            const situacoes = ["AGENDADA", "APLICADA", "CANCELADA"];

            if (!situacoes.includes(dados.situacao)) {
                throw new Error("Situação da vacinação inválida.");
            }
        }

        return await vacinaRepository.atualizarVacina(id, dados);
    }

    // Cancelar registro de vacinação
    async cancelarVacina(id: number) {

        const vacina = await this.consultarPorID(id);

        if (vacina.situacao === "CANCELADA") {
            throw new Error("Esta vacinação já está cancelada.");
        }

        return await vacinaRepository.inativarVacina(id);
    }
}

export const vacinaService = new VacinaService();
