
"use client";

import { useEffect, useState, type FormEvent } from "react";

type Veterinario = {
    id_veterinario: number;
    nome_completo: string;
    cpf: string;
    num_cmrv: string;
    uf_cmrv: string;
    email: string;
    telefone: string;
    senha_confirmada: boolean;
    situacao: string;
};

const vazio = {
    nome_completo: "",
    cpf: "",
    num_cmrv: "",
    uf_cmrv: "RJ",
    email: "",
    telefone: "",
    senha: "",
};

const campos: [keyof typeof vazio, string, string][] = [
    ["nome_completo", "Nome completo *", "text"],
    ["cpf", "CPF *", "text"],
    ["num_cmrv", "Número CRMV *", "text"],
    ["uf_cmrv", "UF CRMV *", "text"],
    ["email", "E-mail *", "email"],
    ["telefone", "Telefone", "tel"],
    ["senha", "Senha *", "password"],
];

export default function Veterinario() {
    const [lista, setLista] = useState<Veterinario[]>([]);
    const [form, setForm] = useState(vazio);
    const [editando, setEditando] = useState<number | null>(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");

    async function carregar() {
        try {
            const r = await fetch("/api/veterinario", {
                credentials: "include",
                cache: "no-store",
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.erro || d.mensagem);
            setLista(Array.isArray(d) ? d : []);
            setErro("");
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao carregar veterinários.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        const controlador = new AbortController();

        async function iniciar() {
            try {
                const r = await fetch("/api/veterinario", {
                    credentials: "include",
                    cache: "no-store",
                    signal: controlador.signal,
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.erro || d.mensagem);
                setLista(Array.isArray(d) ? d : []);
            } catch (e) {
                if (e instanceof Error && e.name === "AbortError") return;
                setErro(e instanceof Error ? e.message : "Erro ao carregar veterinários.");
            } finally {
                if (!controlador.signal.aborted) setCarregando(false);
            }
        }

        iniciar();
        return () => controlador.abort();
    }, []);

    function limparFormulario() {
        setForm(vazio);
        setEditando(null);
        setMostrarFormulario(false);
    }

    async function salvar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMensagem("");
        setErro("");
        setSalvando(true);

        try {
            const { senha, ...dados } = form;
            const r = await fetch(editando ? `/api/veterinario/${editando}` : "/api/veterinario", {
                method: editando ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(editando ? dados : form),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.erro || d.mensagem || "Erro ao salvar veterinário.");

            setMensagem(d.linkConfirmacao
                ? `${d.mensagem} Link de confirmação: ${d.linkConfirmacao}`
                : d.mensagem || "Veterinário salvo com sucesso.");

            limparFormulario();
            await carregar();
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao salvar veterinário.");
        } finally {
            setSalvando(false);
        }
    }

    function editar(v: Veterinario) {
        setForm({
            nome_completo: v.nome_completo,
            cpf: v.cpf,
            num_cmrv: v.num_cmrv,
            uf_cmrv: v.uf_cmrv,
            email: v.email,
            telefone: v.telefone || "",
            senha: "",
        });
        setEditando(v.id_veterinario);
        setMostrarFormulario(true);
        setMensagem("");
        setErro("");
    }

    async function inativar(id: number) {
        if (!window.confirm("Deseja realmente inativar este veterinário?")) return;

        try {
            const r = await fetch(`/api/veterinario/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.erro || d.mensagem);
            setMensagem(d.mensagem || "Veterinário inativado com sucesso.");
            await carregar();
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao inativar veterinário.");
        }
    }

    return (
        <div className="space-y-6">
            {mostrarFormulario && (
                <section className="rounded-xl border border-[#E7E5DF] bg-white p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-[#343A40]">
                                {editando ? "Editar veterinário" : "Cadastrar novo veterinário"}
                            </h3>
                            <p className="mt-1 text-sm text-[#6B7280]">
                                Preencha os dados profissionais do veterinário.
                            </p>
                        </div>
                        <button type="button" onClick={limparFormulario}
                            className="rounded-lg px-3 py-2 text-sm text-[#6B7280] hover:bg-[#FAF9F6]">
                            Fechar
                        </button>
                    </div>

                    <form onSubmit={salvar} className="space-y-6">
                        {erro && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{erro}</p>}

                        <div>
                            <h4 className="mb-4 text-sm font-semibold text-[#5D7165]">Dados profissionais</h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {campos.filter(([campo]) => campo !== "senha" || !editando).map(([campo, label, tipo]) => (
                                    <div key={campo}>
                                        <label className="mb-1 block text-sm font-medium text-[#343A40]">{label}</label>
                                        <input
                                            name={campo}
                                            type={tipo}
                                            required={campo !== "telefone"}
                                            maxLength={campo === "uf_cmrv" ? 2 : undefined}
                                            placeholder={label.replace(" *", "")}
                                            value={form[campo]}
                                            onChange={e => setForm({ ...form, [campo]: campo === "uf_cmrv" ? e.target.value.toUpperCase() : e.target.value })}
                                            className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-xs text-[#6B7280]">* Campos obrigatórios.</p>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-[#E7E5DF] pt-5">
                            <button type="button" onClick={limparFormulario}
                                className="rounded-lg border border-[#E7E5DF] px-5 py-2.5 text-sm font-medium text-[#343A40] hover:bg-[#FAF9F6]">
                                Cancelar
                            </button>
                            <button type="submit" disabled={salvando}
                                className="rounded-lg bg-[#718879] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5D7165] disabled:cursor-not-allowed disabled:opacity-60">
                                {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar veterinário"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {mensagem && <p className="break-all rounded-lg bg-gray-100 p-3 text-sm text-[#343A40]">{mensagem}</p>}
            {erro && !mostrarFormulario && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{erro}</p>}

            <section className="overflow-hidden rounded-xl border border-[#E7E5DF] bg-white">
                <div className="flex flex-col gap-3 border-b border-[#E7E5DF] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-[#343A40]">Veterinários cadastrados</h3>
                        <p className="mt-1 text-sm text-[#6B7280]">Relação de profissionais registrados na clínica.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => { setForm(vazio); setEditando(null); setMostrarFormulario(true); }}
                            className="rounded-lg bg-[#718879] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5D7165]">
                            + Novo veterinário
                        </button>
                        <button type="button" onClick={() => { setCarregando(true); carregar(); }} disabled={carregando}
                            className="rounded-lg border border-[#E7E5DF] px-4 py-2 text-sm font-medium text-[#343A40] transition hover:bg-[#FAF9F6] disabled:opacity-50">
                            {carregando ? "Atualizando..." : "Atualizar lista"}
                        </button>
                    </div>
                </div>

                {carregando ? (
                    <div className="p-10 text-center text-sm text-[#6B7280]">Carregando veterinários...</div>
                ) : lista.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="font-medium text-[#343A40]">Nenhum veterinário cadastrado.</p>
                        <p className="mt-2 text-sm text-[#6B7280]">Os profissionais cadastrados aparecerão nesta lista.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#FAF9F6] text-[#6B7280]">
                                <tr>
                                    {["Nome", "CRMV", "E-mail", "Senha", "Situação", "Ações"].map(t => (
                                        <th key={t} className="p-4 font-medium">{t}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lista.map(v => (
                                    <tr key={v.id_veterinario} className="border-t border-[#E7E5DF]">
                                        <td className="p-4 font-medium text-[#343A40]">{v.nome_completo}</td>
                                        <td className="p-4">{v.num_cmrv}/{v.uf_cmrv}</td>
                                        <td className="p-4">{v.email}</td>
                                        <td className="p-4">{v.senha_confirmada ? "Confirmada" : "Pendente"}</td>
                                        <td className="p-4">{v.situacao}</td>
                                        <td className="space-x-2 p-4">
                                            <button type="button" onClick={() => editar(v)}
                                                className="rounded-lg border border-[#E7E5DF] px-3 py-2 text-xs font-medium text-[#343A40] transition hover:bg-[#FAF9F6]">
                                                Editar
                                            </button>
                                            {v.situacao !== "INATIVO" && (
                                                <button type="button" onClick={() => inativar(v.id_veterinario)}
                                                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50">
                                                    Inativar
                                                </button>
                                            )}
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

