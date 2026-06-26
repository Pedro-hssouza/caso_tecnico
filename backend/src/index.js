const express = require("express");
const cors = require("cors");
const projetos = require("./data/projetos");
const { enriquecerProjeto } = require("./rules/calculos");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// GET /projetos — lista todos os projetos com saldo e status calculados
app.get("/projetos", (req, res) => {
  const projetosEnriquecidos = projetos.map(enriquecerProjeto);
  res.json(projetosEnriquecidos);
});

// GET /projetos/:id — detalhe de um projeto específico
app.get("/projetos/:id", (req, res) => {
  const projeto = projetos.find((p) => p.id === req.params.id);

  if (!projeto) {
    return res.status(404).json({ erro: "Projeto não encontrado" });
  }

  res.json(enriquecerProjeto(projeto));
});

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
  console.log(`📋 Projetos disponíveis em http://localhost:${PORT}/projetos`);
});
