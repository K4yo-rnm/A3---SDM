
"use client";

import { useEffect, useState } from "react";

interface Animal {
    id_animal: string;
    nome: string;
    situacao: "ATIVO" | "INATIVO";
    tutor?: { nome_completo: string };
}

interface Veterinario {
    id_veterinario: number;
    nome_completo: string;
    situacao: "ATIVO" | "INATIVO";
    senha_confirmada: boolean;
}

interface NovoAtendimentoProps {
    onClose: () => void;
    onCadastrado: () => void;
}

export default function NovoAtendimento({ onClose, onCadastrado }: NovoAtendimentoProps) {
    const [animais, setAnimais] = useState<Animal[]>([]);
    const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    const [formulario, setFormulario] = useState({
        id_animal: "",
        id_veterinario: "",
        data_hora: "",
        motivo_atendimento: "",
        anamnese: "",
        sintomas: "",
        diagnostico: "",
        tratamento_prescrito: "",
        prescricao_medicamentos: "",
        peso_registrado: "",
        temperatura: "",
        observacoes: "",
        situacao: "AGENDADA"
    });

    useEffect(() => {
        async function carregarDados() {
            try {
                const [resAnimais, resVeterinarios] = await Promise.all([
                    fetch("/api/animais", { credentials: "include", cache: "no-store" }),
                    fetch("/api/veterinario", { credentials: "include", cache: "no-store" })
                ]);

                const dadosAnimais = await resAnimais.json();
                const dadosVeterinarios = await resVeterinarios.json();

                if (!resAnimais.ok) throw new Error(dadosAnimais.erro || dadosAnimais.mensagem || "Erro ao carregar animais.");
                if (!resVeterinarios.ok) throw new Error(dadosVeterinarios.erro || dadosVeterinarios.mensagem || "Erro ao carregar veterinários.");

                setAnimais(Array.isArray(dadosAnimais) ? dadosAnimais.filter((a: Animal) => a.situacao === "ATIVO") : []);
                setVeterinarios(Array.isArray(dadosVeterinarios) ? dadosVeterinarios.filter((v: Veterinario) => v.situacao === "ATIVO" && v.senha_confirmada) : []);
            } catch (e) {
                setErro(e instanceof Error ? e.message : "Não foi possível carregar os dados.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, []);

    function atualizar(campo: string, valor: string) {
        setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    }

    async function cadastrarAtendimento(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");

        if (!formulario.id_animal || !formulario.id_veterinario || !formulario.data_hora || !formulario.motivo_atendimento.trim()) {
            setErro("Preencha o animal, veterinário, data, horário e motivo do atendimento.");
            return;
        }

        setSalvando(true);

        try {
            const resposta = await fetch("/api/consultas", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formulario,
                    id_veterinario: Number(formulario.id_veterinario),
                    peso_registrado: formulario.peso_registrado ? Number(formulario.peso_registrado) : null,
                    temperatura: formulario.temperatura ? Number(formulario.temperatura) : null
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) throw new Error(dados.erro || dados.mensagem || "Não foi possível registrar o atendimento.");

            alert(dados.mensagem || "Atendimento registrado com sucesso!");
            onCadastrado();
            onClose();
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao registrar atendimento.");
        } finally {
            setSalvando(false);
        }
    }

    const campo = "w-full rounded-lg border border-[#E7E5DF] px-3 py-2.5 text-sm text-[#343A40] outline-none transition focus:border-[#718879]";
    const rotulo = "mb-1.5 block text-sm font-medium text-[#343A40]";

    if (carregando) return <div className="mb-6 rounded-xl border border-[#E7E5DF] bg-white p-8 text-center text-sm text-[#6B7280]">Carregando dados...</div>;

    return (
        <section className="mb-6 overflow-hidden rounded-xl border border-[#E7E5DF] bg-white">
            <div className="flex items-center justify-between border-b border-[#E7E5DF] px-6 py-5">
                <div>
                    <h3 className="text-lg font-semibold text-[#343A40]">Novo atendimento</h3>
                    <p className="mt-1 text-sm text-[#6B7280]">Preencha as informações da consulta veterinária.</p>
                </div>
                <button type="button" onClick={onClose} className="text-sm text-[#6B7280] hover:text-[#343A40]">Fechar</button>
            </div>

            <form onSubmit={cadastrarAtendimento} className="space-y-6 p-6">
                {erro && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erro}</div>}

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className={rotulo}>Animal *</label>
                        <select required className={campo} value={formulario.id_animal} onChange={(e) => atualizar("id_animal", e.target.value)}>
                            <option value="">Selecione um animal</option>
                            {animais.map((animal) => <option key={animal.id_animal} value={animal.id_animal}>{animal.nome} {animal.tutor?.nome_completo ? `— ${animal.tutor.nome_completo}` : ""}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={rotulo}>Veterinário responsável *</label>
                        <select required className={campo} value={formulario.id_veterinario} onChange={(e) => atualizar("id_veterinario", e.target.value)}>
                            <option value="">Selecione um veterinário</option>
                            {veterinarios.map((v) => <option key={v.id_veterinario} value={v.id_veterinario}>{v.nome_completo}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={rotulo}>Data e horário *</label>
                        <input required type="datetime-local" className={campo} value={formulario.data_hora} onChange={(e) => atualizar("data_hora", e.target.value)} />
                    </div>

                    <div>
                        <label className={rotulo}>Situação</label>
                        <select className={campo} value={formulario.situacao} onChange={(e) => atualizar("situacao", e.target.value)}>
                            <option value="AGENDADA">Agendada</option>
                            <option value="REALIZADA">Realizada</option>
                            <option value="CANCELADA">Cancelada</option>
                            <option value="NAO_COMPARECEU">Não compareceu</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={rotulo}>Motivo do atendimento *</label>
                    <input required className={campo} value={formulario.motivo_atendimento} onChange={(e) => atualizar("motivo_atendimento", e.target.value)} placeholder="Ex.: Consulta de rotina, vacinação, retorno..." />
                </div>

                <div>
                    <label className={rotulo}>Anamnese</label>
                    <textarea rows={3} className={campo} value={formulario.anamnese} onChange={(e) => atualizar("anamnese", e.target.value)} placeholder="Histórico e informações relatadas pelo tutor..." />
                </div>

                <div>
                    <label className={rotulo}>Sintomas</label>
                    <textarea rows={3} className={campo} value={formulario.sintomas} onChange={(e) => atualizar("sintomas", e.target.value)} placeholder="Sintomas apresentados pelo animal..." />
                </div>

                <div>
                    <label className={rotulo}>Diagnóstico</label>
                    <textarea rows={3} className={campo} value={formulario.diagnostico} onChange={(e) => atualizar("diagnostico", e.target.value)} placeholder="Diagnóstico clínico..." />
                </div>

                <div>
                    <label className={rotulo}>Tratamento prescrito</label>
                    <textarea rows={3} className={campo} value={formulario.tratamento_prescrito} onChange={(e) => atualizar("tratamento_prescrito", e.target.value)} placeholder="Tratamento recomendado..." />
                </div>

                <div>
                    <label className={rotulo}>Prescrição de medicamentos</label>
                    <textarea rows={3} className={campo} value={formulario.prescricao_medicamentos} onChange={(e) => atualizar("prescricao_medicamentos", e.target.value)} placeholder="Medicamentos, dosagens e orientações..." />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className={rotulo}>Peso registrado (kg)</label>
                        <input type="number" min="0.01" step="0.01" className={campo} value={formulario.peso_registrado} onChange={(e) => atualizar("peso_registrado", e.target.value)} placeholder="Ex.: 8,5" />
                    </div>

                    <div>
                        <label className={rotulo}>Temperatura (°C)</label>
                        <input type="number" min="0.01" step="0.1" className={campo} value={formulario.temperatura} onChange={(e) => atualizar("temperatura", e.target.value)} placeholder="Ex.: 38,5" />
                    </div>
                </div>

                <div>
                    <label className={rotulo}>Observações</label>
                    <textarea rows={3} className={campo} value={formulario.observacoes} onChange={(e) => atualizar("observacoes", e.target.value)} placeholder="Informações adicionais..." />
                </div>

                <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#E7E5DF] pt-5 sm:flex-row">
                    <button type="button" onClick={onClose} disabled={salvando} className="rounded-lg border border-[#E7E5DF] px-5 py-2.5 text-sm font-medium text-[#343A40] transition hover:bg-[#FAF9F6] disabled:opacity-50">Cancelar</button>
                    <button type="submit" disabled={salvando || !animais.length || !veterinarios.length} className="rounded-lg bg-[#718879] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#5D7165] disabled:opacity-50">{salvando ? "Registrando..." : "Registrar atendimento"}</button>
                </div>
            </form>
        </section>
    );
}
