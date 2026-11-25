
"use client";

import { useCallback, useEffect, useState } from "react";

interface Animal {
    id_animal: string;
    nome: string;
    situacao: "ATIVO" | "INATIVO";
}

interface Veterinario {
    id_veterinario: number;
    nome_completo: string;
    situacao: "ATIVO" | "INATIVO";
    senha_confirmada: boolean;
}

interface Vacina {
    id_vacina: number;
    id_animal: string;
    nome_vacina: string;
    tipo_vacina: string;
    antirrabica: boolean;
    fabricante: string;
    numero_lote: string;
    data_aplicacao: string;
    dose_esquema: string;
    via_aplicacao: string;
    proxima_dose: string | null;
    validade_lote: string | null;
    observacoes: string | null;
    situacao: "AGENDADA" | "APLICADA" | "CANCELADA";
    animal: { nome: string };
    veterinario: { nome_completo: string };
}

export default function Vacinas() {
    const [vacinas, setVacinas] = useState<Vacina[]>([]);
    const [animais, setAnimais] = useState<Animal[]>([]);
    const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [pesquisa, setPesquisa] = useState("");

    const formularioInicial = {
        id_animal: "",
        id_veterinario: "",
        nome_vacina: "",
        tipo_vacina: "",
        antirrabica: false,
        fabricante: "",
        numero_lote: "",
        data_aplicacao: new Date().toISOString().slice(0, 10),
        dose_esquema: "",
        via_aplicacao: "",
        proxima_dose: "",
        validade_lote: "",
        observacoes: "",
        situacao: "APLICADA"
    };

    const [formulario, setFormulario] = useState(formularioInicial);

    const carregarDados = useCallback(async (mostrarCarregamento = true) => {
        if (mostrarCarregamento) setCarregando(true);
        setErro("");

        try {
            const [resVacinas, resAnimais, resVeterinarios] = await Promise.all([
                fetch("/api/vacinas", { credentials: "include", cache: "no-store" }),
                fetch("/api/animais", { credentials: "include", cache: "no-store" }),
                fetch("/api/veterinario", { credentials: "include", cache: "no-store" })
            ]);

            const [dadosVacinas, dadosAnimais, dadosVeterinarios] = await Promise.all([
                resVacinas.json(), resAnimais.json(), resVeterinarios.json()
            ]);

            if (!resVacinas.ok) throw new Error(dadosVacinas.erro || dadosVacinas.mensagem || "Erro ao carregar vacinações.");
            if (!resAnimais.ok) throw new Error(dadosAnimais.erro || dadosAnimais.mensagem || "Erro ao carregar animais.");
            if (!resVeterinarios.ok) throw new Error(dadosVeterinarios.erro || dadosVeterinarios.mensagem || "Erro ao carregar veterinários.");

            setVacinas(Array.isArray(dadosVacinas) ? dadosVacinas : []);
            setAnimais(Array.isArray(dadosAnimais) ? dadosAnimais.filter((a: Animal) => a.situacao === "ATIVO") : []);
            setVeterinarios(Array.isArray(dadosVeterinarios) ? dadosVeterinarios.filter((v: Veterinario) => v.situacao === "ATIVO" && v.senha_confirmada) : []);
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Não foi possível carregar os dados.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        const controlador = new AbortController();

        async function buscarDados() {
            try {
                const respostas = await Promise.all([
                    fetch("/api/vacinas", { credentials: "include", cache: "no-store", signal: controlador.signal }),
                    fetch("/api/animais", { credentials: "include", cache: "no-store", signal: controlador.signal }),
                    fetch("/api/veterinario", { credentials: "include", cache: "no-store", signal: controlador.signal })
                ]);

                const dados = await Promise.all(respostas.map(r => r.json()));

                for (let i = 0; i < respostas.length; i++) {
                    if (!respostas[i].ok) throw new Error(dados[i].erro || dados[i].mensagem || "Erro ao carregar dados.");
                }

                setVacinas(Array.isArray(dados[0]) ? dados[0] : []);
                setAnimais(Array.isArray(dados[1]) ? dados[1].filter((a: Animal) => a.situacao === "ATIVO") : []);
                setVeterinarios(Array.isArray(dados[2]) ? dados[2].filter((v: Veterinario) => v.situacao === "ATIVO" && v.senha_confirmada) : []);
            } catch (e) {
                if (e instanceof Error && e.name === "AbortError") return;
                setErro(e instanceof Error ? e.message : "Erro ao carregar dados.");
            } finally {
                if (!controlador.signal.aborted) setCarregando(false);
            }
        }

        buscarDados();
        return () => controlador.abort();
    }, []);

    function atualizar(campo: string, valor: string | boolean) {
        setFormulario(anterior => ({ ...anterior, [campo]: valor }));
    }

    async function cadastrarVacina(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");
        setMensagem("");

        if (!formulario.id_animal || !formulario.id_veterinario || !formulario.nome_vacina.trim() || !formulario.tipo_vacina.trim() || !formulario.fabricante.trim() || !formulario.numero_lote.trim() || !formulario.dose_esquema.trim() || !formulario.via_aplicacao.trim() || !formulario.data_aplicacao) {
            setErro("Preencha todos os campos obrigatórios.");
            return;
        }

        setSalvando(true);

        try {
            const resposta = await fetch("/api/vacinas", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formulario,
                    id_veterinario: Number(formulario.id_veterinario),
                    proxima_dose: formulario.proxima_dose || null,
                    validade_lote: formulario.validade_lote || null,
                    observacoes: formulario.observacoes || null
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) throw new Error(dados.erro || dados.mensagem || "Não foi possível registrar a vacina.");

            let retorno = dados.mensagem || "Vacinação registrada com sucesso.";

            if (formulario.antirrabica && formulario.situacao === "APLICADA") {
                retorno += dados.integracao?.situacao_operacao === "CONFIRMADA"
                    ? ` Comunicação governamental confirmada. Protocolo: ${dados.integracao.protocolo_externo || "Recebido"}.`
                    : " A vacinação foi salva localmente, mas a comunicação governamental está pendente ou apresentou falha.";
            }

            setMensagem(retorno);
            setFormulario(formularioInicial);
            setMostrarFormulario(false);
            await carregarDados(false);
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao registrar vacinação.");
        } finally {
            setSalvando(false);
        }
    }

    async function cancelarVacina(vacina: Vacina) {
        if (!window.confirm(`Deseja cancelar o registro da vacina ${vacina.nome_vacina}?`)) return;

        setErro("");
        setMensagem("");

        try {
            const resposta = await fetch(`/api/vacinas/${vacina.id_vacina}`, {
                method: "DELETE",
                credentials: "include"
            });

            const dados = await resposta.json();

            if (!resposta.ok) throw new Error(dados.erro || dados.mensagem || "Não foi possível cancelar a vacinação.");

            setMensagem(dados.mensagem || "Vacinação cancelada com sucesso.");
            await carregarDados(false);
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao cancelar vacinação.");
        }
    }

    const formatarData = (data: string | null) => data ? new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "Não informada";

    const situacoes = {
        AGENDADA: "Agendada",
        APLICADA: "Aplicada",
        CANCELADA: "Cancelada"
    };

    const corSituacao = {
        AGENDADA: "bg-blue-50 text-blue-700",
        APLICADA: "bg-[#E8F0EA] text-[#5D7165]",
        CANCELADA: "bg-red-50 text-red-600"
    };

    const vacinasFiltradas = vacinas.filter(v =>
        [v.nome_vacina, v.tipo_vacina, v.animal?.nome || "", v.veterinario?.nome_completo || "", v.numero_lote]
            .some(valor => valor.toLowerCase().includes(pesquisa.trim().toLowerCase()))
    );

    const totalAplicadas = vacinas.filter(v => v.situacao === "APLICADA").length;
    const totalAgendadas = vacinas.filter(v => v.situacao === "AGENDADA").length;
    const totalAntirrabicas = vacinas.filter(v => v.antirrabica && v.situacao === "APLICADA").length;

    const campo = "w-full rounded-lg border border-[#E7E5DF] px-3 py-2.5 text-sm text-[#343A40] outline-none transition focus:border-[#718879]";
    const rotulo = "mb-1.5 block text-sm font-medium text-[#343A40]";

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#343A40]">Gerenciamento de vacinas</h2>
                <p className="mt-2 text-sm text-[#6B7280]">Registre aplicações e acompanhe o histórico de vacinação dos animais.</p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    { titulo: "Vacinas aplicadas", valor: totalAplicadas, cor: "text-[#5D7165]" },
                    { titulo: "Vacinas agendadas", valor: totalAgendadas, cor: "text-[#343A40]" },
                    { titulo: "Aplicações antirrábicas", valor: totalAntirrabicas, cor: "text-[#343A40]" }
                ].map(card => (
                    <div key={card.titulo} className="rounded-xl border border-[#E7E5DF] bg-white p-5">
                        <p className="text-sm text-[#6B7280]">{card.titulo}</p>
                        <p className={`mt-2 text-2xl font-bold ${card.cor}`}>{card.valor}</p>
                    </div>
                ))}
            </div>

            {mostrarFormulario && (
                <section className="mb-6 overflow-hidden rounded-xl border border-[#E7E5DF] bg-white">
                    <div className="border-b border-[#E7E5DF] px-6 py-5">
                        <h3 className="text-lg font-semibold text-[#343A40]">Registrar vacinação</h3>
                        <p className="mt-1 text-sm text-[#6B7280]">Informe os dados da aplicação.</p>
                    </div>

                    <form onSubmit={cadastrarVacina} className="space-y-5 p-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className={rotulo}>Animal *</label>
                                <select required className={campo} value={formulario.id_animal} onChange={e => atualizar("id_animal", e.target.value)}>
                                    <option value="">Selecione um animal</option>
                                    {animais.map(a => <option key={a.id_animal} value={a.id_animal}>{a.nome}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className={rotulo}>Veterinário responsável *</label>
                                <select required className={campo} value={formulario.id_veterinario} onChange={e => atualizar("id_veterinario", e.target.value)}>
                                    <option value="">Selecione um veterinário</option>
                                    {veterinarios.map(v => <option key={v.id_veterinario} value={v.id_veterinario}>{v.nome_completo}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className={rotulo}>Nome da vacina *</label>
                                <input required className={campo} value={formulario.nome_vacina} onChange={e => atualizar("nome_vacina", e.target.value)} placeholder="Ex.: Antirrábica" />
                            </div>

                            <div>
                                <label className={rotulo}>Tipo de vacina *</label>
                                <select required className={campo} value={formulario.tipo_vacina} onChange={e => atualizar("tipo_vacina", e.target.value)}>
                                    <option value="">Selecione o tipo</option>
                                    <option value="VIRAL">Viral</option>
                                    <option value="BACTERIANA">Bacteriana</option>
                                    <option value="MULTIPLA">Múltipla</option>
                                    <option value="OUTRA">Outra</option>
                                </select>
                            </div>

                            <div>
                                <label className={rotulo}>Fabricante *</label>
                                <input required className={campo} value={formulario.fabricante} onChange={e => atualizar("fabricante", e.target.value)} />
                            </div>

                            <div>
                                <label className={rotulo}>Número do lote *</label>
                                <input required className={campo} value={formulario.numero_lote} onChange={e => atualizar("numero_lote", e.target.value)} />
                            </div>

                            <div>
                                <label className={rotulo}>Data de aplicação *</label>
                                <input required type="date" max={new Date().toISOString().slice(0, 10)} className={campo} value={formulario.data_aplicacao} onChange={e => atualizar("data_aplicacao", e.target.value)} />
                            </div>

                            <div>
                                <label className={rotulo}>Dose / etapa do esquema *</label>
                                <input required className={campo} value={formulario.dose_esquema} onChange={e => atualizar("dose_esquema", e.target.value)} placeholder="Ex.: 1ª dose, reforço anual" />
                            </div>

                            <div>
                                <label className={rotulo}>Via de aplicação *</label>
                                <select required className={campo} value={formulario.via_aplicacao} onChange={e => atualizar("via_aplicacao", e.target.value)}>
                                    <option value="">Selecione a via</option>
                                    <option value="SUBCUTANEA">Subcutânea</option>
                                    <option value="INTRAMUSCULAR">Intramuscular</option>
                                    <option value="ORAL">Oral</option>
                                    <option value="INTRANASAL">Intranasal</option>
                                    <option value="OUTRA">Outra</option>
                                </select>
                            </div>

                            <div>
                                <label className={rotulo}>Próxima dose</label>
                                <input type="date" className={campo} value={formulario.proxima_dose} onChange={e => atualizar("proxima_dose", e.target.value)} />
                            </div>

                            <div>
                                <label className={rotulo}>Validade do lote</label>
                                <input type="date" min={formulario.data_aplicacao} className={campo} value={formulario.validade_lote} onChange={e => atualizar("validade_lote", e.target.value)} />
                            </div>

                            <div>
                                <label className={rotulo}>Situação</label>
                                <select className={campo} value={formulario.situacao} onChange={e => atualizar("situacao", e.target.value)}>
                                    <option value="APLICADA">Aplicada</option>
                                    <option value="AGENDADA">Agendada</option>
                                    <option value="CANCELADA">Cancelada</option>
                                </select>
                            </div>
                        </div>

                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#E7E5DF] p-4">
                            <input type="checkbox" checked={formulario.antirrabica} onChange={e => atualizar("antirrabica", e.target.checked)} className="h-4 w-4 accent-[#718879]" />
                            <span>
                                <span className="block text-sm font-medium text-[#343A40]">Vacina antirrábica</span>
                                <span className="text-xs text-[#6B7280]">A aplicação será comunicada à API governamental quando registrada como aplicada.</span>
                            </span>
                        </label>

                        <div>
                            <label className={rotulo}>Observações</label>
                            <textarea rows={3} className={campo} value={formulario.observacoes} onChange={e => atualizar("observacoes", e.target.value)} placeholder="Informações adicionais..." />
                        </div>

                        {erro && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erro}</div>}

                        <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#E7E5DF] pt-5 sm:flex-row">
                            <button type="button" onClick={() => { setMostrarFormulario(false); setErro(""); }} disabled={salvando} className="rounded-lg border border-[#E7E5DF] px-5 py-2.5 text-sm font-medium text-[#343A40] hover:bg-[#FAF9F6]">Cancelar</button>
                            <button type="submit" disabled={salvando || !animais.length || !veterinarios.length} className="rounded-lg bg-[#718879] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#5D7165] disabled:opacity-50">{salvando ? "Registrando..." : "Registrar vacinação"}</button>
                        </div>
                    </form>
                </section>
            )}

            <section className="overflow-hidden rounded-xl border border-[#E7E5DF] bg-white">
                <div className="flex flex-col gap-3 border-b border-[#E7E5DF] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-[#343A40]">Histórico de vacinações</h3>
                        <p className="mt-1 text-sm text-[#6B7280]">Relação das vacinas registradas na clínica.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setMostrarFormulario(!mostrarFormulario)} className="rounded-lg bg-[#718879] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5D7165]">+ Nova vacinação</button>
                        <button type="button" onClick={() => carregarDados()} disabled={carregando} className="rounded-lg border border-[#E7E5DF] px-4 py-2 text-sm font-medium text-[#343A40] hover:bg-[#FAF9F6] disabled:opacity-50">{carregando ? "Atualizando..." : "Atualizar lista"}</button>
                    </div>
                </div>

                {mensagem && <div className="m-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">{mensagem}</div>}
                {erro && <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erro}<button type="button" onClick={() => carregarDados()} className="ml-3 font-semibold underline">Tentar novamente</button></div>}

                <div className="border-b border-[#E7E5DF] p-4">
                    <input value={pesquisa} onChange={e => setPesquisa(e.target.value)} placeholder="Pesquisar vacina, animal, veterinário ou lote..." className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]" />
                    <p className="mt-2 text-xs text-[#6B7280]">{vacinasFiltradas.length} vacinação(ões) encontrada(s)</p>
                </div>

                {carregando ? (
                    <div className="p-10 text-center text-sm text-[#6B7280]">Carregando vacinações...</div>
                ) : !erro && vacinas.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="font-medium text-[#343A40]">Nenhuma vacinação registrada.</p>
                        <p className="mt-2 text-sm text-[#6B7280]">As vacinações cadastradas aparecerão nesta lista.</p>
                    </div>
                ) : !erro && vacinasFiltradas.length === 0 ? (
                    <div className="p-10 text-center text-sm text-[#6B7280]">Nenhuma vacinação encontrada.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-250 text-left text-sm">
                            <thead className="bg-[#FAF9F6] text-xs uppercase text-[#6B7280]">
                                <tr>
                                    {["Vacina", "Animal", "Veterinário", "Aplicação", "Próxima dose", "Lote", "Situação", "Ações"].map(t => <th key={t} className="px-5 py-4 font-semibold">{t}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E7E5DF]">
                                {vacinasFiltradas.map(v => (
                                    <tr key={v.id_vacina} className="transition hover:bg-[#FAF9F6]">
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-[#343A40]">{v.nome_vacina}</p>
                                            <p className="mt-1 text-xs text-[#6B7280]">{v.tipo_vacina}{v.antirrabica ? " · Antirrábica" : ""}</p>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4">{v.animal?.nome || "Não informado"}</td>
                                        <td className="whitespace-nowrap px-5 py-4">{v.veterinario?.nome_completo || "Não informado"}</td>
                                        <td className="whitespace-nowrap px-5 py-4">{formatarData(v.data_aplicacao)}</td>
                                        <td className="whitespace-nowrap px-5 py-4">{formatarData(v.proxima_dose)}</td>
                                        <td className="whitespace-nowrap px-5 py-4">{v.numero_lote}</td>
                                        <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${corSituacao[v.situacao] || "bg-gray-100 text-gray-600"}`}>{situacoes[v.situacao] || v.situacao}</span></td>
                                        <td className="px-5 py-4">
                                            {v.situacao !== "CANCELADA" && <button type="button" onClick={() => cancelarVacina(v)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50">Cancelar</button>}
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
