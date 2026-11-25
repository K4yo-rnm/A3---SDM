
"use client";

import { useCallback, useEffect, useState } from "react";

interface Atendimento {
    id_consulta: number;
    data_hora: string;
    motivo_atendimento: string;
    anamnese: string | null;
    sintomas: string | null;
    diagnostico: string | null;
    tratamento_prescrito: string | null;
    prescricao_medicamentos: string | null;
    peso_registrado: number | null;
    temperatura: number | null;
    observacoes: string | null;
    situacao: "AGENDADA" | "REALIZADA" | "CANCELADA" | "NAO_COMPARECEU";
    veterinario: { nome_completo: string };
}

interface HistoricoAtendimentoProps {
    idAnimal: string;
    nomeAnimal: string;
    onClose: () => void;
}

export default function HistoricoAtendimento({ idAnimal, nomeAnimal, onClose }: HistoricoAtendimentoProps) {
    const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [pesquisa, setPesquisa] = useState("");

    const carregarHistorico = useCallback(async (mostrarCarregamento = true) => {
        if (mostrarCarregamento) setCarregando(true);
        setErro("");

        try {
            const resposta = await fetch(`/api/animais/${idAnimal}/consultas`, {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const dados = await resposta.json();

            if (!resposta.ok) throw new Error(dados.mensagem || dados.erro || "Não foi possível carregar o histórico.");

            setAtendimentos(Array.isArray(dados) ? dados : []);
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao carregar o histórico.");
        } finally {
            setCarregando(false);
        }
    }, [idAnimal]);

    useEffect(() => {
        const controlador = new AbortController();

        async function buscarHistorico() {
            try {
                const resposta = await fetch(`/api/animais/${idAnimal}/consultas`, {
                    credentials: "include",
                    cache: "no-store",
                    signal: controlador.signal,
                });

                const dados = await resposta.json();

                if (!resposta.ok) throw new Error(dados.mensagem || dados.erro || "Não foi possível carregar o histórico.");

                setAtendimentos(Array.isArray(dados) ? dados : []);
            } catch (e) {
                if (e instanceof Error && e.name === "AbortError") return;
                setErro(e instanceof Error ? e.message : "Erro ao carregar o histórico.");
            } finally {
                if (!controlador.signal.aborted) setCarregando(false);
            }
        }

        buscarHistorico();
        return () => controlador.abort();
    }, [idAnimal]);

    const filtrados = atendimentos.filter((a) =>
        [a.motivo_atendimento, a.diagnostico || "", a.veterinario?.nome_completo || ""]
            .some((valor) => valor.toLowerCase().includes(pesquisa.trim().toLowerCase()))
    );

    const formatarData = (data: string) => new Date(data).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

    const situacao = (valor: Atendimento["situacao"]) => ({
        AGENDADA: "Agendada",
        REALIZADA: "Realizada",
        CANCELADA: "Cancelada",
        NAO_COMPARECEU: "Não compareceu",
    })[valor];

    const corSituacao = (valor: Atendimento["situacao"]) => ({
        AGENDADA: "bg-blue-50 text-blue-700",
        REALIZADA: "bg-[#E8F0EA] text-[#5D7165]",
        CANCELADA: "bg-red-50 text-red-600",
        NAO_COMPARECEU: "bg-gray-100 text-gray-600",
    })[valor];

    const campo = (titulo: string, valor: string | number | null) => (
        <div>
            <p className="text-xs font-semibold uppercase text-[#6B7280]">{titulo}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-[#343A40]">{valor ?? "Não informado"}</p>
        </div>
    );

    return (
        <section className="mb-6 overflow-hidden rounded-xl border border-[#E7E5DF] bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-[#E7E5DF] px-6 py-5 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-lg font-semibold text-[#343A40]">Histórico de atendimentos</h3>
                    <p className="mt-1 text-sm text-[#6B7280]">Histórico clínico de {nomeAnimal}.</p>
                </div>
                <button type="button" onClick={onClose} className="rounded-lg border border-[#E7E5DF] px-4 py-2 text-sm text-[#343A40] transition hover:bg-[#FAF9F6]">Fechar</button>
            </div>

            <div className="border-b border-[#E7E5DF] p-4">
                <input value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} placeholder="Pesquisar por motivo, diagnóstico ou veterinário..." className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]" />
                <p className="mt-2 text-xs text-[#6B7280]">{filtrados.length} atendimento(s) encontrado(s)</p>
            </div>

            {erro && <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erro}<button type="button" onClick={() => carregarHistorico()} className="ml-3 font-semibold underline">Tentar novamente</button></div>}

            {carregando ? (
                <div className="p-10 text-center text-sm text-[#6B7280]">Carregando histórico...</div>
            ) : !erro && atendimentos.length === 0 ? (
                <div className="p-10 text-center">
                    <p className="font-medium text-[#343A40]">Nenhum atendimento registrado.</p>
                    <p className="mt-2 text-sm text-[#6B7280]">Os atendimentos deste animal aparecerão aqui.</p>
                </div>
            ) : !erro && filtrados.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#6B7280]">Nenhum atendimento encontrado para essa pesquisa.</div>
            ) : (
                <div className="divide-y divide-[#E7E5DF]">
                    {filtrados.map((a) => (
                        <details key={a.id_consulta} className="group p-5">
                            <summary className="flex cursor-pointer list-none flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div>
                                    <p className="font-semibold text-[#343A40]">{a.motivo_atendimento}</p>
                                    <p className="mt-1 text-xs text-[#6B7280]">{formatarData(a.data_hora)} · Dr(a). {a.veterinario?.nome_completo || "Não informado"}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${corSituacao(a.situacao)}`}>{situacao(a.situacao)}</span>
                                    <span className="text-sm text-[#718879] group-open:rotate-180">⌄</span>
                                </div>
                            </summary>

                            <div className="mt-5 grid gap-5 border-t border-[#E7E5DF] pt-5 sm:grid-cols-2">
                                {campo("Anamnese", a.anamnese)}
                                {campo("Sintomas", a.sintomas)}
                                {campo("Diagnóstico", a.diagnostico)}
                                {campo("Tratamento prescrito", a.tratamento_prescrito)}
                                {campo("Prescrição de medicamentos", a.prescricao_medicamentos)}
                                {campo("Peso registrado", a.peso_registrado != null ? `${a.peso_registrado} kg` : null)}
                                {campo("Temperatura", a.temperatura != null ? `${a.temperatura} °C` : null)}
                                {campo("Observações", a.observacoes)}
                            </div>
                        </details>
                    ))}
                </div>
            )}
        </section>
    );
}
