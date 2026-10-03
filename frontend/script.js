/* =========================================
   GM CALÇADOS - SCRIPT PRINCIPAL
   ========================================= */

/* =========================================
   CONFIGURAÇÃO DO BACKEND
   ========================================= */
// 🔧 ALTERE AQUI quando fizer deploy no Render
const BACKEND_URL = "https://gm-cal-ados-e-variedades-1.onrender.com";

/* =========================================
   SPLASH SCREEN (executa primeiro)
   ========================================= */
(function initSplash() {
  const splash = document.getElementById("splashScreen");
  if (!splash) return;

  document.body.style.overflow = "hidden";

  setTimeout(() => {
    splash.classList.add("hide");
    document.body.style.overflow = "";

    setTimeout(() => {
      splash.remove();
    }, 900);
  }, 2200);
})();

/* =========================================
   PRODUTOS PADRÃO (fallback se o backend estiver offline)
   ========================================= */
const DEFAULT_PRODUCTS = [
  { id: 1, name: "Tênis Nike Air Max Branco/Dourado", price: 499.90, oldPrice: 699.90, emoji: "👟", rating: 4.8, badge: "🔥 Top", category: "casual", subcategory: "", description: "Tênis premium com amortecimento Air Max. Combina conforto e estilo para o dia a dia.", sizes: ["37", "38", "39", "40", "41", "42"] },
  { id: 2, name: "Tênis Adidas Ultraboost Preto", price: 429.90, oldPrice: 549.90, emoji: "👟", rating: 4.7, badge: "OFF", category: "esportivos", subcategory: "tenis-esportivos", description: "Tênis de corrida com tecnologia Boost. Retorno de energia em cada passada.", sizes: ["38", "39", "40", "41", "42", "43"] },
  { id: 3, name: "Tênis Puma Runner Pro Branco", price: 349.90, oldPrice: 449.90, emoji: "👟", rating: 4.6, badge: "NOVO", category: "esportivos", subcategory: "tenis-esportivos", description: "Leve, respirável e ideal para treinos diários.", sizes: ["37", "38", "39", "40", "41"] },
  { id: 4, name: "Tênis Vans Old Skool Clássico", price: 289.90, oldPrice: 359.90, emoji: "👟", rating: 4.9, badge: "🔥 Top", category: "casual", subcategory: "", description: "Clássico atemporal do skate. Combina com qualquer look.", sizes: ["36", "37", "38", "39", "40", "41", "42", "43"] },
  { id: 5, name: "Tênis Nike Jordan 1 Gold Edition", price: 899.90, oldPrice: 1199.90, emoji: "👟", rating: 5.0, badge: "LIMITADO", category: "casual", subcategory: "", description: "Edição limitada em dourado. Um ícone do basquete e da moda urbana.", sizes: ["39", "40", "41", "42", "43", "44"] },
  { id: 6, name: "Tênis Asics Gel Running", price: 379.90, oldPrice: 499.90, emoji: "👟", rating: 4.5, badge: "OFF", category: "esportivos", subcategory: "tenis-esportivos", description: "Amortecimento Gel de alta performance para longas distâncias.", sizes: ["38", "39", "40", "41", "42"] },
  { id: 7, name: "Tênis New Balance 574 Bege", price: 399.90, oldPrice: 519.90, emoji: "👟", rating: 4.7, badge: "NOVO", category: "casual", subcategory: "", description: "Estilo retrô com conforto moderno. Um clássico do casual.", sizes: ["37", "38", "39", "40", "41", "42"] },
  { id: 8, name: "Tênis Olympikus Corrida Pro", price: 199.90, oldPrice: 279.90, emoji: "👟", rating: 4.4, badge: "OFF", category: "esportivos", subcategory: "tenis-esportivos", description: "Ótimo custo-benefício para corridas leves e caminhadas.", sizes: ["37", "38", "39", "40", "41", "42", "43"] },
];

/* ---------- CONFIGURAÇÃO DO ADMIN ---------- */
const ADMIN_CREDENTIALS = {
  user: "admin",
  pass: "Gmloja",
};

/* ---------- SESSÃO ---------- */
const SESSION_KEY = "gm_calcados_admin_session";

/* =========================================
   ESTADO GLOBAL
   ========================================= */
let products = [];
let cart = [];
let currentFilter = { category: null, subcategory: null, term: "" };
let currentProduct = null;
let selectedSize = null;
let selectedQty = 1;
let pdPhotoIndex = 0;
let pdPhotosList = [];

