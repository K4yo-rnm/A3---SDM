
"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";

type Consulta = {
  id_consulta: number;
  data_hora: string;
  motivo_atendimento: string;
  situacao: string;
  animal?: { nome: string };
};

type Vacina = {
  id_vacina: number;
  nome_vacina: string;
  proxima_dose: string | null;
  animal?: { nome: string };
};

type Integracao = {
  id_integracao: number;
  situacao_operacao: string;
};

export default function Home() {
  const [tutores, setTutores] = useState(0);
  const [animais, setAnimais] = useState(0);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [integracoes, setIntegracoes] = useState<Integracao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function carregar() {
      try {
        const urls = ["/api/tutores", "/api/animais", "/api/consultas", "/api/vacinas", "/api/integracao-governo"];
        const respostas = await Promise.all(urls.map(url => fetch(url, {
          credentials: "include", cache: "no-store", signal: controlador.signal,
        })));
        const dados = await Promise.all(respostas.map(r => r.json()));

        const falha = respostas.findIndex(r => !r.ok);
        if (falha !== -1) throw new Error(dados[falha].erro || dados[falha].mensagem || "Não foi possível carregar o Dashboard.");

        setTutores(dados[0].total ?? dados[0].dados?.length ?? 0);
        setAnimais(Array.isArray(dados[1]) ? dados[1].length : 0);
        setConsultas(Array.isArray(dados[2]) ? dados[2] : []);
        setVacinas(Array.isArray(dados[3]) ? dados[3] : []);
        setIntegracoes(Array.isArray(dados[4]) ? dados[4] : []);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setErro(e instanceof Error ? e.message : "Erro ao carregar o Dashboard.");
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregar();
    return () => controlador.abort();
  }, []);

  const hoje = new Date();
  const consultasHoje = consultas.filter(c => new Date(c.data_hora).toDateString() === hoje.toDateString());
  const proximasVacinas = vacinas.filter(v => v.proxima_dose && new Date(v.proxima_dose) >= hoje)
    .sort((a, b) => new Date(a.proxima_dose!).getTime() - new Date(b.proxima_dose!).getTime()).slice(0, 5);
  const pendentes = integracoes.filter(i => i.situacao_operacao === "PENDENTE").length;
  const recentes = [...consultas].sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()).slice(0, 5);
  const formatarData = (valor: string) => new Date(valor).toLocaleString("pt-BR");

  const cards = [
    ["Tutores cadastrados", tutores],
    ["Animais registrados", animais],
    ["Consultas de hoje", consultasHoje.length],
    ["Integrações pendentes", pendentes],
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#343A40]">Visão geral da clínica</h2>
        <p className="mt-2 text-sm text-[#6B7280]">Acompanhe os principais indicadores e atividades da clínica veterinária.</p>
      </div>

      {erro && <p className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">{erro}</p>}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([titulo, valor]) => (
          <div key={titulo} className="rounded-xl border border-[#E7E5DF] bg-white p-5">
            <p className="text-sm text-[#6B7280]">{titulo}</p>
            <p className="mt-2 text-2xl font-bold text-[#343A40]">{carregando ? "—" : valor}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-[#E7E5DF] bg-white">
          <div className="border-b border-[#E7E5DF] px-6 py-5">
            <h3 className="text-lg font-semibold text-[#343A40]">Próximas vacinas</h3>
            <p className="mt-1 text-sm text-[#6B7280]">Acompanhe as próximas doses dos animais.</p>
          </div>
          {carregando ? <p className="p-6 text-sm text-[#6B7280]">Carregando...</p> : proximasVacinas.length ? (
            <div className="divide-y divide-[#E7E5DF]">
              {proximasVacinas.map(v => (
                <div key={v.id_vacina} className="flex justify-between gap-3 px-6 py-4">
                  <div>
                    <p className="font-medium text-[#343A40]">{v.nome_vacina}</p>
                    <p className="mt-1 text-xs text-[#6B7280]">{v.animal?.nome || "Animal não informado"}</p>
                  </div>
                  <p className="whitespace-nowrap text-sm text-[#5D7165]">{new Date(v.proxima_dose!).toLocaleDateString("pt-BR")}</p>
                </div>
              ))}
            </div>
          ) : <p className="p-6 text-sm text-[#6B7280]">Nenhuma próxima dose cadastrada.</p>}
        </section>

        <section className="overflow-hidden rounded-xl border border-[#E7E5DF] bg-white">
          <div className="border-b border-[#E7E5DF] px-6 py-5">
            <h3 className="text-lg font-semibold text-[#343A40]">Últimas atividades</h3>
            <p className="mt-1 text-sm text-[#6B7280]">Consultas registradas recentemente.</p>
          </div>
          {carregando ? <p className="p-6 text-sm text-[#6B7280]">Carregando...</p> : recentes.length ? (
            <div className="divide-y divide-[#E7E5DF]">
              {recentes.map(c => (
                <div key={c.id_consulta} className="flex justify-between gap-3 px-6 py-4">
                  <div>
                    <p className="font-medium text-[#343A40]">{c.animal?.nome || "Animal não informado"}</p>
                    <p className="mt-1 text-xs text-[#6B7280]">{c.motivo_atendimento}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#5D7165]">{c.situacao}</p>
                    <p className="mt-1 whitespace-nowrap text-xs text-[#6B7280]">{formatarData(c.data_hora)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="p-6 text-sm text-[#6B7280]">Nenhuma atividade registrada.</p>}
        </section>
      </div>
    </AppLayout>
  );
}

