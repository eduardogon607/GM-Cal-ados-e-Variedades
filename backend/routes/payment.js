const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// ============================================
// CONFIGURAÇÃO DO ASAAS
// ============================================
const ASAAS_BASE_URL = process.env.ASAAS_SANDBOX === "true"
  ? "https://api-sandbox.asaas.com/v3"
  : "https://api.asaas.com/v3";

const ASAAS_HEADERS = {
  "Content-Type": "application/json",
  "access_token": process.env.ASAAS_API_KEY,
};

// ============================================
// CONFIGURAÇÃO DE PASTAS DO BANCO
// ============================================
const STORAGE_DIR = path.join(__dirname, "..", "storage");
const DATA_DIR = path.join(STORAGE_DIR, "data");
const ORDERS_FILE = path.join(DATA_DIR, "pedidos.json");



const CONFIG_FILE = path.join(DATA_DIR, "config.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({
    title: "Coleção Premium",
    subtitle: "Qualidade e elegância em cada detalhe",
    imageUrl: ""
  }, null, 2));
}

function readOrders() {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "[]"); } catch { return []; }
}
function writeOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// ============================================
// 1. CRIAR CHECKOUT E SALVAR COMANDA
// POST /api/create-preference
// ============================================
router.post("/create-preference", async (req, res) => {
  try {
    const { items, clienteNome } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio" });
    }

    // Gera um ID único para o pedido
    const orderId = `PED-${Date.now()}`;
    const total = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const formattedItems = items.map((item) => ({
      name: String(item.name).substring(0, 255),
      description: item.size ? `Tamanho: ${item.size}` : "",
      quantity: Number(item.qty) || 1,
      value: Number(item.price),
    }));

    // --- SALVA NO BANCO DE DADOS (Como Pendente) ---
    const orders = readOrders();
    const newOrder = {
      id: orderId,
      cliente: clienteNome || "Cliente não identificado",
      data: new Date().toLocaleString("pt-BR"),
      itens: items,
      total: total,
      status: "Aguardando Pagamento",
      linkPagamento: ""
    };

    const checkoutBody = {
      billingTypes: ["PIX", "CREDIT_CARD"],
      chargeTypes: ["DETACHED", "INSTALLMENT"],
      installment: { maxInstallmentCount: 3 },
      minutesToExpire: 60,
      externalReference: orderId,
      callback: {
        successUrl: `${process.env.BACKEND_URL}/success?order=${orderId}`,
        cancelUrl: `${process.env.BACKEND_URL}/failure`,
        expiredUrl: `${process.env.BACKEND_URL}/pending`,
      },
      items: formattedItems,
    };

    console.log(`📤 Criando pedido ${orderId} no Asaas...`);
    const response = await fetch(`${ASAAS_BASE_URL}/checkouts`, {
      method: "POST",
      headers: ASAAS_HEADERS,
      body: JSON.stringify(checkoutBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: "Falha no Asaas", details: data });
    }

    const checkoutUrl = `https://asaas.com/checkoutSession/show?id=${data.id}`;
    
    // Salva o link no pedido e atualiza o JSON
    newOrder.linkPagamento = checkoutUrl;
    orders.push(newOrder);
    writeOrders(orders);

    console.log(`✅ Pedido ${orderId} aguardando pagamento.`);
    res.json({ id: data.id, init_point: checkoutUrl, orderId });

  } catch (error) {
    console.error("❌ Erro:", error);
    res.status(500).json({ error: "Falha ao criar pagamento" });
  }
});

// ============================================
// 2. WEBHOOK — CONFIRMAR PAGAMENTO E ATUALIZAR
// POST /api/webhook
// ============================================
router.post("/webhook", async (req, res) => {
  try {
    const { event, payment, checkout } = req.body;
    
    let refPedido = checkout?.externalReference || payment?.externalReference;

    if ((event === "CHECKOUT_PAID" || event === "PAYMENT_RECEIVED") && refPedido) {
      const orders = readOrders();
      const orderIndex = orders.findIndex(o => o.id === refPedido);

      if (orderIndex !== -1) {
        orders[orderIndex].status = "Pago";
        writeOrders(orders);
        console.log(`🎉 Pedido ${refPedido} marcado como PAGO!`);
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    res.status(200).send("OK");
  }
});

// ============================================
// 3. ROTA PARA O ADMIN LISTAR OS PEDIDOS
// GET /api/orders
// ============================================
router.get("/orders", (req, res) => {
  const orders = readOrders();
  res.json(orders.reverse());
});

// ============================================
// 4. ROTA PARA BUSCAR UM PEDIDO ESPECÍFICO
// GET /api/orders/:id
// ============================================
router.get("/orders/:id", (req, res) => {
  const orders = readOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
  res.json(order);
});

module.exports = router;





