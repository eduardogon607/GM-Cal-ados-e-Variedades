const fs = require("fs");
const path = require("path");

console.log("========================================");
console.log("DEBUG DO ARQUIVO .env");
console.log("========================================");

// 1. Verifica se o arquivo .env existe
const envPath = path.resolve(__dirname, ".env");
console.log("Caminho esperado:", envPath);
console.log("Arquivo .env existe:", fs.existsSync(envPath));

// 2. Lê o conteúdo do .env
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  console.log("");
  console.log("Conteúdo do .env (primeiras 500 letras):");
  console.log("----------------------------------------");
  console.log(content.substring(0, 500));
  console.log("----------------------------------------");
}

// 3. Carrega o dotenv e verifica a variável
require("dotenv").config({ path: envPath });

console.log("");
console.log("Variável ASAAS_API_KEY:", process.env.ASAAS_API_KEY ? "DEFINIDA" : "UNDEFINED");
console.log("Variável MP_ACCESS_TOKEN:", process.env.MP_ACCESS_TOKEN ? "DEFINIDA" : "UNDEFINED");
console.log("Variável PORT:", process.env.PORT || "UNDEFINED");
console.log("========================================");