/* =========================================
   API — COMUNICAÇÃO COM O BACKEND
   ========================================= */
async function fetchProducts() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/products`);
    if (!response.ok) throw new Error("Falha ao buscar produtos");
    const data = await response.json();

    // Se o backend retornar array vazio, usa os produtos padrão
    if (Array.isArray(data) && data.length > 0) {
      products = data;
    } else {
      products = [...DEFAULT_PRODUCTS];
    }
    return products;
  } catch (error) {
    console.error("Erro ao buscar produtos do backend:", error);
    // Fallback: usa produtos padrão
    products = [...DEFAULT_PRODUCTS];
    return products;
  }
}

async function createProduct(formData) {
  const response = await fetch(`${BACKEND_URL}/api/products`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao criar produto");
  }

  return await response.json();
}

async function deleteProduct(id) {
  const response = await fetch(`${BACKEND_URL}/api/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao excluir produto");
  }

  return await response.json();
}

/* =========================================
   HELPERS
   ========================================= */



function getProductMediaHTML(p) {
  const url = (Array.isArray(p.photos) && p.photos[0]) || p.photo;

  if (url) {
    // Detecta se é vídeo pela extensão
    const isVideo = /\.(mp4|webm|mov|avi)$/i.test(url);
    if (isVideo) {
      return `<video src="${url}" muted autoplay loop playsinline></video>`;
    }
    return `<img src="${url}" alt="${p.name}" />`;
  }

  return p.emoji || "👟";
}





function getProductPhotosCount(p) {
  if (Array.isArray(p.photos) && p.photos.length > 0) return p.photos.length;
  if (p.photo) return 1;
  return 0;
}

function getProductSizesArray(p) {
  if (Array.isArray(p.sizes)) return p.sizes;
  if (typeof p.sizes === "string" && p.sizes.trim()) {
    return p.sizes.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function base64ToBlob(base64) {
  const parts = base64.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: mime });
}

const CATEGORY_LABELS = {
  casual: "👟 Casual",
  esportivos: "🏃 Esportivos",
  feminino: "👠 Feminino",
  infantil: "🧒 Infantil",
  social: "👞 Social",
  acessorios: "🕶️ Acessórios",
};

const SUBCATEGORY_LABELS = {
  "roupas-academia": "👕 Roupas para Academia",
  "tenis-esportivos": "👟 Tênis Esportivos",
  oculos: "🕶️ Óculos",
  chapeus: "🧢 Chapéus",
};

/* =========================================
   RENDERIZAR PRODUTOS
   ========================================= */
