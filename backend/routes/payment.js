const express = require("express");
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
// 1. CRIAR CHECKOUT DE PAGAMENTO
// POST /api/create-preference
// ============================================
router.post("/create-preference", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio ou inválido" });
    }

    // Formata itens para o padrão do Asaas
    const formattedItems = items.map((item) => ({
      name: String(item.name).substring(0, 255),
      description: item.size ? `Tamanho: ${item.size}` : "",
      quantity: Number(item.qty) || 1,
      value: Number(item.price),
    }));

    // Corpo da requisição para o Asaas
    // billingTypes: PIX e CREDIT_CARD (aceita ambos)
    // chargeTypes: DETACHED (pagamento à vista)
    const checkoutBody = {
      billingTypes: ["PIX", "CREDIT_CARD"],
      chargeTypes: ["DETACHED"],
      minutesToExpire: 60,
      externalReference: `pedido-${Date.now()}`,
      callback: {
        successUrl: `${process.env.BACKEND_URL}/success`,
        cancelUrl: `${process.env.BACKEND_URL}/failure`,
        expiredUrl: `${process.env.BACKEND_URL}/pending`,
      },
      items: formattedItems,
    };

    console.log("📤 Enviando para o Asaas...");
    const response = await fetch(`${ASAAS_BASE_URL}/checkouts`, {
      method: "POST",
      headers: ASAAS_HEADERS,
      body: JSON.stringify(checkoutBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro do Asaas:", data);
      return res.status(response.status).json({ error: "Falha ao criar pagamento", details: data });
    }

    // Monta a URL do Checkout
    const checkoutUrl = `https://asaas.com/checkoutSession/show?id=${data.id}`;

    console.log("✅ Checkout criado:", data.id);
    console.log("   URL:", checkoutUrl);

    res.json({
      id: data.id,
      init_point: checkoutUrl,
    });
  } catch (error) {
    console.error("❌ Erro ao criar preferência:", error);
    res.status(500).json({ error: "Falha ao criar pagamento", details: error.message });
  }
});

// ============================================
// 2. WEBHOOK — RECEBER NOTIFICAÇÃO DO ASAAS
// POST /api/webhook
// ============================================
router.post("/webhook", async (req, res) => {
  try {
    const { event, payment, checkout } = req.body;
    console.log("📩 Webhook recebido:", event);

    // Eventos de Checkout
    if (event === "CHECKOUT_PAID") {
      console.log("🎉 CHECKOUT PAGO!", checkout?.id);
    } else if (event === "CHECKOUT_CANCELED") {
      console.log("❌ Checkout cancelado:", checkout?.id);
    } else if (event === "CHECKOUT_EXPIRED") {
      console.log("⏰ Checkout expirado:", checkout?.id);
    }

    // Eventos de Cobrança (para PIX e Cartão)
    if (event === "PAYMENT_RECEIVED") {
      console.log("💰 PAGAMENTO RECEBIDO!");
      console.log("   ID:", payment?.id);
      console.log("   Valor: R$", payment?.value);
      console.log("   Forma:", payment?.billingType);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    res.status(200).send("OK");
  }
});

module.exports = router;