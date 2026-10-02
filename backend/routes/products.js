// backend/routes/products.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ============================================
// CONFIGURAÇÃO DE PASTAS
// ============================================
const DATA_DIR = path.join(__dirname, "..", "data");
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const PRODUCTS_FILE = path.join(DATA_DIR, "produtos.json");

// Cria as pastas se não existirem
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Cria o arquivo de produtos se não existir
if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
}

// ============================================
// CONFIGURAÇÃO DO MULTER (upload de arquivos)
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por foto
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/i;
    const ext = allowed.test(path.extname(file.originalname));
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Apenas imagens são permitidas"));
  },
});

// ============================================
// HELPERS
// ============================================
function readProducts() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, "utf8");
    return JSON.parse(data || "[]");
  } catch (e) {
    console.error("Erro ao ler produtos:", e);
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

// ============================================
// 1. LISTAR TODOS OS PRODUTOS (público)
// GET /api/products
// ============================================
router.get("/products", (req, res) => {
  const products = readProducts();
  res.json(products);
});

// ============================================
// 2. CRIAR PRODUTO COM FOTOS (admin)
// POST /api/products
// ============================================
router.post("/products", upload.array("photos", 5), (req, res) => {
  try {
    const { name, price, rating, badge, category, subcategory, description, sizes } = req.body;

    // Validações
    if (!name || !price) {
      return res.status(400).json({ error: "Nome e preço são obrigatórios" });
    }

    // Monta URLs das fotos
    const baseUrl = process.env.BACKEND_URL || "http://localhost:3000";
    const photos = (req.files || []).map(
      (file) => `${baseUrl}/uploads/${file.filename}`
    );

    if (photos.length === 0) {
      return res.status(400).json({ error: "Adicione pelo menos uma foto" });
    }

    // Lê produtos existentes
    const products = readProducts();

    // Gera novo ID
    const newId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

    // Processa tamanhos
    const sizesArray = sizes
      ? String(sizes).split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    // Cria o produto
    const newProduct = {
      id: newId,
      name: String(name).trim(),
      price: parseFloat(price),
      oldPrice: parseFloat(price),
      emoji: "👟",
      photos,
      photo: photos[0], // compatibilidade
      rating: parseFloat(rating) || 5.0,
      badge: badge || "",
      category: category || "",
      subcategory: subcategory || "",
      description: description || "",
      sizes: sizesArray,
      createdAt: new Date().toISOString(),
    };

    // Salva
    products.push(newProduct);
    writeProducts(products);

    console.log(`✓ Produto criado: ${newProduct.name} (${photos.length} fotos)`);

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
});

// ============================================
// 3. EXCLUIR PRODUTO (admin)
// DELETE /api/products/:id
// ============================================
router.delete("/products/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const products = readProducts();
    const product = products.find((p) => p.id === id);

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    // Apaga as fotos do disco
    if (Array.isArray(product.photos)) {
      product.photos.forEach((photoUrl) => {
        const filename = path.basename(photoUrl);
        const filePath = path.join(UPLOADS_DIR, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    // Remove do JSON
    const filtered = products.filter((p) => p.id !== id);
    writeProducts(filtered);

    console.log(`✓ Produto excluído: ${product.name}`);

    res.json({ success: true, id });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    res.status(500).json({ error: "Erro ao excluir produto" });
  }
});

module.exports = router;