function renderProducts(list = products) {
  const grid = document.getElementById("productsGrid");
  const title = document.getElementById("productsTitle");
  grid.innerHTML = "";

  if (currentFilter.subcategory) {
    title.textContent = SUBCATEGORY_LABELS[currentFilter.subcategory] || "Produtos";
  } else if (currentFilter.category) {
    title.textContent = CATEGORY_LABELS[currentFilter.category] || "Produtos";
  } else if (currentFilter.term) {
    title.textContent = `🔍 Resultado para "${currentFilter.term}"`;
  } else {
    title.textContent = "🔥 Mais Vendidos";
  }

  if (list.length === 0) {
    grid.innerHTML =
      "<p style='grid-column:1/-1;text-align:center;padding:40px;'>Nenhum produto encontrado 😕</p>";
    return;
  }

  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";

    const photoCount = getProductPhotosCount(p);
    const countBadge = photoCount > 1
      ? `<span class="product-photo-count">📸 ${photoCount}</span>`
      : "";

    card.innerHTML = `
      <div class="product-badge">${p.badge || ""}</div>
      <div class="product-image">
        ${getProductMediaHTML(p)}
        ${countBadge}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-rating">⭐ ${p.rating || 5.0}</div>
        <div class="product-price-row">
          <span class="product-price">R$ ${Number(p.price).toFixed(2).replace(".", ",")}</span>
        </div>
        <button class="add-cart-btn" data-id="${p.id}">Adicionar</button>
      </div>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".add-cart-btn")) return;
      openProductModal(p);
    });

    grid.appendChild(card);
  });

  document.querySelectorAll(".add-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(parseInt(btn.dataset.id));
    });
  });
}

/* =========================================
   FILTROS
   ========================================= */
function applyFilters() {
  let list = [...products];

  if (currentFilter.category) {
    list = list.filter((p) => p.category === currentFilter.category);
  }

  if (currentFilter.subcategory) {
    list = list.filter((p) => p.subcategory === currentFilter.subcategory);
  }

  if (currentFilter.term) {
    list = list.filter((p) =>
      p.name.toLowerCase().includes(currentFilter.term.toLowerCase())
    );
  }

  renderProducts(list);
}

function filterByCategory(category) {
  currentFilter = { category, subcategory: null, term: "" };
  document.getElementById("searchInput").value = "";
  applyFilters();
  scrollToProducts();
}

function filterBySubcategory(subcategory) {
  const cat = Object.keys(subcategories).find((k) =>
    subcategories[k].items.some((i) => i.value === subcategory)
  );
  currentFilter = { category: cat || null, subcategory, term: "" };
  document.getElementById("searchInput").value = "";
  applyFilters();
  scrollToProducts();
}

function clearFilters() {
  currentFilter = { category: null, subcategory: null, term: "" };
  document.getElementById("searchInput").value = "";
  renderProducts();
}

function scrollToProducts() {
  setTimeout(() => {
    document.querySelector(".products-section").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 150);
}

/* =========================================
   CARRINHO
   ========================================= */
function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  const sizes = getProductSizesArray(product);

  if (sizes.length > 0) {
    openProductModal(product);
    return;
  }

  const existing = cart.find((item) => item.id === id && !item.size);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1, size: null, itemKey: `${product.id}` });

  updateCart();
  showToast(`✓ Adicionado: ${product.name.split(" ").slice(0, 3).join(" ")}...`);
  if (navigator.vibrate) navigator.vibrate(30);
}

function addToCartWithOptions(product, qty, size) {
  const itemKey = size ? `${product.id}-${size}` : `${product.id}`;
  const existing = cart.find((item) => item.itemKey === itemKey);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      ...product,
      qty,
      size: size || null,
      itemKey,
    });
  }

  updateCart();
  const sizeMsg = size ? ` (Tam ${size})` : "";
  showToast(`✓ ${qty}x ${product.name.split(" ").slice(0, 3).join(" ")}${sizeMsg}`);
  if (navigator.vibrate) navigator.vibrate(30);
}

function removeFromCart(key) {
  cart = cart.filter((item) => String(item.itemKey || item.id) !== String(key));
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  cartCount.textContent = totalQty;
  cartTotal.textContent = `R$ ${totalPrice.toFixed(2).replace(".", ",")}`;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio 🛒</p>';
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <div class="cart-item-img">${getProductMediaHTML(item)}</div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        ${item.size ? `<span class="cart-item-size">Tam: ${item.size}</span>` : ""}
        <span>${item.qty}x R$ ${Number(item.price).toFixed(2).replace(".", ",")}</span>
      </div>
      <button class="remove-btn" data-key="${item.itemKey || item.id}">🗑️</button>
    </div>
  `
    )
    .join("");

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.key));
  });
}

function openCart() {
  document.getElementById("cartPanel").classList.add("open");
  document.getElementById("overlay").classList.add("active");
}

function closeCart() {
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("overlay").classList.remove("active");
}

/* =========================================
   SUBCATEGORIAS (painel do cliente)
   ========================================= */
const subcategories = {
  esportivos: {
    title: "🏃 Esportivos",
    items: [
      { icon: "👕", label: "Roupas para Academia", value: "roupas-academia" },
      { icon: "👟", label: "Tênis Esportivos", value: "tenis-esportivos" },
    ],
  },
  acessorios: {
    title: "🕶️ Acessórios",
    items: [
      { icon: "🕶️", label: "Óculos", value: "oculos" },
      { icon: "🧢", label: "Chapéus", value: "chapeus" },
    ],
  },
};

const subPanel = document.getElementById("subcategoryPanel");
const subGrid = document.getElementById("subcategoryGrid");
const subTitle = document.getElementById("subcategoryTitle");
const closeSubBtn = document.getElementById("closeSubcategory");

