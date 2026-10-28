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
  const frontendUrl = process.env.FRONTEND_URL || "/";

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
          background: #fafafa; display: flex; align-items: center; justify-content: center;
          min-height: 100vh; margin: 0; text-align: center; padding: 20px;
        }
        .box {
          background: white; padding: 35px 25px; border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08); max-width: 420px; width: 100%;
          box-sizing: border-box;
        }
        .icon { font-size: 60px; margin-bottom: 12px; }
        h1 { color: #1a1a1a; font-size: 22px; margin-bottom: 10px; margin-top: 0;}
        p { color: #666; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
        
        .call-to-action {
          font-size: 13px;
          color: #1a1a1a;
          font-weight: 600;
          margin-bottom: 8px;
          display: block;
        }

        /* Botão do WhatsApp com animação de pulso */
        .btn-wpp {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #25d366; color: white; padding: 16px 24px; border-radius: 10px;
          text-decoration: none; font-weight: 700; font-size: 16px; margin-bottom: 12px;
          border: none; width: 100%; cursor: pointer; position: relative;
          box-sizing: border-box;
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
          animation: pulse-wpp 2s infinite;
        }
        .btn-wpp:active { transform: scale(0.98); animation: none; }
        
        /* Animação de pulso */
        @keyframes pulse-wpp {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
          70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(37, 211, 102, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }

        .btn-loja {
          display: inline-block; background: transparent; color: #666;
          padding: 10px 24px; border-radius: 10px; text-decoration: none;
          font-weight: 600; font-size: 13px; width: 100%; box-sizing: border-box;
          margin-top: 5px;
        }
        .btn-loja:hover { color: #1a1a1a; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="icon">✅</div>
        <h1>Pagamento aprovado!</h1>
        <p>Obrigado pela sua compra na GM Calçados e Variedades.</p>
        
        <span class="call-to-action">⚠️ Último passo para garantir seu pedido:</span>
        
        <button class="btn-wpp" onclick="enviarWhatsApp()">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Enviar Comanda e Receber
        </button>

        <a href="${frontendUrl}" class="btn-loja">Voltar para a loja</a>
      </div>

      <script>
        function enviarWhatsApp() {
          const pedidoStr = localStorage.getItem("gm_ultimo_pedido");
          
          if (!pedidoStr) {
            alert("Não foi possível recuperar os dados do pedido. Por favor, entre em contato com a loja.");
            return;
          }

          const pedido = JSON.parse(pedidoStr);

          // Mensagem mais amigável para o vendedor
          // Usamos as crases (template strings) do JS do navegador, por isso o \${} para escapar do Node
          let mensagem = "*🛒 NOVA COMANDA - GM CALÇADOS*\\n\\n";
          mensagem += "*Cliente:* " + pedido.clienteNome + "\\n";
          mensagem += "*Data:* " + pedido.data + "\\n\\n";
          mensagem += "*📦 Itens do Pedido:*\\n";
          
          pedido.itens.forEach(item => {
            mensagem += \`• \${item.qty}x \${item.name}\\n\`;
            mensagem += \`  Tam: \${item.size} | R$ \${item.price.toFixed(2).replace(".", ",")}\\n\`;
          });

          mensagem += "\\n*💰 Resumo Financeiro:*\\n";
          mensagem += "*Total:* R$ " + pedido.total.replace(".", ",") + "\\n";
          mensagem += "*Pagamento:* " + pedido.parcelas + "\\n\\n";
          mensagem += "_Olá, acabei de fazer o pagamento no site. Segue minha comanda!_";

          const mensagemCodificada = encodeURIComponent(mensagem);
          const numeroWhatsApp = "5591986257230"; 
          const url = \`https://wa.me/\${numeroWhatsApp}?text=\${mensagemCodificada}\`;
          
          window.location.href = url;
        }
      </script>
    </body>
    </html>
  `);
});

app.get("/failure", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "/";
  
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
        <a href="${frontendUrl}">Voltar para a loja</a>
      </div>
    </body>
    </html>
  `);
});

app.get("/pending", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "/";

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
        <a href="${frontendUrl}">Voltar para a loja</a>
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