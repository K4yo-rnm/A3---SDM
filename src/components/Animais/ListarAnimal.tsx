"use client";

import { useState } from "react";

interface Animal {
    id_animal: string;
    nome: string;
    data_nascimento: string | null;
    idade_estimada: number | null;
    sexo: string | null;
    cor: string | null;
    peso_atual: number | null;
    situacao: "ATIVO" | "INATIVO";
    id_tutor: number;
    id_especie: number;
    id_raca: number | null;
    tutor: { nome_completo: string };
    especie: { nome: string };
    raca: { nome: string } | null;
    vinculos_microchip: {
        codigo_microchip: string;
        situacao: string;
    }[];
}

interface VinculoMicrochip {
    id_vinculo_microchip: number;
    codigo_microchip: string;
    situacao: string;
    data_vinculacao: string;
    data_desvinculacao: string | null;
    motivo_substituicao: string | null;
    observacoes: string | null;
    veterinario?: {
        num_cmrv: string;
        uf_cmrv: string;
    };
}

interface ListarAnimaisProps {
    animais: Animal[];
    onEditar: (animal: Animal) => void;
    onInativar: (animal: Animal) => void;
}

export default function ListarAnimais({
    animais,
    onEditar,
    onInativar,
}: ListarAnimaisProps) {
    const [pesquisa, setPesquisa] = useState("");
    const [historico, setHistorico] = useState<VinculoMicrochip[]>([]);
    const [animalHistorico, setAnimalHistorico] = useState<string | null>(null);
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);
    const [erroHistorico, setErroHistorico] = useState("");

    async function consultarHistorico(animal: Animal) {
        setCarregandoHistorico(true);
        setErroHistorico("");
        setHistorico([]);
        setAnimalHistorico(animal.nome);

        try {
            const resposta = await fetch(
                `/api/animais/${animal.id_animal}/microchip/historico`,
                { credentials: "include" }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.erro || "Não foi possível consultar o histórico."
                );
            }

            setHistorico(Array.isArray(dados) ? dados : []);
        } catch (error) {
            setErroHistorico(
                error instanceof Error
                    ? error.message
                    : "Erro ao consultar histórico de microchips."
            );
        } finally {
            setCarregandoHistorico(false);
        }
    }

    function normalizar(valor: string) {
        return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    function formatarPeso(peso: number | null) {
        return peso == null ? "Não informado" : `${peso} kg`;
    }

    function formatarMicrochip(animal: Animal) {
        const microchipAtivo = animal.vinculos_microchip?.find(
            vinculo => vinculo.situacao === "ATIVO"
        );

        return microchipAtivo?.codigo_microchip || "Sem microchip";
    }

    function formatarIdade(animal: Animal) {
        if (animal.data_nascimento) {
            const nascimento = new Date(animal.data_nascimento);
            return `${nascimento.toLocaleDateString("pt-BR")}`;
        }

        return animal.idade_estimada != null
            ? `${animal.idade_estimada} ano(s) estimado(s)`
            : "Idade não informada";
    }

    const animaisFiltrados = animais.filter((animal) =>
        [
            animal.id_animal,
            animal.nome,
            animal.tutor?.nome_completo || "",
            animal.especie?.nome || "",
            animal.raca?.nome || "",
            ...(animal.vinculos_microchip?.map(v => v.codigo_microchip) || []),
        ].some((valor) => normalizar(valor).includes(normalizar(pesquisa.trim())))
    );

    return (
        <>
            <div className="border-b border-[#E7E5DF] p-4">
                <input
                    type="text"
                    value={pesquisa}
                    onChange={(event) => setPesquisa(event.target.value)}
                    placeholder="Pesquisar animal, tutor, espécie ou raça..."
                    className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none transition focus:border-[#718879]"
                />

                <p className="mt-2 text-xs text-[#6B7280]">
                    {animaisFiltrados.length} animal(is) encontrado(s)
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-212.5 text-left text-sm">
                    <thead className="bg-[#FAF9F6] text-xs uppercase text-[#6B7280]">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Animal</th>
                            <th className="px-6 py-4 font-semibold">Tutor</th>
                            <th className="px-6 py-4 font-semibold">Espécie / Raça</th>
                            <th className="px-6 py-4 font-semibold">Sexo</th>
                            <th className="px-6 py-4 font-semibold">Peso</th>
                            <th className="px-6 py-4 font-semibold">Microchip RFID</th>
                            <th className="px-6 py-4 font-semibold">Situação</th>
                            <th className="px-6 py-4 font-semibold">Ações</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[#E7E5DF]">
                        {animaisFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-10 text-center text-sm text-[#6B7280]">
                                    Nenhum animal encontrado.
                                </td>
                            </tr>
                        ) : (
                            animaisFiltrados.map((animal) => (
                                <tr key={animal.id_animal} className="transition hover:bg-[#FAF9F6]">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-[#343A40]">{animal.nome}</p>
                                        <p className="mt-1 text-xs text-[#6B7280]">{formatarIdade(animal)}</p>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-[#343A40]">
                                        {animal.tutor?.nome_completo || "Não informado"}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-[#343A40]">
                                        <p>{animal.especie?.nome || "Não informada"}</p>
                                        <p className="mt-1 text-xs text-[#6B7280]">{animal.raca?.nome || "Sem raça definida"}</p>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-[#343A40]">
                                        {animal.sexo || "Não informado"}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-[#343A40]">
                                        {formatarPeso(animal.peso_atual)}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        {animal.vinculos_microchip?.length > 0 ? (
                                            <span className="font-medium text-[#718879]">
                                                {formatarMicrochip(animal)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-[#9CA3AF]">
                                                Sem microchip
                                            </span>
                                        )}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${animal.situacao === "ATIVO"
                                                    ? "bg-[#E8F0EA] text-[#5D7165]"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {animal.situacao}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => consultarHistorico(animal)}
                                                className="rounded-lg border border-[#718879] px-3 py-2 text-xs font-medium text-[#718879] transition hover:bg-[#E8F0EA]"
                                            >
                                                Histórico
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onEditar(animal)}
                                                className="rounded-lg border border-[#E7E5DF] px-3 py-2 text-xs font-medium text-[#343A40] transition hover:bg-[#FAF9F6]"
                                            >
                                                Editar
                                            </button>

                                            {animal.situacao === "ATIVO" && (
                                                <button
                                                    type="button"
                                                    onClick={() => onInativar(animal)}
                                                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                >
                                                    Inativar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {animalHistorico !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b border-[#E7E5DF] p-5">
                            <div>
                                <h2 className="text-lg font-semibold text-[#343A40]">
                                    Histórico de microchips
                                </h2>
                                <p className="mt-1 text-sm text-[#6B7280]">
                                    Animal: {animalHistorico}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setAnimalHistorico(null)}
                                className="rounded-lg px-3 py-2 text-sm text-[#6B7280] hover:bg-[#FAF9F6]"
                            >
                                Fechar
                            </button>
                        </div>

                        <div className="max-h-[65vh] overflow-y-auto p-5">

                            {carregandoHistorico ? (
                                <p className="py-8 text-center text-sm text-[#6B7280]">
                                    Carregando histórico...
                                </p>
                            ) : erroHistorico ? (
                                <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                                    {erroHistorico}
                                </p>
                            ) : historico.length === 0 ? (
                                <p className="py-8 text-center text-sm text-[#6B7280]">
                                    Nenhum registro de microchip encontrado.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {historico.map((vinculo) => (
                                        <div
                                            key={vinculo.id_vinculo_microchip}
                                            className="rounded-lg border border-[#E7E5DF] p-4"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <p className="font-semibold text-[#343A40]">
                                                    {vinculo.codigo_microchip}
                                                </p>

                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${vinculo.situacao === "ATIVO"
                                                        ? "bg-[#E8F0EA] text-[#5D7165]"
                                                        : "bg-gray-100 text-gray-600"
                                                    }`}>
                                                    {vinculo.situacao}
                                                </span>
                                            </div>

                                            <div className="mt-3 space-y-2 text-sm text-[#6B7280]">
                                                <p>
                                                    <strong>Data da vinculação:</strong>{" "}
                                                    {new Date(vinculo.data_vinculacao).toLocaleString("pt-BR")}
                                                </p>

                                                <p>
                                                    <strong>Data da desvinculação:</strong>{" "}
                                                    {vinculo.data_desvinculacao
                                                        ? new Date(vinculo.data_desvinculacao).toLocaleString("pt-BR")
                                                        : "Não desvinculado"}
                                                </p>

                                                <p>
                                                    <strong>Veterinário responsável:</strong>{" "}
                                                    {vinculo.veterinario
                                                        ? `CRMV ${vinculo.veterinario.num_cmrv}/${vinculo.veterinario.uf_cmrv}`
                                                        : "Não informado"}
                                                </p>

                                                {vinculo.motivo_substituicao && (
                                                    <p>
                                                        <strong>Motivo da substituição:</strong>{" "}
                                                        {vinculo.motivo_substituicao}
                                                    </p>
                                                )}

                                                {vinculo.observacoes && (
                                                    <p>
                                                        <strong>Observações:</strong>{" "}
                                                        {vinculo.observacoes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