function openSubcategory(key) {
  const data = subcategories[key];
  if (!data) return;

  subTitle.textContent = data.title;

  subGrid.innerHTML = data.items
    .map(
      (item) => `
      <button class="subcategory-item" data-value="${item.value}">
        <span class="sub-icon">${item.icon}</span>
        <span>${item.label}</span>
      </button>
    `
    )
    .join("");

  subPanel.classList.add("open");

  document.querySelectorAll(".category-card").forEach((c) => c.classList.remove("active"));
  const activeCard = document.querySelector(`.category-card[data-category="${key}"]`);
  if (activeCard) activeCard.classList.add("active");

  subGrid.querySelectorAll(".subcategory-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const label = btn.querySelector("span:last-child").textContent;
      const subValue = btn.dataset.value;
      showToast(`📂 Filtrando: ${label}`);
      filterBySubcategory(subValue);
      if (navigator.vibrate) navigator.vibrate(20);
    });
  });
}

function closeSubcategory() {
  subPanel.classList.remove("open");
  document.querySelectorAll(".category-card").forEach((c) => c.classList.remove("active"));
}

document.querySelectorAll(".category-card").forEach((card) => {
  card.addEventListener("click", () => {
    const key = card.dataset.category;

    if (subcategories[key]) {
      if (card.classList.contains("active")) {
        closeSubcategory();
        clearFilters();
      } else {
        openSubcategory(key);
      }
    } else {
      const label = card.querySelector(".category-label").textContent;
      showToast(`🔍 Categoria: ${label}`);
      closeSubcategory();
      filterByCategory(key);
    }

    if (navigator.vibrate) navigator.vibrate(15);
  });
});

closeSubBtn.addEventListener("click", () => {
  closeSubcategory();
  clearFilters();
});

/* =========================================
   BUSCA
   ========================================= */
function searchProducts() {
  const term = document.getElementById("searchInput").value.trim();
  currentFilter = { category: null, subcategory: null, term };
  closeSubcategory();
  applyFilters();

  if (term) scrollToProducts();
}

/* =========================================
   TOAST
   ========================================= */
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2000);
}

/* =========================================
   SISTEMA DE ADMIN
   ========================================= */
const loginModal = document.getElementById("loginModal");
const adminPanel = document.getElementById("adminPanel");
const accountIcon = document.getElementById("accountIcon");
const loginUserInput = document.getElementById("loginUser");
const loginPassInput = document.getElementById("loginPass");
const loginError = document.getElementById("loginError");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const logoutBtn = document.getElementById("logoutBtn");
const addProductForm = document.getElementById("addProductForm");
const adminProductList = document.getElementById("adminProductList");
const adminProductCount = document.getElementById("adminProductCount");

function openModal(modal) {
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const modal = document.getElementById(btn.dataset.close);
    if (modal) closeModal(modal);
  });
});

[loginModal, adminPanel].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

accountIcon.addEventListener("click", () => {
  const isLogged = sessionStorage.getItem(SESSION_KEY) === "true";
  if (isLogged) {
    openAdminPanel();
  } else {
    loginUserInput.value = "";
    loginPassInput.value = "";
    loginError.textContent = "";
    openModal(loginModal);
    setTimeout(() => loginUserInput.focus(), 300);
  }
});

function tryLogin() {
  const user = loginUserInput.value.trim();
  const pass = loginPassInput.value;

  if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
    sessionStorage.setItem(SESSION_KEY, "true");
    loginError.textContent = "";
    closeModal(loginModal);
    showToast("✓ Bem-vindo, Admin!");
    setTimeout(openAdminPanel, 300);
    if (navigator.vibrate) navigator.vibrate(40);
  } else {
    loginError.textContent = "❌ Usuário ou senha incorretos";
    loginPassInput.value = "";
    loginPassInput.focus();
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
  }
}

loginSubmitBtn.addEventListener("click", tryLogin);
loginUserInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") loginPassInput.focus();
});
loginPassInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") tryLogin();
});

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  closeModal(adminPanel);
  showToast("👋 Sessão encerrada");
});

function openAdminPanel() {
  renderAdminProducts();
  openModal(adminPanel);
}

/* =========================================
   LISTA DE PRODUTOS NO ADMIN
   ========================================= */
