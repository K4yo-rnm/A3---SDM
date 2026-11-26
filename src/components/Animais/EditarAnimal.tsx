"use client";

import { useEffect, useState, type FormEvent } from "react";

interface Animal {
    id_animal: string; nome: string; data_nascimento: string | null; idade_estimada: number | null;
    sexo: string | null; cor: string | null; peso_atual: number | null; situacao: string;
    id_tutor: number; id_especie: number; id_raca: number | null;
}
interface Tutor { id_tutor: number; nome_completo: string; situacao: string }
interface Especie { id_especie: number; nome: string; situacao: string }
interface Raca { id_raca: number; nome: string; id_especie: number; situacao: string }
interface Props { animal: Animal; onClose: () => void; onAtualizado: () => void }

export default function EditarAnimal({ animal, onClose, onAtualizado }: Props) {
    const [tutores, setTutores] = useState<Tutor[]>([]);
    const [especies, setEspecies] = useState<Especie[]>([]);
    const [racas, setRacas] = useState<Raca[]>([]);
    const [nome, setNome] = useState(animal.nome);
    const [tutor, setTutor] = useState(String(animal.id_tutor));
    const [especie, setEspecie] = useState(String(animal.id_especie));
    const [raca, setRaca] = useState(animal.id_raca ? String(animal.id_raca) : "");
    const [nascimento, setNascimento] = useState(animal.data_nascimento ? new Date(animal.data_nascimento).toISOString().slice(0, 10) : "");
    const [sexo, setSexo] = useState(animal.sexo || "");
    const [cor, setCor] = useState(animal.cor || "");
    const [peso, setPeso] = useState(animal.peso_atual?.toString() || "");
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [veterinarioId, setVeterinarioId] = useState(0);
    const [microchip, setMicrochip] = useState("");
    const [microchipOriginal, setMicrochipOriginal] = useState("");
    const [motivoSubstituicao, setMotivoSubstituicao] = useState("");
    const [aviso, setAviso] = useState("");

    useEffect(() => {
        async function carregar() {
            setMotivoSubstituicao("");
            try {
                const respostas = await Promise.all([
                    fetch("/api/tutores", { credentials: "include" }),
                    fetch("/api/especie", { credentials: "include" }),
                    fetch("/api/raca", { credentials: "include" }),
                    fetch("/api/auth/me", { credentials: "include" }),
                    fetch(`/api/animais/${animal.id_animal}`, {
                        credentials: "include"
                    })
                ]);

                const [t, e, r, v, detalhes] = await Promise.all(
                    respostas.map(x => x.json())
                );

                if (respostas.some(x => !x.ok)) {
                    throw new Error("Não foi possível carregar os dados.");
                }
                
                setTutores(t.dados || []);
                setEspecies(e);
                setRacas(r);
                setVeterinarioId(Number(v.veterinario?.id_veterinario));

                const microchipAtivo = detalhes.vinculos_microchip?.find(
                    (vinculo: { situacao: string }) => vinculo.situacao === "ATIVO"
                );

                const codigoMicrochip = microchipAtivo?.codigo_microchip || "";

                setMicrochip(codigoMicrochip);
                setMicrochipOriginal(codigoMicrochip);

            } catch (e) {
                setErro(e instanceof Error ? e.message : "Erro ao carregar dados.");
                setAviso("");
            } finally {
                setCarregando(false);
            }
        }
        carregar();
    }, []);

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");
        if (!nome.trim()) return setErro("Informe o nome do animal.");
        if (!tutor || !especie) return setErro("Selecione o tutor e a espécie.");
        if (peso && Number(peso) < 0) return setErro("O peso não pode ser negativo.");

        setSalvando(true);
        try {
            const dados = {
                nome: nome.trim(),
                data_nascimento: nascimento ? new Date(`${nascimento}T12:00:00`).toISOString() : null,
                sexo: sexo || null,
                cor: cor.trim() || null,
                peso_atual: peso ? Number(peso) : null,
                ...(Number(tutor) !== animal.id_tutor && { id_tutor: Number(tutor) }),
                ...(Number(especie) !== animal.id_especie && { id_especie: Number(especie) }),
                ...(raca !== (animal.id_raca ? String(animal.id_raca) : "") && { id_raca: raca ? Number(raca) : null })
            };

            const resposta = await fetch(`/api/animais/${animal.id_animal}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });
            const resultado = await resposta.json();
            if (!resposta.ok) {
                throw new Error(resultado.erro || resultado.message || "Não foi possível atualizar o animal.");
            }

            // Vincular ou substituir microchip, se houve alteração.
            const codigoNovo = microchip.trim();
            const codigoAnterior = microchipOriginal.trim();

            if (codigoNovo !== codigoAnterior) {

                // Não permitir apagar o código sem uma operação
                // específica de desvinculação.
                if (!codigoNovo && codigoAnterior) {
                    throw new Error(
                        "Para retirar um microchip, utilize a operação de desvinculação."
                    );
                }

                if (!codigoNovo) {
                    // Nenhum microchip informado: não há operação.
                } else {
                    if (!veterinarioId) {
                        throw new Error(
                            "Não foi possível identificar o veterinário autenticado."
                        );
                    }

                    const substituindo = Boolean(codigoAnterior);

                    if (substituindo && !motivoSubstituicao.trim()) {
                        throw new Error(
                            "Informe o motivo da substituição do microchip."
                        );
                    }

                    const urlMicrochip = substituindo
                        ? `/api/animais/${animal.id_animal}/microchip/substituir`
                        : `/api/animais/${animal.id_animal}/microchip`;

                    const respostaMicrochip = await fetch(urlMicrochip, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            codigo_microchip: codigoNovo,
                            id_veterinario: veterinarioId,
                            ...(substituindo && {
                                motivo_substituicao: motivoSubstituicao.trim()
                            })
                        })
                    });

                    const resultadoMicrochip = await respostaMicrochip.json();

                    if (!respostaMicrochip.ok) {
                        setAviso(
                            `Animal atualizado, mas o microchip não foi alterado: ${resultadoMicrochip.erro || "Erro desconhecido."
                            }`
                        );
                        onAtualizado();
                        return;
                    }
                }
            }

            onAtualizado();
            onClose();
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao atualizar animal.");
        } finally {
            setSalvando(false);
        }
    }

    const campo = "w-full rounded-lg border border-[#E7E5DF] bg-white px-3 py-2 text-sm outline-none focus:border-[#718879]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
            <form onSubmit={salvar} className="my-auto w-full max-w-2xl space-y-4 rounded-xl bg-[#FAF9F6] p-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[#343A40]">Editar animal</h2>
                    <button type="button" onClick={onClose} className="text-xl text-gray-500">×</button>
                </div>

                {erro && <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700">{erro}</p>}
                {aviso && (
                    <p className="rounded-lg bg-yellow-100 p-3 text-sm text-yellow-800">
                        {aviso}
                    </p>
                )}
                {carregando ? <p className="py-6 text-center text-sm text-[#6B7280]">Carregando dados...</p> : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm text-[#343A40]">Nome *
                            <input value={nome} onChange={e => setNome(e.target.value)} required maxLength={100} className={campo} />
                        </label>
                        <label className="text-sm text-[#343A40]">Tutor *
                            <select value={tutor} onChange={e => setTutor(e.target.value)} required className={campo}>
                                <option value="">Selecione</option>
                                {tutores.filter(t => t.situacao === "ATIVO" || t.id_tutor === animal.id_tutor).map(t => <option key={t.id_tutor} value={t.id_tutor}>{t.nome_completo}{t.situacao !== "ATIVO" ? " (Inativo)" : ""}</option>)}
                            </select>
                        </label>
                        <label className="text-sm text-[#343A40]">Espécie *
                            <select value={especie} onChange={e => { setEspecie(e.target.value); setRaca(""); }} required className={campo}>
                                <option value="">Selecione</option>
                                {especies.filter(e => e.situacao === "ATIVO" || e.id_especie === animal.id_especie).map(e => <option key={e.id_especie} value={e.id_especie}>{e.nome}{e.situacao !== "ATIVO" ? " (Inativa)" : ""}</option>)}
                            </select>
                        </label>
                        <label className="text-sm text-[#343A40]">Raça
                            <select value={raca} onChange={e => setRaca(e.target.value)} className={campo}>
                                <option value="">Sem raça / Não informada</option>
                                {racas.filter(r => r.id_especie === Number(especie) && (r.situacao === "ATIVO" || r.id_raca === animal.id_raca)).map(r => <option key={r.id_raca} value={r.id_raca}>{r.nome}{r.situacao !== "ATIVO" ? " (Inativa)" : ""}</option>)}
                            </select>
                        </label>
                        <label className="text-sm text-[#343A40]">Data de nascimento
                            <input type="date" value={nascimento} onChange={e => setNascimento(e.target.value)} className={campo} />
                        </label>
                        <label className="text-sm text-[#343A40]">Sexo
                            <select value={sexo} onChange={e => setSexo(e.target.value)} className={campo}>
                                <option value="">Não informado</option><option value="MACHO">Macho</option><option value="FEMEA">Fêmea</option>
                            </select>
                        </label>
                        <label className="text-sm text-[#343A40]">Cor
                            <input value={cor} onChange={e => setCor(e.target.value)} maxLength={80} className={campo} />
                        </label>
                        <label className="text-sm text-[#343A40]">Peso atual (kg)
                            <input type="number" min="0" step="0.01" value={peso} onChange={e => setPeso(e.target.value)} className={campo} />
                        </label>
                        <label className="text-sm text-[#343A40]">Microchip (opcional)
                            <input
                                value={microchip}
                                onChange={e => setMicrochip(e.target.value)}
                                inputMode="numeric"
                                maxLength={30}
                                placeholder="Digite o código do microchip"
                                className={campo}
                            />
                        </label>
                        {microchipOriginal &&
                            microchip.trim() !== microchipOriginal.trim() && (
                                <label className="text-sm text-[#343A40]">
                                    Motivo da substituição *
                                    <input
                                        value={motivoSubstituicao}
                                        onChange={e => setMotivoSubstituicao(e.target.value)}
                                        required
                                        maxLength={255}
                                        placeholder="Ex.: Microchip danificado"
                                        className={campo}
                                    />
                                </label>
                            )}
                    </div>
                )}

                <div className="flex justify-end gap-3 border-t border-[#E7E5DF] pt-4">
                    <button type="button" onClick={onClose} className="rounded-lg border border-[#E7E5DF] px-4 py-2 text-sm">Cancelar</button>
                    <button type="submit" disabled={carregando || salvando} className="rounded-lg bg-[#718879] px-5 py-2 text-sm font-medium text-white disabled:opacity-50">
                        {salvando ? "Salvando..." : "Salvar alterações"}
                    </button>
                </div>
            </form>
        </div>
    );
}
