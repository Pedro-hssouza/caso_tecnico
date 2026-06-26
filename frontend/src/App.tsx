import { useEffect, useState } from "react";
import { ProjetoCard } from "./components/ProjetoCard";

type Projeto = {
  id: string;
  nome: string;
  cliente: string;
  horas_vendidas: number;
  horas_realizadas: number;
  saldo: number;
  percentual_avanco: number;
  status: "saudavel" | "atencao" | "critico";
  data_fim_prevista: string;
  analistas: string[];
};

type Filtro = "todos" | "saudavel" | "atencao" | "critico";

const filtros: { valor: Filtro; label: string; cor: string }[] = [
  { valor: "todos", label: "Todos", cor: "#6b7280" },
  { valor: "saudavel", label: "✅ Saudável", cor: "#059669" },
  { valor: "atencao", label: "⚠️ Atenção", cor: "#d97706" },
  { valor: "critico", label: "🔴 Crítico", cor: "#dc2626" },
];

export default function App() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  useEffect(() => {
    fetch("http://localhost:3001/projetos")
      .then((res) => res.json())
      .then((dados) => {
        setProjetos(dados);
        setCarregando(false);
      })
      .catch(() => {
        setErro("Não foi possível conectar à API. Verifique se o backend está rodando.");
        setCarregando(false);
      });
  }, []);

  const projetosFiltrados =
    filtro === "todos" ? projetos : projetos.filter((p) => p.status === filtro);

  const contagem = {
    saudavel: projetos.filter((p) => p.status === "saudavel").length,
    atencao: projetos.filter((p) => p.status === "atencao").length,
    critico: projetos.filter((p) => p.status === "critico").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <header
        style={{
          background: "#1a1a2e",
          color: "#fff",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Painel de Projetos</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.6 }}>PVT Software & Serviços</p>
        </div>
        <span style={{ fontSize: 12, opacity: 0.5 }}>
          Última sync: agora (dados mockados)
        </span>
      </header>

      <main style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Resumo de status */}
        {!carregando && !erro && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Saudáveis", valor: contagem.saudavel, cor: "#059669", bg: "#d1fae5" },
              { label: "Em Atenção", valor: contagem.atencao, cor: "#d97706", bg: "#fef3c7" },
              { label: "Críticos", valor: contagem.critico, cor: "#dc2626", bg: "#fee2e2" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: item.bg,
                  borderRadius: 10,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 800, color: item.cor }}>{item.valor}</span>
                <span style={{ fontSize: 13, color: item.cor, fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        {!carregando && !erro && (
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {filtros.map((f) => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 20,
                  border: `2px solid ${filtro === f.valor ? f.cor : "#ddd"}`,
                  background: filtro === f.valor ? f.cor : "#fff",
                  color: filtro === f.valor ? "#fff" : "#555",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Estados */}
        {carregando && (
          <p style={{ textAlign: "center", color: "#888", marginTop: 60 }}>Carregando projetos...</p>
        )}

        {erro && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #dc2626",
              borderRadius: 10,
              padding: "16px 20px",
              color: "#991b1b",
              fontSize: 14,
            }}
          >
            ⚠️ {erro}
          </div>
        )}

        {/* Grid de projetos */}
        {!carregando && !erro && (
          <>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
              Exibindo {projetosFiltrados.length} projeto{projetosFiltrados.length !== 1 ? "s" : ""}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 20,
              }}
            >
              {projetosFiltrados.map((projeto) => (
                <ProjetoCard key={projeto.id} projeto={projeto} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