function renderAdminProducts() {
  adminProductCount.textContent = products.length;

  if (products.length === 0) {
    adminProductList.innerHTML =
      '<p style="text-align:center;color:#999;font-size:12px;padding:20px;">Nenhum produto cadastrado.</p>';
    return;
  }

  adminProductList.innerHTML = products
    .map((p) => {
      const catLabel = CATEGORY_LABELS[p.category] || "Sem categoria";
      const subLabel = p.subcategory
        ? ` • ${SUBCATEGORY_LABELS[p.subcategory] || p.subcategory}`
        : "";

      const sizes = getProductSizesArray(p);
      const sizesLabel =
        sizes.length > 0 ? `<div class="ap-sizes">📏 ${sizes.join(" · ")}</div>` : "";

      const photoCount = getProductPhotosCount(p);
      const photosLabel =
        photoCount > 1 ? `<div class="ap-sizes">📸 ${photoCount} fotos</div>` : "";

      return `
      <div class="admin-product-item">
        <div class="ap-emoji">${getProductMediaHTML(p)}</div>
        <div class="ap-info">
          <div class="ap-name">${p.name}</div>
          <div class="ap-price">R$ ${Number(p.price).toFixed(2).replace(".", ",")}</div>
          <div class="ap-category">📁 ${catLabel}${subLabel}</div>
          ${sizesLabel}
          ${photosLabel}
        </div>
        <button class="ap-delete" data-id="${p.id}" title="Excluir">🗑️</button>
      </div>
    `;
    })
    .join("");

  adminProductList.querySelectorAll(".ap-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = parseInt(btn.dataset.id);
      const prod = products.find((p) => p.id === id);
      if (!prod) return;
      if (!confirm(`Excluir "${prod.name}"?`)) return;

      try {
        await deleteProduct(id);
        await fetchProducts();
        renderAdminProducts();
        applyFilters();
        updateCart();
        showToast("🗑️ Produto excluído");
      } catch (error) {
        console.error(error);
        showToast("❌ Erro ao excluir produto");
      }
    });
  });
}

/* =========================================
   UPLOAD DE FOTOS (múltiplas)
   ========================================= */
const pPhotoInput = document.getElementById("pPhoto");
const photoPreviewGrid = document.getElementById("photoPreviewGrid");
const photoUploadBtn = document.getElementById("photoUploadBtn");

const MAX_PHOTOS = 5;
let currentPhotos = [];




function renderPhotoPreviews() {
  if (currentPhotos.length === 0) {
    photoPreviewGrid.classList.remove("active");
    photoUploadBtn.classList.remove("compact");
    photoUploadBtn.style.display = "flex";
    photoPreviewGrid.innerHTML = "";
    return;
  }

  photoUploadBtn.classList.add("compact");
  photoPreviewGrid.classList.add("active");

  photoPreviewGrid.innerHTML = currentPhotos
    .map((src, i) => {
      const isVideo = src.startsWith("data:video/");
      const media = isVideo
        ? `<video src="${src}" muted></video>`
        : `<img src="${src}" alt="Arquivo ${i + 1}" />`;

      const badge = isVideo
        ? `<span class="pp-video-badge">VÍDEO</span>`
        : "";

      return `
        <div class="photo-preview-item">
          ${media}
          ${badge}
          ${i === 0 ? '<span class="pp-cover">CAPA</span>' : ""}
          <button type="button" class="pp-remove" data-index="${i}" title="Remover">✖</button>
        </div>
      `;
    })
    .join("");

  photoPreviewGrid.querySelectorAll(".pp-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      currentPhotos.splice(idx, 1);
      renderPhotoPreviews();
      if (navigator.vibrate) navigator.vibrate(15);
    });
  });

  if (currentPhotos.length >= MAX_PHOTOS) {
    photoUploadBtn.style.display = "none";
  } else {
    photoUploadBtn.style.display = "flex";
  }
}





pPhotoInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  const remaining = MAX_PHOTOS - currentPhotos.length;
  const toAdd = files.slice(0, remaining);

  if (files.length > remaining) {
    showToast(`⚠️ Máximo de ${MAX_PHOTOS} arquivos (${remaining} adicionados)`);
  }

  let processed = 0;

  toAdd.forEach((file) => {
    // Valida tamanho (20MB)
    if (file.size > 20 * 1024 * 1024) {
      showToast(`⚠️ "${file.name}" é muito grande (máx. 20MB)`);
      processed++;
      return;
    }

    // Valida tipo
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      showToast(`⚠️ "${file.name}" não é imagem nem vídeo`);
      processed++;
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      currentPhotos.push(ev.target.result);
      processed++;
      if (processed === toAdd.length) {
        renderPhotoPreviews();
        if (navigator.vibrate) navigator.vibrate(15);
      }
    };
    reader.readAsDataURL(file);
  });

  pPhotoInput.value = "";
});





