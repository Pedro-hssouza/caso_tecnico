import React from "react";

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

const statusConfig = {
  saudavel: {
    label: "Saudável",
    emoji: "✅",
    cor: "#d1fae5",
    borda: "#059669",
    texto: "#065f46",
  },
  atencao: {
    label: "Atenção",
    emoji: "⚠️",
    cor: "#fef3c7",
    borda: "#d97706",
    texto: "#92400e",
  },
  critico: {
    label: "Crítico",
    emoji: "🔴",
    cor: "#fee2e2",
    borda: "#dc2626",
    texto: "#991b1b",
  },
};

export function ProjetoCard({ projeto }: { projeto: Projeto }) {
  const config = statusConfig[projeto.status];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        borderLeft: `5px solid ${config.borda}`,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>
            {projeto.nome}
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{projeto.cliente}</p>
        </div>
        <span
          style={{
            background: config.cor,
            color: config.texto,
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {config.emoji} {config.label}
        </span>
      </div>

      {/* Barra de progresso */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: "#555" }}>Avanço de horas</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>
            {projeto.percentual_avanco}%
          </span>
        </div>
        <div style={{ background: "#f0f0f0", borderRadius: 8, height: 8, overflow: "hidden" }}>
          <div
            style={{
              width: `${Math.min(projeto.percentual_avanco, 100)}%`,
              height: "100%",
              background: config.borda,
              borderRadius: 8,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Horas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        {[
          { label: "Vendidas", valor: projeto.horas_vendidas },
          { label: "Realizadas", valor: projeto.horas_realizadas },
          {
            label: "Saldo",
            valor: projeto.saldo,
            destaque: projeto.saldo < 0,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#f8f9fa",
              borderRadius: 8,
              padding: "8px 10px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: item.destaque ? "#dc2626" : "#1a1a2e",
              }}
            >
              {item.valor}h
            </div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#888" }}>
          📅 Prazo: {new Date(projeto.data_fim_prevista).toLocaleDateString("pt-BR")}
        </span>
        <span style={{ fontSize: 11, color: "#888" }}>
          👤 {projeto.analistas.join(", ")}
        </span>
      </div>
    </div>
  );
}
