
"use client";

import { useEffect, useState } from "react";

type Integracao = {
    id_integracao: number;
    id_animal: string;
    id_vacina: number | null;
    tipo_operacao: string;
    protocolo_externo: string | null;
    situacao_operacao: string;
    data_solicitacao: string;
    data_resposta: string | null;
    quantidade_tentativas: number;
    mensagem_erro: string | null;
};

const filtros = ["TODOS", "PENDENTE", "ENVIADA", "CONFIRMADA", "FALHA"];

export default function Integracoes() {
    const [dados, setDados] = useState<Integracao[]>([]);
    const [filtro, setFiltro] = useState("TODOS");
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [reenviando, setReenviando] = useState<number | null>(null);
    const [atualizar, setAtualizar] = useState(0);
    const [filtroProtocolo, setFiltroProtocolo] = useState("");

    useEffect(() => {
        const controlador = new AbortController();

        async function carregar() {
            try {
                const resposta = await fetch("/api/integracao-governo", {
                    credentials: "include",
                    cache: "no-store",
                    signal: controlador.signal,
                });

                const resultado = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(resultado.erro || resultado.mensagem || "Erro ao carregar integrações.");
                }

                setDados(Array.isArray(resultado) ? resultado : []);
                setErro("");
            } catch (e) {
                if (e instanceof Error && e.name === "AbortError") return;
                setErro(e instanceof Error ? e.message : "Erro ao carregar integrações.");
            } finally {
                if (!controlador.signal.aborted) setCarregando(false);
            }
        }

        carregar();
        return () => controlador.abort();
    }, [atualizar]);

    async function reenviar(id: number) {
        if (!window.confirm("Deseja realmente reenviar esta integração governamental?")) return;

        setReenviando(id);
        setErro("");
        setMensagem("");

        try {
            const resposta = await fetch(`/api/integracao-governo/${id}/reenviar`, {
                method: "POST",
                credentials: "include",
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(resultado.erro || "Erro ao reenviar integração.");
            }

            setMensagem(resultado.mensagem || "Tentativa de reenvio concluída.");
            setAtualizar(valor => valor + 1);
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao reenviar integração.");
        } finally {
            setReenviando(null);
        }
    }

    const lista = dados.filter(i => {
        const correspondeSituacao =
            filtro === "TODOS" || i.situacao_operacao === filtro;

        const correspondeProtocolo =
            !filtroProtocolo.trim() ||
            (i.protocolo_externo ?? "")
                .toLowerCase()
                .includes(filtroProtocolo.trim().toLowerCase());

        return correspondeSituacao && correspondeProtocolo;
    });

    const quantidade = (situacao: string) =>
        dados.filter(i => i.situacao_operacao === situacao).length;

    const data = (valor: string | null) =>
        valor ? new Date(valor).toLocaleString("pt-BR") : "—";

    function corSituacao(situacao: string) {
        switch (situacao) {
            case "CONFIRMADA": return "bg-green-50 text-green-700";
            case "ENVIADA": return "bg-blue-50 text-blue-700";
            case "PENDENTE": return "bg-yellow-50 text-yellow-700";
            case "FALHA": return "bg-red-50 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-[#343A40]">Integrações governamentais</h3>
                    <p className="mt-1 text-sm text-[#6B7280]">Acompanhe as operações enviadas à API governamental.</p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setCarregando(true);
                        setAtualizar(v => v + 1);
                    }}
                    disabled={carregando}
                    className="rounded-lg bg-[#718879] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#5D7165] disabled:opacity-60"
                >
                    {carregando ? "Atualizando..." : "Atualizar lista"}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                    ["Pendentes", "PENDENTE", "text-yellow-700"],
                    ["Enviadas", "ENVIADA", "text-blue-700"],
                    ["Confirmadas", "CONFIRMADA", "text-green-700"],
                    ["Com falha", "FALHA", "text-red-700"],
                ].map(([nome, situacao, cor]) => (
                    <button
                        key={situacao}
                        type="button"
                        onClick={() => setFiltro(situacao)}
                        className={`rounded-xl border bg-white p-5 text-left transition hover:border-[#718879] ${filtro === situacao ? "border-[#718879] ring-1 ring-[#718879]" : "border-[#E7E5DF]"
                            }`}
                    >
                        <p className="text-sm text-[#6B7280]">{nome}</p>
                        <p className={`mt-2 text-2xl font-bold ${cor}`}>{quantidade(situacao)}</p>
                    </button>
                ))}
            </div>

            <section className="rounded-xl border border-[#E7E5DF] bg-white p-5">
                <h4 className="mb-4 text-sm font-semibold text-[#343A40]">Filtrar integrações</h4>
                <div className="mb-4">
                    <input
                        type="text"
                        value={filtroProtocolo}
                        onChange={e => setFiltroProtocolo(e.target.value)}
                        placeholder="Pesquisar pelo protocolo..."
                        className="w-full rounded-lg border border-[#E7E5DF] bg-white px-4 py-3 text-sm text-[#343A40] outline-none transition focus:border-[#718879] sm:max-w-md"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {filtros.map(item => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setFiltro(item)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filtro === item
                                    ? "bg-[#718879] text-white"
                                    : "border border-[#E7E5DF] bg-white text-[#343A40] hover:bg-[#FAF9F6]"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </section>

            {mensagem && (
                <p className="rounded-lg bg-green-50 p-4 text-sm text-green-700">{mensagem}</p>
            )}

            {erro && (
                <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{erro}</p>
            )}

            <section className="overflow-hidden rounded-xl border border-[#E7E5DF] bg-white">
                <div className="border-b border-[#E7E5DF] px-6 py-5">
                    <h4 className="text-lg font-semibold text-[#343A40]">Histórico de integrações</h4>
                    <p className="mt-1 text-sm text-[#6B7280]">
                        {lista.length} {lista.length === 1 ? "operação encontrada" : "operações encontradas"}
                    </p>
                </div>

                {carregando ? (
                    <div className="p-10 text-center text-sm text-[#6B7280]">Carregando integrações...</div>
                ) : lista.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="font-medium text-[#343A40]">Nenhuma integração encontrada.</p>
                        <p className="mt-2 text-sm text-[#6B7280]">As operações aparecerão aqui.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#FAF9F6] text-[#6B7280]">
                                <tr>
                                    {["ID", "Animal", "Vacina", "Operação", "Situação", "Protocolo", "Tentativas", "Solicitação", "Resposta", "Erro", "Ações"].map(t => (
                                        <th key={t} className="whitespace-nowrap p-4 font-medium">{t}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lista.map(i => (
                                    <tr key={i.id_integracao} className="border-t border-[#E7E5DF] transition hover:bg-[#FAF9F6]">
                                        <td className="p-4">{i.id_integracao}</td>
                                        <td className="p-4 font-medium text-[#343A40]">{i.id_animal}</td>
                                        <td className="p-4">{i.id_vacina ?? "—"}</td>
                                        <td className="p-4">{i.tipo_operacao}</td>
                                        <td className="p-4">
                                            <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${corSituacao(i.situacao_operacao)}`}>
                                                {i.situacao_operacao}
                                            </span>
                                        </td>
                                        <td className="p-4">{i.protocolo_externo || "—"}</td>
                                        <td className="p-4 text-center">{i.quantidade_tentativas}</td>
                                        <td className="whitespace-nowrap p-4 text-[#6B7280]">{data(i.data_solicitacao)}</td>
                                        <td className="whitespace-nowrap p-4 text-[#6B7280]">{data(i.data_resposta)}</td>
                                        <td className="max-w-xs p-4 text-red-600">{i.mensagem_erro || "—"}</td>
                                        <td className="p-4">
                                            {i.situacao_operacao === "PENDENTE" && (
                                                <button
                                                    type="button"
                                                    onClick={() => reenviar(i.id_integracao)}
                                                    disabled={reenviando !== null}
                                                    className="whitespace-nowrap rounded-lg bg-[#718879] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#5D7165] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {reenviando === i.id_integracao ? "Enviando..." : "Reenviar"}
                                                </button>
                                            )}
                                            {i.situacao_operacao !== "PENDENTE" && "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}