/* =========================================
   CATEGORIA + SUBCATEGORIA (form admin)
   ========================================= */
const pCategory = document.getElementById("pCategory");
const pSubcategory = document.getElementById("pSubcategory");
const subcategoryFormGroup = document.getElementById("subcategoryFormGroup");

const subcategoryOptions = {
  esportivos: [
    { value: "roupas-academia", label: "👕 Roupas para Academia" },
    { value: "tenis-esportivos", label: "👟 Tênis Esportivos" },
  ],
  acessorios: [
    { value: "oculos", label: "🕶️ Óculos" },
    { value: "chapeus", label: "🧢 Chapéus" },
  ],
};

pCategory.addEventListener("change", () => {
  const cat = pCategory.value;

  if (subcategoryOptions[cat]) {
    pSubcategory.innerHTML =
      '<option value="">Selecione...</option>' +
      subcategoryOptions[cat]
        .map((s) => `<option value="${s.value}">${s.label}</option>`)
        .join("");
    subcategoryFormGroup.style.display = "flex";
    pSubcategory.required = true;
  } else {
    subcategoryFormGroup.style.display = "none";
    pSubcategory.required = false;
    pSubcategory.value = "";
  }
});

/* =========================================
   ADICIONAR PRODUTO (envia para o backend)
   ========================================= */
addProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("pName").value.trim();
  const price = parseFloat(document.getElementById("pPrice").value);
  const ratingRaw = document.getElementById("pRating").value;
  const rating = ratingRaw ? parseFloat(ratingRaw) : 5.0;
  const badge = document.getElementById("pBadge").value;
  const category = pCategory.value;
  const subcategory = subcategoryOptions[category] ? pSubcategory.value : "";
  const description = document.getElementById("pDescription").value.trim();
  const sizesRaw = document.getElementById("pSizes").value.trim();

  // Validações
  if (!name || isNaN(price) || price <= 0) {
    showToast("❌ Preencha nome e preço corretamente");
    return;
  }

  if (!category) {
    showToast("❌ Selecione uma categoria");
    return;
  }

  if (subcategoryOptions[category] && !subcategory) {
    showToast("❌ Selecione uma subcategoria");
    return;
  }

  if (currentPhotos.length === 0) {
    showToast("❌ Adicione pelo menos uma foto do produto");
    return;
  }

  // Monta o FormData para envio multipart
  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("rating", rating);
  formData.append("badge", badge);
  formData.append("category", category);
  formData.append("subcategory", subcategory);
  formData.append("description", description);
  formData.append("sizes", sizesRaw);

  // Converte cada foto (base64) em Blob e adiciona ao FormData
  currentPhotos.forEach((base64, index) => {
  try {
    const isVideo = base64.startsWith("data:video/");
    const mimeMatch = base64.match(/data:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const ext = isVideo
      ? (mime.includes("mp4") ? "mp4" : "webm")
      : (mime.includes("png") ? "png" : "jpg");

    const blob = base64ToBlob(base64);
    formData.append("photos", blob, `arquivo-${index + 1}.${ext}`);
  } catch (err) {
    console.warn("Erro ao converter arquivo", index, err);
  }
});




  // Estado de "enviando" no botão
  const submitBtn = addProductForm.querySelector("button[type='submit']");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Enviando...";
  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.7";

  try {
    await createProduct(formData);
    showToast(`✓ "${name}" adicionado!`);

    // Recarrega do backend (todos os usuários veem)
    await fetchProducts();
    applyFilters();
    renderAdminProducts();

    // Reset form
    addProductForm.reset();
    document.getElementById("pRating").value = "5.0";
    currentPhotos = [];
    renderPhotoPreviews();
    subcategoryFormGroup.style.display = "none";
    pSubcategory.required = false;

    if (navigator.vibrate) navigator.vibrate(40);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    showToast("❌ Erro ao salvar produto. Tente novamente.");
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    submitBtn.style.opacity = "";
  }
});

/* =========================================
   MODAL DE DETALHES DO PRODUTO
   ========================================= */
