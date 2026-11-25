
"use client";

import { useCallback, useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import NovoAtendimento from "@/components/Atendimentos/NovoAtendimento";
import HistoricoAtendimento from "@/components/Atendimentos/HistoricoAtendimento";
import Vacinas from "@/components/Atendimentos/Vacinas";

interface Atendimento {
    id_consulta: number;
    id_animal: string;
    data_hora: string;
    motivo_atendimento: string;
    diagnostico: string | null;
    situacao: "AGENDADA" | "REALIZADA" | "CANCELADA" | "NAO_COMPARECEU";
    animal: { nome: string };
    veterinario: { nome_completo: string };
}

export default function AtendimentosPage() {
    const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [animalSelecionado, setAnimalSelecionado] = useState<{ id: string; nome: string } | null>(null);
    const [aba, setAba] = useState<"CONSULTAS" | "VACINAS">("CONSULTAS");
    const [pesquisa, setPesquisa] = useState("");

    const carregarAtendimentos = useCallback(async (mostrarCarregamento = true) => {
        if (mostrarCarregamento) setCarregando(true);
        setErro("");

        try {
            const resposta = await fetch("/api/consultas", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const dados = await resposta.json();

            if (!resposta.ok) throw new Error(dados.mensagem || dados.erro || "Não foi possível carregar os atendimentos.");

            setAtendimentos(Array.isArray(dados) ? dados : []);
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao carregar atendimentos.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        const controlador = new AbortController();

        async function buscarAtendimentos() {
            try {
                const resposta = await fetch("/api/consultas", {
                    credentials: "include",
                    cache: "no-store",
                    signal: controlador.signal,
                });

                const dados = await resposta.json();

                if (!resposta.ok) throw new Error(dados.mensagem || dados.erro || "Não foi possível carregar os atendimentos.");

                setAtendimentos(Array.isArray(dados) ? dados : []);
            } catch (e) {
                if (e instanceof Error && e.name === "AbortError") return;
                setErro(e instanceof Error ? e.message : "Erro ao carregar atendimentos.");
            } finally {
                if (!controlador.signal.aborted) setCarregando(false);
            }
        }

        buscarAtendimentos();
        return () => controlador.abort();
    }, []);

    async function cancelarAtendimento(atendimento: Atendimento) {
        if (!window.confirm(`Deseja cancelar o atendimento de ${atendimento.animal?.nome || "este animal"}?`)) return;

        try {
            const resposta = await fetch(`/api/consultas/${atendimento.id_consulta}`, {
                method: "DELETE",
                credentials: "include",
            });

            const dados = await resposta.json();

            if (!resposta.ok) throw new Error(dados.mensagem || dados.erro || "Não foi possível cancelar o atendimento.");

            await carregarAtendimentos(false);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Erro ao cancelar atendimento.");
        }
    }

    const agendadas = atendimentos.filter(a => a.situacao === "AGENDADA").length;
    const realizadas = atendimentos.filter(a => a.situacao === "REALIZADA").length;
    const canceladas = atendimentos.filter(a => a.situacao === "CANCELADA").length;

    const filtrados = atendimentos.filter(a =>
        [a.animal?.nome || "", a.motivo_atendimento, a.veterinario?.nome_completo || ""]
            .some(valor => valor.toLowerCase().includes(pesquisa.trim().toLowerCase()))
    );

    const formatarData = (data: string) => new Date(data).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

    const situacoes = {
        AGENDADA: "Agendada",
        REALIZADA: "Realizada",
        CANCELADA: "Cancelada",
        NAO_COMPARECEU: "Não compareceu",
    };

    const cores = {
        AGENDADA: "bg-blue-50 text-blue-700",
        REALIZADA: "bg-[#E8F0EA] text-[#5D7165]",
        CANCELADA: "bg-red-50 text-red-600",
        NAO_COMPARECEU: "bg-gray-100 text-gray-600",
    };

    return (
        <AppLayout title="Atendimentos">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#343A40]">Gerenciamento de atendimentos</h2>
                <p className="mt-2 text-sm text-[#6B7280]">Agende consultas, acompanhe históricos clínicos e gerencie as vacinações dos animais.</p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    { titulo: "Total de atendimentos", valor: atendimentos.length, cor: "text-[#343A40]" },
                    { titulo: "Consultas agendadas", valor: agendadas, cor: "text-[#718879]" },
                    { titulo: "Consultas realizadas", valor: realizadas, cor: "text-[#5D7165]" },
                ].map(card => (
                    <div key={card.titulo} className="rounded-xl border border-[#E7E5DF] bg-white p-5">
                        <p className="text-sm text-[#6B7280]">{card.titulo}</p>
                        <p className={`mt-2 text-2xl font-bold ${card.cor}`}>{card.valor}</p>
                    </div>
                ))}
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                <button type="button" onClick={() => setAba("CONSULTAS")} className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${aba === "CONSULTAS" ? "bg-[#718879] text-white" : "border border-[#E7E5DF] bg-white text-[#343A40] hover:bg-[#FAF9F6]"}`}>
                    Consultas
                </button>
                <button type="button" onClick={() => setAba("VACINAS")} className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${aba === "VACINAS" ? "bg-[#718879] text-white" : "border border-[#E7E5DF] bg-white text-[#343A40] hover:bg-[#FAF9F6]"}`}>
                    Vacinação
                </button>
            </div>

            {aba === "CONSULTAS" ? (
                <>
                    {mostrarFormulario && (
                        <NovoAtendimento
                            onClose={() => setMostrarFormulario(false)}
                            onCadastrado={() => carregarAtendimentos(false)}
                        />
                    )}

                    {animalSelecionado && (
                        <HistoricoAtendimento
                            idAnimal={animalSelecionado.id}
                            nomeAnimal={animalSelecionado.nome}
                            onClose={() => setAnimalSelecionado(null)}
                        />
                    )}

                    <section className="overflow-hidden rounded-xl border border-[#E7E5DF] bg-white">
                        <div className="flex flex-col gap-3 border-b border-[#E7E5DF] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-[#343A40]">Consultas cadastradas</h3>
                                <p className="mt-1 text-sm text-[#6B7280]">Relação de atendimentos registrados na clínica.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => setMostrarFormulario(true)} className="rounded-lg bg-[#718879] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5D7165]">
                                    + Novo atendimento
                                </button>
                                <button type="button" onClick={() => carregarAtendimentos()} disabled={carregando} className="rounded-lg border border-[#E7E5DF] px-4 py-2 text-sm font-medium text-[#343A40] transition hover:bg-[#FAF9F6] disabled:opacity-50">
                                    {carregando ? "Atualizando..." : "Atualizar lista"}
                                </button>
                            </div>
                        </div>

                        {erro && (
                            <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erro}</div>
                        )}

                        <div className="border-b border-[#E7E5DF] p-4">
                            <input value={pesquisa} onChange={e => setPesquisa(e.target.value)} placeholder="Pesquisar por animal, motivo ou veterinário..." className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none transition focus:border-[#718879]" />
                            <p className="mt-2 text-xs text-[#6B7280]">{filtrados.length} atendimento(s) encontrado(s)</p>
                        </div>

                        {carregando ? (
                            <div className="p-10 text-center text-sm text-[#6B7280]">Carregando atendimentos...</div>
                        ) : !erro && atendimentos.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="font-medium text-[#343A40]">Nenhum atendimento cadastrado.</p>
                                <p className="mt-2 text-sm text-[#6B7280]">Os atendimentos registrados aparecerão nesta lista.</p>
                            </div>
                        ) : !erro && filtrados.length === 0 ? (
                            <div className="p-10 text-center text-sm text-[#6B7280]">Nenhum atendimento encontrado.</div>
                        ) : (
                            !erro && (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-237.5 text-left text-sm">
                                        <thead className="bg-[#FAF9F6] text-xs uppercase text-[#6B7280]">
                                            <tr>
                                                {["Animal", "Motivo", "Veterinário", "Data e hora", "Situação", "Ações"].map(t => (
                                                    <th key={t} className="px-6 py-4 font-semibold">{t}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E7E5DF]">
                                            {filtrados.map(a => (
                                                <tr key={a.id_consulta} className="transition hover:bg-[#FAF9F6]">
                                                    <td className="whitespace-nowrap px-6 py-4 font-medium text-[#343A40]">{a.animal?.nome || "Não informado"}</td>
                                                    <td className="px-6 py-4 text-[#343A40]">{a.motivo_atendimento}</td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-[#343A40]">{a.veterinario?.nome_completo || "Não informado"}</td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-[#343A40]">{formatarData(a.data_hora)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${cores[a.situacao]}`}>
                                                            {situacoes[a.situacao]}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => setAnimalSelecionado({ id: a.id_animal, nome: a.animal?.nome || "Animal" })} className="rounded-lg border border-[#E7E5DF] px-3 py-2 text-xs font-medium text-[#343A40] transition hover:bg-[#FAF9F6]">
                                                                Histórico
                                                            </button>
                                                            {a.situacao !== "CANCELADA" && (
                                                                <button type="button" onClick={() => cancelarAtendimento(a)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50">
                                                                    Cancelar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}
                    </section>
                    <p className="mt-3 text-right text-xs text-[#6B7280]">{canceladas} consulta(s) cancelada(s)</p>
                </>
            ) : (
                <Vacinas />
            )}
        </AppLayout>
    );
}

