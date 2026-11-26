
"use client";

import { useEffect, useState, type FormEvent } from "react";

interface Tutor { id_tutor: number; nome_completo: string; situacao: string }
interface Especie { id_especie: number; nome: string; situacao: string }
interface Raca { id_raca: number; nome: string; id_especie: number; situacao: string }

interface Props {
    onClose: () => void;
    onCadastrado: () => void | Promise<void>;
}

export default function NovoAnimal({ onClose, onCadastrado }: Props) {
    const [tutores, setTutores] = useState<Tutor[]>([]);
    const [especies, setEspecies] = useState<Especie[]>([]);
    const [racas, setRacas] = useState<Raca[]>([]);
    const [veterinarioId, setVeterinarioId] = useState(0);
    const [especieId, setEspecieId] = useState("");
    const [mostrarNovaEspecie, setMostrarNovaEspecie] = useState(false);
    const [mostrarNovaRaca, setMostrarNovaRaca] = useState(false);
    const [nomeNovaEspecie, setNomeNovaEspecie] = useState("");
    const [nomeNovaRaca, setNomeNovaRaca] = useState("");
    const [salvandoCadastro, setSalvandoCadastro] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");

    useEffect(() => {
        async function carregarDados() {
            try {
                const [t, e, r, v] = await Promise.all([
                    fetch("/api/tutores", { credentials: "include" }),
                    fetch("/api/especie", { credentials: "include" }),
                    fetch("/api/raca", { credentials: "include" }),
                    fetch("/api/auth/me", { credentials: "include" })
                ]);

                const [dt, de, dr, dv] = await Promise.all([t.json(), e.json(), r.json(), v.json()]);
                if (!t.ok || !e.ok || !r.ok || !v.ok) throw new Error("Não foi possível carregar os dados.");

                setTutores((dt.dados || []).filter((x: Tutor) => x.situacao === "ATIVO"));
                setEspecies(de.filter((x: Especie) => x.situacao === "ATIVO"));
                setRacas(dr.filter((x: Raca) => x.situacao === "ATIVO"));
                setVeterinarioId(Number(dv.veterinario?.id_veterinario));
            } catch (e) {
                setErro(e instanceof Error ? e.message : "Erro ao carregar dados.");
            } finally {
                setCarregando(false);
            }
        }
        carregarDados();
    }, []);

    async function cadastrarEspecie() {
        if (!nomeNovaEspecie.trim()) {
            setErro("Informe o nome da espécie.");
            return;
        }

        setSalvandoCadastro(true);
        setErro("");

        try {
            const resposta = await fetch("/api/especie", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome: nomeNovaEspecie.trim() }),
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.erro || "Erro ao cadastrar espécie.");
            }

            setEspecies((atual) => [...atual, dados.especie]);
            setEspecieId(String(dados.especie.id_especie));
            setNomeNovaEspecie("");
            setMostrarNovaEspecie(false);
            setAviso("Espécie cadastrada com sucesso.");
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao cadastrar espécie.");
        } finally {
            setSalvandoCadastro(false);
        }
    }

    async function cadastrarRaca() {
        if (!nomeNovaRaca.trim() || !especieId) {
            setErro("Informe o nome da raça e selecione uma espécie.");
            return;
        }

        setSalvandoCadastro(true);
        setErro("");

        try {
            const resposta = await fetch("/api/raca", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: nomeNovaRaca.trim(),
                    id_especie: Number(especieId),
                }),
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.erro || "Erro ao cadastrar raça.");
            }

            setRacas((atual) => [...atual, dados.raca]);
            setNomeNovaRaca("");
            setMostrarNovaRaca(false);
            setAviso("Raça cadastrada com sucesso.");
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao cadastrar raça.");
        } finally {
            setSalvandoCadastro(false);
        }
    }

    async function cadastrar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");
        setAviso("");
        setSalvando(true);

        const form = new FormData(event.currentTarget);
        const data = String(form.get("data_nascimento") || "");
        const codigo = String(form.get("microchip") || "").trim();

        try {
            const resposta = await fetch("/api/animais", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: String(form.get("nome")).trim(),
                    data_nascimento: data ? new Date(`${data}T12:00:00`).toISOString() : null,
                    sexo: form.get("sexo") || null,
                    cor: String(form.get("cor") || "").trim() || null,
                    peso_atual: form.get("peso") ? Number(form.get("peso")) : null,
                    id_tutor: Number(form.get("tutor")),
                    id_especie: Number(form.get("especie")),
                    id_raca: form.get("raca") ? Number(form.get("raca")) : null
                })
            });

            const dados = await resposta.json();
            if (!resposta.ok) throw new Error(dados.erro || dados.message || "Erro ao cadastrar animal.");

            if (codigo) {
                if (!veterinarioId) throw new Error("Animal cadastrado, mas não foi possível identificar o veterinário para vincular o microchip.");
                const microchip = await fetch(`/api/animais/${dados.animal.id_animal}/microchip`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        codigo_microchip: codigo,
                        id_tutor: Number(form.get("tutor")),
                        id_veterinario: veterinarioId
                    })    
                });
                const resultado = await microchip.json();
                if (!microchip.ok) {
                    setAviso(`Animal cadastrado, mas o microchip não foi vinculado: ${resultado.erro || "Erro desconhecido."}`);
                    onCadastrado();
                    return;
                }
            }

            onCadastrado();
            onClose();
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao cadastrar animal.");
        } finally {
            setSalvando(false);
        }
    }

    const campo = "w-full rounded-lg border border-[#E7E5DF] bg-white px-3 py-2 text-sm outline-none focus:border-[#718879]";

    if (carregando) return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40"><p className="rounded-xl bg-white p-6">Carregando dados...</p></div>;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
            <form onSubmit={cadastrar} className="my-auto w-full max-w-2xl space-y-4 rounded-xl bg-[#FAF9F6] p-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[#343A40]">Cadastrar animal</h2>
                    <button type="button" onClick={onClose} className="text-xl text-gray-500">×</button>
                </div>

                {erro && <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700">{erro}</p>}
                {aviso && <p className="rounded-lg bg-yellow-100 p-3 text-sm text-yellow-800">{aviso}</p>}

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm text-[#343A40]">Nome *
                        <input name="nome" required maxLength={100} className={campo} />
                    </label>

                    <label className="text-sm text-[#343A40]">Tutor *
                        <select name="tutor" required className={campo} defaultValue="">
                            <option value="" disabled>Selecione o tutor</option>
                            {tutores.map(t => <option key={t.id_tutor} value={t.id_tutor}>{t.nome_completo}</option>)}
                        </select>
                    </label>

                    <label className="text-sm text-[#343A40]">
                        Espécie *
                        <select
                            name="especie"
                            required
                            className={campo}
                            value={especieId}
                            onChange={e => setEspecieId(e.target.value)}
                        >
                            <option value="">Selecione a espécie</option>
                            {especies.map(e => (
                                <option key={e.id_especie} value={e.id_especie}>
                                    {e.nome}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        type="button"
                        onClick={() => setMostrarNovaEspecie(!mostrarNovaEspecie)}
                        className="text-sm text-[#718879] font-medium text-left"
                    >
                        + Cadastrar nova espécie
                    </button>

                    {mostrarNovaEspecie && (
                        <div className="flex gap-2 items-center">
                            <input
                                value={nomeNovaEspecie}
                                onChange={e => setNomeNovaEspecie(e.target.value)}
                                placeholder="Nome da nova espécie"
                                className={campo}
                            />
                            <button
                                type="button"
                                onClick={cadastrarEspecie}
                                disabled={salvandoCadastro}
                                className="rounded-lg bg-[#718879] px-3 py-2 text-sm text-white"
                            >
                                Salvar
                            </button>
                        </div>
                    )}

                    <label className="text-sm text-[#343A40]">
                        Raça
                        <select name="raca" className={campo} defaultValue="">
                            <option value="">Sem raça / Não informada</option>
                            {racas
                                .filter(r => r.id_especie === Number(especieId))
                                .map(r => (
                                    <option key={r.id_raca} value={r.id_raca}>
                                        {r.nome}
                                    </option>
                                ))}
                        </select>
                    </label>

                    {especieId && (
                        <>
                            <button
                                type="button"
                                onClick={() => setMostrarNovaRaca(!mostrarNovaRaca)}
                                className="text-sm text-[#718879] font-medium text-left"
                            >
                                + Cadastrar nova raça
                            </button>

                            {mostrarNovaRaca && (
                                <div className="flex gap-2 items-center">
                                    <input
                                        value={nomeNovaRaca}
                                        onChange={e => setNomeNovaRaca(e.target.value)}
                                        placeholder="Nome da nova raça"
                                        className={campo}
                                    />
                                    <button
                                        type="button"
                                        onClick={cadastrarRaca}
                                        disabled={salvandoCadastro}
                                        className="rounded-lg bg-[#718879] px-3 py-2 text-sm text-white"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    <label className="text-sm text-[#343A40]">Data de nascimento
                        <input name="data_nascimento" type="date" className={campo} />
                    </label>

                    <label className="text-sm text-[#343A40]">Sexo
                        <select name="sexo" className={campo} defaultValue="">
                            <option value="">Não informado</option>
                            <option value="MACHO">Macho</option>
                            <option value="FEMEA">Fêmea</option>
                        </select>
                    </label>

                    <label className="text-sm text-[#343A40]">Cor
                        <input name="cor" maxLength={80} className={campo} />
                    </label>

                    <label className="text-sm text-[#343A40]">Peso atual (kg)
                        <input name="peso" type="number" min="0" step="0.01" className={campo} />
                    </label>

                    <label className="text-sm text-[#343A40]">Microchip (opcional)
                        <input name="microchip" inputMode="numeric" maxLength={30} className={campo} />
                    </label>
                </div>

                <p className="text-xs text-[#6B7280]">Preencha a data de nascimento ou a idade estimada. O microchip será vinculado após o cadastro do animal.</p>

                <div className="flex justify-end gap-3 border-t border-[#E7E5DF] pt-4">
                    <button type="button" onClick={onClose} className="rounded-lg border border-[#E7E5DF] px-4 py-2 text-sm">Cancelar</button>
                    <button type="submit" disabled={salvando || !tutores.length || !especies.length} className="rounded-lg bg-[#718879] px-5 py-2 text-sm font-medium text-white disabled:opacity-50">
                        {salvando ? "Cadastrando..." : "Cadastrar animal"}
                    </button>
                </div>
            </form>
        </div>
    );
}

