const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// ============================================
// CONFIGURAÇÃO DE PASTAS
// ============================================
const STORAGE_DIR = path.join(__dirname, "..", "storage");
const DATA_DIR = path.join(STORAGE_DIR, "data");
const FINANCEIRO_FILE = path.join(DATA_DIR, "financeiro.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(FINANCEIRO_FILE)) fs.writeFileSync(FINANCEIRO_FILE, JSON.stringify([], null, 2));

function readFinanceiro() {
  try { return JSON.parse(fs.readFileSync(FINANCEIRO_FILE, "utf8") || "[]"); } catch { return []; }
}
function writeFinanceiro(data) {
  fs.writeFileSync(FINANCEIRO_FILE, JSON.stringify(data, null, 2));
}

// ============================================
// 1. LISTAR MOVIMENTAÇÕES
// GET /api/financeiro
// ============================================
router.get("/financeiro", (req, res) => {
  const dados = readFinanceiro();
  res.json(dados.reverse()); // Mais recente primeiro
});

// ============================================
// 2. ADICIONAR MOVIMENTAÇÃO (Entrada ou Saída)
// POST /api/financeiro
// ============================================
router.post("/financeiro", (req, res) => {
  try {
    const { tipo, descricao, valor, categoria, data } = req.body;

    if (!tipo || !descricao || !valor) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    const dados = readFinanceiro();
    const novaMovimentacao = {
      id: Date.now(),
      tipo, // "entrada" ou "saida"
      descricao,
      valor: parseFloat(valor),
      categoria: categoria || "Geral",
      data: data || new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
      createdAt: new Date().toISOString(),
    };

    dados.push(novaMovimentacao);
    writeFinanceiro(dados);

    console.log(`✓ Movimentação registrada: ${tipo} - ${descricao}`);
    res.status(201).json(novaMovimentacao);
  } catch (error) {
    console.error("Erro ao salvar movimentação:", error);
    res.status(500).json({ error: "Erro ao salvar movimentação." });
  }
});

// ============================================
// 3. EXCLUIR MOVIMENTAÇÃO
// DELETE /api/financeiro/:id
// ============================================
router.delete("/financeiro/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let dados = readFinanceiro();
    dados = dados.filter((d) => d.id !== id);
    writeFinanceiro(dados);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir movimentação." });
  }
});

module.exports = router;