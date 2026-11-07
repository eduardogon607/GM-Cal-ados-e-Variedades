const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const STORAGE_DIR = path.join(__dirname, "..", "storage");
const DATA_DIR = path.join(STORAGE_DIR, "data");
const COMANDAS_FILE = path.join(DATA_DIR, "comandas.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "produtos.json");

if (!fs.existsSync(COMANDAS_FILE)) fs.writeFileSync(COMANDAS_FILE, JSON.stringify([], null, 2));

function readComandas() {
  try { return JSON.parse(fs.readFileSync(COMANDAS_FILE, "utf8") || "[]"); } catch { return []; }
}
function writeComandas(data) {
  fs.writeFileSync(COMANDAS_FILE, JSON.stringify(data, null, 2));
}
function readProducts() {
  try { return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8") || "[]"); } catch { return []; }
}
function writeProducts(data) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
}

// ============================================
// 1. CRIAR COMANDA (Chamado pelo site ao enviar pelo WhatsApp)
// POST /api/comandas
// ============================================
router.post("/comandas", (req, res) => {
  try {
    const { clienteNome, vendedor, productId, productName, size, price } = req.body;

    if (!clienteNome || !productName) {
      return res.status(400).json({ error: "Dados incompletos." });
    }

    const comandas = readComandas();
    const novaComanda = {
      id: `CMD-${Date.now()}`,
      clienteNome,
      vendedor,
      productId,
      productName,
      size: size || "Único",
      price: parseFloat(price),
      status: "pendente", // pendente | vendida | nao-vendida
      data: new Date().toLocaleString("pt-BR"),
      createdAt: new Date().toISOString(),
    };

    comandas.push(novaComanda);
    writeComandas(comandas);

    console.log(`✓ Nova comanda pendente: ${productName} - ${clienteNome}`);
    res.status(201).json(novaComanda);
  } catch (error) {
    console.error("Erro ao criar comanda:", error);
    res.status(500).json({ error: "Erro ao criar comanda." });
  }
});

// ============================================
// 2. LISTAR TODAS AS COMANDAS
// GET /api/comandas
// ============================================
router.get("/comandas", (req, res) => {
  res.json(readComandas().reverse());
});

// ============================================
// 3. MARCAR COMANDA COMO VENDIDA (atualiza estoque)
// PUT /api/comandas/:id/status
// ============================================
router.put("/comandas/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "vendida" ou "nao-vendida"

    const comandas = readComandas();
    const comanda = comandas.find(c => c.id === id);
    if (!comanda) return res.status(404).json({ error: "Comanda não encontrada" });

    // Não deixa reverter uma comanda já vendida
    if (comanda.status === "vendida" && status !== "vendida") {
      return res.status(400).json({ error: "Comanda já foi finalizada." });
    }

    const statusAnterior = comanda.status;
    comanda.status = status;

    // Se virou "vendida", diminui no estoque
    if (status === "vendida" && statusAnterior !== "vendida") {
      const products = readProducts();
      const productIndex = products.findIndex(p => p.id === comanda.productId);
      
      if (productIndex !== -1) {
        products[productIndex].stock = Math.max(0, (products[productIndex].stock || 0) - 1);
        writeProducts(products);
      }
    }

    // Se foi revertida de "vendida" para outra coisa, devolve ao estoque
    if (statusAnterior === "vendida" && status !== "vendida") {
      const products = readProducts();
      const productIndex = products.findIndex(p => p.id === comanda.productId);
      
      if (productIndex !== -1) {
        products[productIndex].stock = (products[productIndex].stock || 0) + 1;
        writeProducts(products);
      }
    }

    writeComandas(comandas);
    res.json(comanda);
  } catch (error) {
    console.error("Erro ao atualizar comanda:", error);
    res.status(500).json({ error: "Erro ao atualizar." });
  }
});

module.exports = router;