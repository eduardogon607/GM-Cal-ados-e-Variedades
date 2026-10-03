// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const paymentRoutes = require("./routes/payment");
const productRoutes = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES
// ============================================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ============================================
// SERVIR ARQUIVOS ESTÁTICOS (fotos dos produtos)
// ============================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "storage", "uploads"))
);


// ============================================
// LOG de requisições
// ============================================
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// ROTAS
// ============================================
app.use("/api", productRoutes);
app.use("/api", paymentRoutes);

// ============================================
// PÁGINAS DE RETORNO
// ============================================
app.get("/success", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Pagamento aprovado</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #fafafa;
          display: flex; align-items: center; justify-content: center;
          min-height: 100vh; margin: 0; text-align: center; padding: 20px;
        }
        .box {
          background: white; padding: 40px 30px; border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08); max-width: 420px;
        }
        .icon { font-size: 60px; margin-bottom: 12px; }
        h1 { color: #1a1a1a; font-size: 22px; margin-bottom: 10px; }
        p { color: #666; font-size: 14px; margin-bottom: 20px; line-height: 1.5; }
        a {
          display: inline-block;
          background: linear-gradient(90deg, #d4af37, #b8941f);
          color: white; padding: 12px 24px; border-radius: 10px;
          text-decoration: none; font-weight: 600; font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="icon">✅</div>
        <h1>Pagamento aprovado!</h1>
        <p>Obrigado pela sua compra na GM Calçados e Variedades.<br>
        Você receberá os detalhes por e-mail em breve.</p>
        <a href="${process.env.FRONTEND_URL || "/"}">Voltar para a loja</a>
      </div>
    </body>
    </html>
  `);
});

app.get("/failure", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Pagamento não concluído</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #fafafa;
          display: flex; align-items: center; justify-content: center;
          min-height: 100vh; margin: 0; text-align: center; padding: 20px;
        }
        .box {
          background: white; padding: 40px 30px; border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08); max-width: 420px;
        }
        .icon { font-size: 60px; margin-bottom: 12px; }
        h1 { color: #1a1a1a; font-size: 22px; margin-bottom: 10px; }
        p { color: #666; font-size: 14px; margin-bottom: 20px; line-height: 1.5; }
        a {
          display: inline-block; background: #1a1a1a; color: white;
          padding: 12px 24px; border-radius: 10px; text-decoration: none;
          font-weight: 600; font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="icon">❌</div>
        <h1>Pagamento não concluído</h1>
        <p>Houve um problema ao processar seu pagamento.<br>
        Tente novamente ou escolha outra forma de pagamento.</p>
        <a href="${process.env.FRONTEND_URL || "/"}">Voltar para a loja</a>
      </div>
    </body>
    </html>
  `);
});

app.get("/pending", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>Pagamento pendente</title>
      <style>
        body { font-family: sans-serif; background: #fafafa; display: flex;
          align-items: center; justify-content: center; min-height: 100vh;
          margin: 0; text-align: center; padding: 20px; }
        .box { background: white; padding: 40px 30px; border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08); max-width: 420px; }
        .icon { font-size: 60px; margin-bottom: 12px; }
        h1 { color: #1a1a1a; font-size: 22px; margin-bottom: 10px; }
        p { color: #666; font-size: 14px; margin-bottom: 20px; line-height: 1.5; }
        a { display: inline-block; background: #b8941f; color: white;
          padding: 12px 24px; border-radius: 10px; text-decoration: none;
          font-weight: 600; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="icon">⏳</div>
        <h1>Pagamento pendente</h1>
        <p>Estamos aguardando a confirmação do seu pagamento.<br>
        Você receberá um e-mail assim que for aprovado.</p>
        <a href="${process.env.FRONTEND_URL || "/"}">Voltar para a loja</a>
      </div>
    </body>
    </html>
  `);
});

// ============================================
// ROTA DE SAÚDE
// ============================================
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "GM Calçados Backend",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// INICIA O SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log("");
  console.log("========================================");
  console.log("  🚀 GM CALÇADOS - BACKEND ONLINE");
  console.log("========================================");
  console.log(`  Porta: ${PORT}`);
  console.log(`  URL:   ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
  console.log("");
  console.log(`  Front-end permitido: ${process.env.FRONTEND_URL || "*"}`);
  console.log(`  Webhook: ${process.env.BACKEND_URL}/api/webhook`);
  console.log("========================================");
  console.log("");
});