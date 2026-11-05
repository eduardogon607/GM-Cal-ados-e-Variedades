// backend/routes/products.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ============================================
// CONFIGURAÇÃO DE PASTAS
// ============================================
// Pasta raiz de armazenamento (é o disco persistente no Render)
// Localmente: backend/storage/
// No Render: /opt/render/project/src/backend/storage/
const STORAGE_DIR = path.join(__dirname, "..", "storage");

// Subpastas
const DATA_DIR = path.join(STORAGE_DIR, "data");
const UPLOADS_DIR = path.join(STORAGE_DIR, "uploads");
const PRODUCTS_FILE = path.join(DATA_DIR, "produtos.json");

// Cria todas as pastas necessárias
[DATA_DIR, UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Pasta criada: ${dir}`);
  }
});



// ============================================
// PRODUTOS PADRÃO (BACKUP AUTOMÁTICO)
// ============================================
const PRODUTOS_PADRAO = [
  {
    "id": 4,
    "name": "Tênis Adidas",
    "price": 130,
    "oldPrice": 130,
    "emoji": "👟",
    "photos": ["https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791743529806-471357121.png"],
    "photo": "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791743529806-471357121.png",
    "rating": 5,
    "badge": "NOVO",
    "category": "casual",
    "subcategory": "",
    "description": "Conforto diário, possuem sola de borracha e estrutura voltada para o dia a dia, trabalho informal ou lazer.",
    "sizes": ["40"],
    "createdAt": "2026-10-11T18:32:10.350Z"
  },
  {
    "id": 5,
    "name": "Tênis On cloudnova 2",
    "price": 130,
    "oldPrice": 130,
    "emoji": "👟",
    "photos": ["https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791744604160-532087469.jpg"],
    "photo": "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791744604160-532087469.jpg",
    "rating": 5,
    "badge": "NOVO",
    "category": "casual",
    "subcategory": "",
    "description": "Excelente pra quem passa muitas horas em pé, trabalha caminhando ou viaja bastante, pois combina o amortecimento clássico da marca com um design moderno e casual.",
    "sizes": ["40", "41 e 42"],
    "createdAt": "2026-10-11T18:50:04.431Z"
  },
  {
    "id": 6,
    "name": "Sapatênis Lacoste",
    "price": 130,
    "oldPrice": 130,
    "emoji": "👟",
    "photos": [
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791744729477-617365101.png",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791744730629-239708205.png",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791744731499-653848769.png",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791744731860-431152338.png"
    ],
    "photo": "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791744729477-617365101.png",
    "rating": 5,
    "badge": "NOVO",
    "category": "casual",
    "subcategory": "",
    "description": "Sapatênis confortável, dia a dia, passeios,looks casuais elegantes.",
    "sizes": ["42"],
    "createdAt": "2026-10-11T18:52:12.709Z"
  },
  {
    "id": 7,
    "name": "Sapatênis casual",
    "price": 130,
    "oldPrice": 130,
    "emoji": "👟",
    "photos": [
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791744975411-345350214.jpg",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791744975893-725755878.jpg",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791744976110-633966835.jpg",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791744976220-104573370.jpg"
    ],
    "photo": "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791744975411-345350214.jpg",
    "rating": 5,
    "badge": "NOVO",
    "category": "casual",
    "subcategory": "",
    "description": "Excelente para ambientes de trabalho com código de vestimenta casual ou casual profissional (smart casual), pois garante conforto para passar longos períodos em pé ou caminhando sem perder a formalidade necessária",
    "sizes": ["39", "40", "41 e 42"],
    "createdAt": "2026-10-11T18:56:16.307Z"
  },
  {
    "id": 9,
    "name": "Tênis Fila Recovery esportivo",
    "price": 170,
    "oldPrice": 170,
    "emoji": "👟",
    "photos": [
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791745794781-33656048.jpg",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791745794965-649354201.jpg",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791745795108-767259648.jpg",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791745795160-152506980.jpg"
    ],
    "photo": "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791745794781-33656048.jpg",
    "rating": 5,
    "badge": "🔥 Top",
    "category": "esportivos",
    "subcategory": "tenis-esportivos",
    "description": "um modelo esportivo desenvolvido principalmente para corrida de rua, caminhadas, treinos de academia e uso diário.\r\nEle conta com a entressola em tecnologia Energized Rubber (uma fórmula de EVA da Fila), que serve para absorver o impacto dos passos e transformá-lo em impulso para a sua caminhada ou corrida",
    "sizes": ["40", "41 e 42"],
    "createdAt": "2026-10-11T19:09:55.204Z"
  },
  {
    "id": 10,
    "name": "Nike ZoomX",
    "price": 130,
    "oldPrice": 130,
    "emoji": "👟",
    "photos": [
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791750026461-918074969.jpg",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791750026699-669783640.jpg",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791750026811-480690745.jpg"
    ],
    "photo": "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791750026461-918074969.jpg",
    "rating": 5,
    "badge": "🔥 Top",
    "category": "esportivos",
    "subcategory": "tenis-esportivos",
    "description": "É um calçado de alta performance projetado especificamente para corridas diárias, treinos longos, e rodagens de recuperação ativa.",
    "sizes": ["41 e 42"],
    "createdAt": "2026-10-11T20:20:26.892Z"
  },
  {
    "id": 11,
    "name": "Nike Cosmic Runner",
    "price": 130,
    "oldPrice": 130,
    "emoji": "👟",
    "photos": [
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791750311334-419809071.jpg",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791750311880-724050601.jpg"
    ],
    "photo": "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791750311334-419809071.jpg",
    "rating": 5,
    "badge": "NOVO",
    "category": "esportivos",
    "subcategory": "tenis-esportivos",
    "description": "Possui uma entressola com amortecimento em espuma responsiva que reduz o impacto das pisadas, tornando-o ideal para caminhadas diárias ou corridas leves.",
    "sizes": ["41 e 42"],
    "createdAt": "2026-10-11T20:25:11.909Z"
  },
  {
    "id": 12,
    "name": "Bota Coturno Caterpillar",
    "price": 170,
    "oldPrice": 170,
    "emoji": "👟",
    "photos": [
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791750899439-990860484.jpg",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791750899573-622403962.jpg"
    ],
    "photo": "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791750899439-990860484.jpg",
    "rating": 5,
    "badge": "NOVO",
    "category": "casual",
    "subcategory": "",
    "description": "Trata-se de um modelo muito popular no Brasil voltado para o estilo lifestyle urbano, trilhas, motociclismo e uso casual diário. Suas principais características incluem o padrão de estampa militar/camuflada em tons de verde e preto, cano médio e um solado tratorado robusto com costura reforçada (sola blaqueada), projetado para oferecer maior aderência e durabilidade.",
    "sizes": ["41 e 39"],
    "createdAt": "2026-10-11T20:34:59.672Z"
  },
  {
    "id": 13,
    "name": "On Running Cloudtilt",
    "price": 190,
    "oldPrice": 190,
    "emoji": "👟",
    "photos": [
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791751417372-10246203.jpg",
      "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791751417411-708761830.jpg"
    ],
    "photo": "https://gm-cal-ados-e-variedades-1.onrender.com/uploads/1791751417372-10246203.jpg",
    "rating": 5,
    "badge": "🔥 Top",
    "category": "feminino",
    "subcategory": "",
    "description": "On Running com foco principal em conforto urbano, caminhadas e uso casual diário, Ele serve para quem passa muitas horas em pé ou em movimento na cidade e precisa de um calçado estiloso e confortável.",
    "sizes": ["34", "36", "38 e 39"],
    "createdAt": "2026-10-11T20:43:37.447Z"
  }
];

// Cria o arquivo de produtos se não existir (com os produtos padrão)
if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(PRODUTOS_PADRAO, null, 2));
  console.log("📦 Arquivo produtos.json criado com os produtos de backup!");
} else {
  // Se o arquivo já existe mas está vazio (ex: servidor reiniciou), repopula
  try {
    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8") || "[]");
    if (data.length === 0) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(PRODUTOS_PADRAO, null, 2));
      console.log("📦 Arquivo produtos.json estava vazio, produtos de backup restaurados!");
    }
  } catch (e) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(PRODUTOS_PADRAO, null, 2));
  }
}










console.log(`💾 Storage configurado em: ${STORAGE_DIR}`);




// ============================================
// CONFIGURAÇÃO DO MULTER (upload de arquivos)
// ============================================
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
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB por arquivo
  fileFilter: (req, file, cb) => {
    // Aceita imagens e vídeos
    const allowedExt = /jpeg|jpg|png|webp|gif|mp4|webm|mov|avi/i;
    const allowedMime = /image\/|video\//i;

    const ext = allowedExt.test(path.extname(file.originalname));
    const mime = allowedMime.test(file.mimetype);

    if (ext && mime) return cb(null, true);
    cb(new Error("Apenas imagens e vídeos são permitidos"));
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







// ============================================
// CONFIGURAÇÃO DO BANNER
// ============================================
const CONFIG_FILE = path.join(DATA_DIR, "config.json");

if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({
    title: "Coleção Premium",
    subtitle: "Qualidade e elegância em cada detalhe",
    imageUrl: ""
  }, null, 2));
}

// Buscar dados do Banner
router.get("/config/banner", (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    res.json(config);
  } catch (error) {
    res.json({ title: "Coleção Premium", subtitle: "Qualidade e elegância em cada detalhe", imageUrl: "" });
  }
});

// Salvar o Banner (Aceita imagem)
router.post("/config/banner", upload.single("bannerImage"), (req, res) => {
  try {
    const { title, subtitle } = req.body;
    let currentConfig = {};
    
    try {
      currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    } catch (e) { currentConfig = {}; }

    const baseUrl = (process.env.BACKEND_URL || "http://localhost:3000").replace(/\/+$/, "");
    
    let imageUrl = currentConfig.imageUrl || "";
    if (req.file) {
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const newConfig = {
      title: title || "Coleção Premium",
      subtitle: subtitle || "Qualidade e elegância em cada detalhe",
      imageUrl: imageUrl
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    res.json({ success: true, config: newConfig });
  } catch (error) {
    console.error("Erro ao atualizar banner:", error);
    res.status(500).json({ error: "Erro ao atualizar o banner." });
  }
});













module.exports = router;