const productModal = document.getElementById("productModal");
const pdMedia = document.getElementById("pdMedia");
const pdBadge = document.getElementById("pdBadge");
const pdName = document.getElementById("pdName");
const pdRating = document.getElementById("pdRating");
const pdPrice = document.getElementById("pdPrice");
const pdDescription = document.getElementById("pdDescription");
const pdSizesWrapper = document.getElementById("pdSizesWrapper");
const pdSizes = document.getElementById("pdSizes");
const pdQty = document.getElementById("pdQty");
const pdQtyMinus = document.getElementById("pdQtyMinus");
const pdQtyPlus = document.getElementById("pdQtyPlus");
const pdAddBtn = document.getElementById("pdAddBtn");
const closeProductModal = document.getElementById("closeProductModal");
const pdPrev = document.getElementById("pdPrev");
const pdNext = document.getElementById("pdNext");
const pdDots = document.getElementById("pdDots");

function openProductModal(product) {
  currentProduct = product;
  selectedSize = null;
  selectedQty = 1;
  pdPhotoIndex = 0;

  if (Array.isArray(product.photos) && product.photos.length > 0) {
    pdPhotosList = [...product.photos];
  } else if (product.photo) {
    pdPhotosList = [product.photo];
  } else {
    pdPhotosList = [];
  }

  renderPdMedia();

  pdBadge.textContent = product.badge || "";
  pdName.textContent = product.name;
  pdRating.textContent = `⭐ ${product.rating || 5.0}  •  ${Math.floor(Math.random() * 200 + 50)} avaliações`;
  pdPrice.textContent = `R$ ${Number(product.price).toFixed(2).replace(".", ",")}`;
  pdDescription.textContent = product.description || "";

  const sizes = getProductSizesArray(product);

  if (sizes.length > 0) {
    pdSizesWrapper.style.display = "block";
    pdSizes.innerHTML = sizes
      .map((s) => `<button class="size-btn" data-size="${s}">${s}</button>`)
      .join("");

    pdSizes.querySelectorAll(".size-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        pdSizes.querySelectorAll(".size-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedSize = btn.dataset.size;
        if (navigator.vibrate) navigator.vibrate(10);
      });
    });
  } else {
    pdSizesWrapper.style.display = "none";
  }

  selectedQty = 1;
  pdQty.textContent = "1";

  productModal.classList.add("open");
  document.body.style.overflow = "hidden";
}




function renderPdMedia() {
  if (pdPhotosList.length === 0) {
    pdMedia.innerHTML = (currentProduct && currentProduct.emoji) || "👟";
    pdPrev.style.display = "none";
    pdNext.style.display = "none";
    pdDots.innerHTML = "";
    return;
  }

  const url = pdPhotosList[pdPhotoIndex];
  const isVideo = /\.(mp4|webm|mov|avi)$/i.test(url) || url.startsWith("data:video/");

  if (isVideo) {
    pdMedia.innerHTML = `<video src="${url}" controls autoplay muted playsinline></video>`;
  } else {
    pdMedia.innerHTML = `<img src="${url}" alt="${currentProduct.name}" />`;
  }

  if (pdPhotosList.length > 1) {
    pdPrev.style.display = "flex";
    pdNext.style.display = "flex";

    pdDots.innerHTML = pdPhotosList
      .map(
        (_, i) =>
          `<button class="pd-dot ${i === pdPhotoIndex ? "active" : ""}" data-index="${i}" aria-label="Item ${i + 1}"></button>`
      )
      .join("");

    pdDots.querySelectorAll(".pd-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        pdPhotoIndex = parseInt(dot.dataset.index);
        renderPdMedia();
      });
    });
  } else {
    pdPrev.style.display = "none";
    pdNext.style.display = "none";
    pdDots.innerHTML = "";
  }
}


pdPrev.addEventListener("click", () => {
  if (pdPhotosList.length <= 1) return;
  pdPhotoIndex = (pdPhotoIndex - 1 + pdPhotosList.length) % pdPhotosList.length;
  renderPdMedia();
  if (navigator.vibrate) navigator.vibrate(8);
});

pdNext.addEventListener("click", () => {
  if (pdPhotosList.length <= 1) return;
  pdPhotoIndex = (pdPhotoIndex + 1) % pdPhotosList.length;
  renderPdMedia();
  if (navigator.vibrate) navigator.vibrate(8);
});

/* Swipe nas fotos */
(function enablePdSwipe() {
  let startX = 0;
  let startY = 0;
  const imgWrapper = document.querySelector(".product-modal-image");
  if (!imgWrapper) return;

  imgWrapper.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    },
    { passive: true }
  );

  imgWrapper.addEventListener(
    "touchend",
    (e) => {
      if (pdPhotosList.length <= 1) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;

      if (Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) < 40) return;

      if (dx < 0) {
        pdPhotoIndex = (pdPhotoIndex + 1) % pdPhotosList.length;
      } else {
        pdPhotoIndex = (pdPhotoIndex - 1 + pdPhotosList.length) % pdPhotosList.length;
      }
      renderPdMedia();
    },
    { passive: true }
  );
})();

function closeProductModalFn() {
  productModal.classList.remove("open");
  document.body.style.overflow = "";
  currentProduct = null;
  selectedSize = null;
}

closeProductModal.addEventListener("click", closeProductModalFn);

productModal.addEventListener("click", (e) => {
  if (e.target === productModal) closeProductModalFn();
});

pdQtyMinus.addEventListener("click", () => {
  if (selectedQty > 1) {
    selectedQty--;
    pdQty.textContent = selectedQty;
    if (navigator.vibrate) navigator.vibrate(8);
  }
});

pdQtyPlus.addEventListener("click", () => {
  if (selectedQty < 99) {
    selectedQty++;
    pdQty.textContent = selectedQty;
    if (navigator.vibrate) navigator.vibrate(8);
  }
});

pdAddBtn.addEventListener("click", () => {
  if (!currentProduct) return;

  const sizes = getProductSizesArray(currentProduct);

  if (sizes.length > 0 && !selectedSize) {
    showToast("⚠️ Selecione um tamanho");
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    return;
  }

  addToCartWithOptions(currentProduct, selectedQty, selectedSize);
  closeProductModalFn();
});

/* =========================================
   EVENTOS GLOBAIS
   ========================================= */
document.getElementById("cartIcon").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("overlay").addEventListener("click", closeCart);

document.getElementById("searchBtn").addEventListener("click", searchProducts);
document.getElementById("searchInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchProducts();
});

/* Swipe para fechar o carrinho */
let touchStartX = 0;
const cartPanel = document.getElementById("cartPanel");

cartPanel.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.touches[0].clientX;
  },
  { passive: true }
);

cartPanel.addEventListener(
  "touchmove",
  (e) => {
    const deltaX = e.touches[0].clientX - touchStartX;
    if (deltaX > 80) {
      closeCart();
      touchStartX = 0;
    }
  },
  { passive: true }
);

/* =========================================
   PAGAMENTO — INTEGRAÇÃO ASAAS
   ========================================= */
async function iniciarPagamento() {
  if (cart.length === 0) {
    showToast("⚠️ Seu carrinho está vazio");
    return;
  }

  const btn = document.querySelector(".checkout-btn");
  const originalText = btn.textContent;

  try {
    btn.textContent = "Gerando pagamento...";
    btn.disabled = true;
    btn.style.opacity = "0.7";

    const response = await fetch(`${BACKEND_URL}/api/create-preference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          size: item.size || null,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Falha ao gerar pagamento");
    }

    const data = await response.json();

    if (data.init_point) {
      showToast("✓ Redirecionando para o pagamento...");

      setTimeout(() => {
        window.location.href = data.init_point;
      }, 600);
    } else {
      throw new Error("Link de pagamento não gerado");
    }
  } catch (error) {
    console.error("Erro no pagamento:", error);
    showToast("❌ Erro ao iniciar pagamento. Tente novamente.");
    btn.textContent = originalText;
    btn.disabled = false;
    btn.style.opacity = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", iniciarPagamento);
  }
});




/* =========================================
   MODAL DE WHATSAPP (CONTATOS)
   ========================================= */
const whatsappModal = document.getElementById("whatsappModal");
const btnWhatsapp = document.getElementById("btnWhatsapp");

if (btnWhatsapp && whatsappModal) {
  btnWhatsapp.addEventListener("click", () => {
    whatsappModal.classList.add("open");
    document.body.style.overflow = "hidden";
    if (navigator.vibrate) navigator.vibrate(15);
  });

  whatsappModal.addEventListener("click", (e) => {
    if (e.target === whatsappModal) {
      whatsappModal.classList.remove("open");
      document.body.style.overflow = "";
    }
  });
}



/* =========================================
   INIT — Carrega produtos do backend
   ========================================= */
(async function init() {
  console.log("🚀 Iniciando GM Calçados...");
  console.log("   Backend:", BACKEND_URL);

  await fetchProducts();
  console.log(`✓ ${products.length} produtos carregados`);

  renderProducts();
  updateCart();
})();