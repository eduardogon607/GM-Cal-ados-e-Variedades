/* =========================================
   GM CALÇADOS - SCRIPT PRINCIPAL
   ========================================= */

/* =========================================
   CONFIGURAÇÃO DO BACKEND
   ========================================= */
const BACKEND_URL = "https://gm-cal-ados-e-variedades-1.onrender.com";

/* =========================================
   SPLASH SCREEN
   ========================================= */
(function initSplash() {
  const splash = document.getElementById("splashScreen");
  if (!splash) return;
  document.body.style.overflow = "hidden";
  setTimeout(() => {
    splash.classList.add("hide");
    document.body.style.overflow = "";
    setTimeout(() => { splash.remove(); }, 900);
  }, 2200);
})();

/* =========================================
   PRODUTOS PADRÃO
   ========================================= */
const DEFAULT_PRODUCTS = [
  { id: 1, name: "Tênis Nike Air Max Branco/Dourado", price: 499.90, oldPrice: 699.90, emoji: "👟", rating: 4.8, badge: "🔥 Top", category: "casual", subcategory: "", description: "Tênis premium com amortecimento Air Max. Combina conforto e estilo para o dia a dia.", sizes: ["37", "38", "39", "40", "41", "42"] },
  { id: 2, name: "Tênis Adidas Ultraboost Preto", price: 429.90, oldPrice: 549.90, emoji: "👟", rating: 4.7, badge: "OFF", category: "esportivos", subcategory: "tenis-esportivos", description: "Tênis de corrida com tecnologia Boost. Retorno de energia em cada passada.", sizes: ["38", "39", "40", "41", "42", "43"] },
  { id: 3, name: "Tênis Puma Runner Pro Branco", price: 349.90, oldPrice: 449.90, emoji: "👟", rating: 4.6, badge: "NOVO", category: "esportivos", subcategory: "tenis-esportivos", description: "Leve, respirável e ideal para treinos diários.", sizes: ["37", "38", "39", "40", "41"] },
  { id: 4, name: "Tênis Vans Old Skool Clássico", price: 289.90, oldPrice: 359.90, emoji: "👟", rating: 4.9, badge: "🔥 Top", category: "casual", subcategory: "", description: "Clássico atemporal do skate. Combina com qualquer look.", sizes: ["36", "37", "38", "39", "40", "41", "42", "43"] },
];

/* =========================================
   CONFIGURAÇÃO DO ADMIN
   ========================================= */
const ADMIN_CREDENTIALS = { user: "admin", pass: "Gmloja" };
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
let selectedInstallment = 1;
const INTEREST_RATE = 0.10;

/* =========================================
   API — COMUNICAÇÃO COM O BACKEND
   ========================================= */
async function fetchProducts() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/products`);
    if (!response.ok) throw new Error("Falha");
    const data = await response.json();
    products = (Array.isArray(data) && data.length > 0) ? data : [...DEFAULT_PRODUCTS];
    return products;
  } catch (error) {
    console.error("Erro produtos:", error);
    products = [...DEFAULT_PRODUCTS];
    return products;
  }
}

async function createProduct(formData) {
  const res = await fetch(`${BACKEND_URL}/api/products`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Erro ao criar");
  return await res.json();
}

async function deleteProduct(id) {
  const res = await fetch(`${BACKEND_URL}/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao excluir");
  return await res.json();
}

/* =========================================
   HELPERS
   ========================================= */
function getProductMediaHTML(p) {
  const url = (Array.isArray(p.photos) && p.photos[0]) || p.photo;
  if (url) {
    const isVideo = /\.(mp4|webm|mov|avi)$/i.test(url);
    if (isVideo) return `<video src="${url}" muted autoplay loop playsinline></video>`;
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
  if (typeof p.sizes === "string" && p.sizes.trim()) return p.sizes.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function base64ToBlob(base64) {
  const parts = base64.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  const array = [];
  for (let i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i));
  return new Blob([new Uint8Array(array)], { type: mime });
}

const CATEGORY_LABELS = { casual: "👟 Casual", esportivos: "🏃 Esportivos", feminino: "👠 Feminino", infantil: "🧒 Infantil", social: "👞 Social", acessorios: "🕶️ Acessórios" };
const SUBCATEGORY_LABELS = { "roupas-academia": "👕 Roupas para Academia", "tenis-esportivos": "👟 Tênis Esportivos", oculos: "🕶️ Óculos", chapeus: "🧢 Chapéus" };

/* =========================================
   RENDERIZAR PRODUTOS
   ========================================= */
function renderProducts(list = products) {
  const grid = document.getElementById("productsGrid");
  const title = document.getElementById("productsTitle");
  grid.innerHTML = "";

  if (currentFilter.subcategory) title.textContent = SUBCATEGORY_LABELS[currentFilter.subcategory] || "Produtos";
  else if (currentFilter.category) title.textContent = CATEGORY_LABELS[currentFilter.category] || "Produtos";
  else if (currentFilter.term) title.textContent = `🔍 Resultado para "${currentFilter.term}"`;
  else title.textContent = "🔥 Mais Vendidos";

  if (list.length === 0) {
    grid.innerHTML = "<p style='grid-column:1/-1;text-align:center;padding:40px;'>Nenhum produto encontrado 😕</p>";
    return;
  }

  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    const photoCount = getProductPhotosCount(p);
    const countBadge = photoCount > 1 ? `<span class="product-photo-count">📸 ${photoCount}</span>` : "";

    card.innerHTML = `
      <div class="product-badge">${p.badge || ""}</div>
      <div class="product-image">${getProductMediaHTML(p)}${countBadge}</div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-rating">⭐ ${p.rating || 5.0}</div>
        <div class="product-price-row"><span class="product-price">R$ ${Number(p.price).toFixed(2).replace(".", ",")}</span></div>
        <button class="add-cart-btn" data-id="${p.id}">Adicionar</button>
      </div>
    `;

    card.addEventListener("click", (e) => { if (!e.target.closest(".add-cart-btn")) openProductModal(p); });
    grid.appendChild(card);
  });

  document.querySelectorAll(".add-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => { e.stopPropagation(); addToCart(parseInt(btn.dataset.id)); });
  });
}

/* =========================================
   FILTROS E BUSCA
   ========================================= */
function applyFilters() {
  let list = [...products];
  if (currentFilter.category) list = list.filter((p) => p.category === currentFilter.category);
  if (currentFilter.subcategory) list = list.filter((p) => p.subcategory === currentFilter.subcategory);
  if (currentFilter.term) list = list.filter((p) => p.name.toLowerCase().includes(currentFilter.term.toLowerCase()));
  renderProducts(list);
}

function filterByCategory(category) {
  currentFilter = { category, subcategory: null, term: "" };
  document.getElementById("searchInput").value = "";
  applyFilters();
  scrollToProducts();
}

function filterBySubcategory(subcategory) {
  const cat = Object.keys(subcategories).find((k) => subcategories[k].items.some((i) => i.value === subcategory));
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
  setTimeout(() => { document.querySelector(".products-section").scrollIntoView({ behavior: "smooth", block: "start" }); }, 150);
}

function searchProducts() {
  const term = document.getElementById("searchInput").value.trim();
  currentFilter = { category: null, subcategory: null, term };
  closeSubcategory();
  applyFilters();
  if (term) scrollToProducts();
}

/* =========================================
   CARRINHO
   ========================================= */
function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  const sizes = getProductSizesArray(product);
  if (sizes.length > 0) { openProductModal(product); return; }

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
  if (existing) existing.qty += qty;
  else cart.push({ ...product, qty, size: size || null, itemKey });

  updateCart();
  showToast(`✓ ${qty}x ${product.name.split(" ").slice(0, 3).join(" ")}${size ? ` (Tam ${size})` : ""}`);
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
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const interest = selectedInstallment > 1 ? subtotal * INTEREST_RATE : 0;
  const totalPrice = subtotal + interest;

  cartCount.textContent = totalQty;

  if (selectedInstallment > 1) {
    const parcelaValue = totalPrice / selectedInstallment;
    cartTotal.innerHTML = `R$ ${totalPrice.toFixed(2).replace(".", ",")} <span class="interest-note">${selectedInstallment}x de R$ ${parcelaValue.toFixed(2).replace(".", ",")} (+10% juros)</span>`;
  } else {
    cartTotal.textContent = `R$ ${totalPrice.toFixed(2).replace(".", ",")}`;
  }

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio 🛒</p>';
    return;
  }

  cartItems.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div class="cart-item-img">${getProductMediaHTML(item)}</div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        ${item.size ? `<span class="cart-item-size">Tam: ${item.size}</span>` : ""}
        <span>${item.qty}x R$ ${Number(item.price).toFixed(2).replace(".", ",")}</span>
      </div>
      <button class="remove-btn" data-key="${item.itemKey || item.id}">🗑️</button>
    </div>
  `).join("");

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
   SUBCATEGORIAS
   ========================================= */
const subcategories = {
  esportivos: { title: "🏃 Esportivos", items: [{ icon: "👕", label: "Roupas para Academia", value: "roupas-academia" }, { icon: "👟", label: "Tênis Esportivos", value: "tenis-esportivos" }] },
  acessorios: { title: "🕶️ Acessórios", items: [{ icon: "🕶️", label: "Óculos", value: "oculos" }, { icon: "🧢", label: "Chapéus", value: "chapeus" }] },
};

const subPanel = document.getElementById("subcategoryPanel");
const subGrid = document.getElementById("subcategoryGrid");
const subTitle = document.getElementById("subcategoryTitle");
const closeSubBtn = document.getElementById("closeSubcategory");

function openSubcategory(key) {
  const data = subcategories[key];
  if (!data) return;
  subTitle.textContent = data.title;
  subGrid.innerHTML = data.items.map((item) => `<button class="subcategory-item" data-value="${item.value}"><span class="sub-icon">${item.icon}</span><span>${item.label}</span></button>`).join("");
  subPanel.classList.add("open");
  document.querySelectorAll(".category-card").forEach((c) => c.classList.remove("active"));
  const activeCard = document.querySelector(`.category-card[data-category="${key}"]`);
  if (activeCard) activeCard.classList.add("active");

  subGrid.querySelectorAll(".subcategory-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const label = btn.querySelector("span:last-child").textContent;
      showToast(`📂 Filtrando: ${label}`);
      filterBySubcategory(btn.dataset.value);
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
      if (card.classList.contains("active")) { closeSubcategory(); clearFilters(); }
      else openSubcategory(key);
    } else {
      showToast(`🔍 Categoria: ${card.querySelector(".category-label").textContent}`);
      closeSubcategory();
      filterByCategory(key);
    }
    if (navigator.vibrate) navigator.vibrate(15);
  });
});

closeSubBtn.addEventListener("click", () => { closeSubcategory(); clearFilters(); });

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
   SISTEMA DE ADMIN E LOGIN
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

function openModal(modal) { modal.classList.add("open"); document.body.style.overflow = "hidden"; }
function closeModal(modal) { modal.classList.remove("open"); document.body.style.overflow = ""; }

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const modal = document.getElementById(btn.dataset.close);
    if (modal) closeModal(modal);
  });
});

[loginModal, adminPanel].forEach((modal) => {
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(modal); });
});

accountIcon.addEventListener("click", () => {
  const isLogged = sessionStorage.getItem(SESSION_KEY) === "true";
  if (isLogged) openAdminPanel();
  else {
    loginUserInput.value = "";
    loginPassInput.value = "";
    loginError.textContent = "";
    openModal(loginModal);
    setTimeout(() => loginUserInput.focus(), 300);
  }
});

function tryLogin() {
  if (loginUserInput.value.trim() === ADMIN_CREDENTIALS.user && loginPassInput.value === ADMIN_CREDENTIALS.pass) {
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
loginUserInput.addEventListener("keyup", (e) => { if (e.key === "Enter") loginPassInput.focus(); });
loginPassInput.addEventListener("keyup", (e) => { if (e.key === "Enter") tryLogin(); });

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  closeModal(adminPanel);
  showToast("👋 Sessão encerrada");
});

function openAdminPanel() {
  voltarMenuAdmin(); // Sempre abre no menu principal
  renderAdminProducts(); // Prepara a lista de produtos por trás
  openModal(adminPanel);
}

/* =========================================
   NAVEGAÇÃO DO PAINEL ADMIN
   ========================================= */
window.voltarMenuAdmin = function() {
  document.getElementById("adminMenuView").style.display = "block";
  document.getElementById("adminProductsView").style.display = "none";
  document.getElementById("adminHistoryView").style.display = "none";
};

document.getElementById("btnGoToProducts").addEventListener("click", () => {
  document.getElementById("adminMenuView").style.display = "none";
  document.getElementById("adminProductsView").style.display = "block";
  document.getElementById("adminHistoryView").style.display = "none";
});

document.getElementById("btnGoToHistory").addEventListener("click", () => {
  document.getElementById("adminMenuView").style.display = "none";
  document.getElementById("adminProductsView").style.display = "none";
  document.getElementById("adminHistoryView").style.display = "block";
  carregarHistoricoPedidos();
});

/* =========================================
   HISTÓRICO DE PEDIDOS
   ========================================= */
async function carregarHistoricoPedidos() {
  const adminOrderList = document.getElementById("adminOrderList");
  adminOrderList.innerHTML = "<p style='text-align:center;color:#999;font-size:12px;'>Buscando...</p>";
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/orders`);
    if (!response.ok) throw new Error("Erro");
    const orders = await response.json();

    if (orders.length === 0) {
      adminOrderList.innerHTML = "<p style='text-align:center;color:#999;font-size:12px;'>Nenhuma compra registrada ainda.</p>";
      return;
    }

    adminOrderList.innerHTML = orders.map(order => {
      const isPago = order.status === "Pago";
      const itensHtml = order.itens.map(item => 
        `<div style="display:flex; justify-content:space-between; margin-bottom:2px;">
           <span>• ${item.qty}x ${item.name} ${item.size ? `(Tam: ${item.size})` : ''}</span>
           <span>R$ ${item.price.toFixed(2).replace(".", ",")}</span>
         </div>`
      ).join("");

      return `
        <div class="order-card ${isPago ? 'pago' : ''}">
          <div class="order-header">
            <span>${order.id}</span>
            <span class="order-status">${order.status}</span>
          </div>
          <div class="order-body">
            <div><strong>Cliente:</strong> ${order.cliente}</div>
            <div><strong>Data:</strong> ${order.data}</div>
            <div><strong>Total:</strong> R$ ${order.total.toFixed(2).replace(".", ",")}</div>
            <div class="order-items">${itensHtml}</div>
          </div>
        </div>
      `;
    }).join("");

  } catch (error) {
    adminOrderList.innerHTML = "<p style='text-align:center;color:#e74c3c;font-size:12px;'>Erro ao carregar o histórico.</p>";
  }
}

/* =========================================
   LISTA DE PRODUTOS NO ADMIN
   ========================================= */
function renderAdminProducts() {
  adminProductCount.textContent = products.length;
  if (products.length === 0) {
    adminProductList.innerHTML = '<p style="text-align:center;color:#999;font-size:12px;padding:20px;">Nenhum produto cadastrado.</p>';
    return;
  }

  adminProductList.innerHTML = products.map((p) => {
    const catLabel = CATEGORY_LABELS[p.category] || "Sem categoria";
    const subLabel = p.subcategory ? ` • ${SUBCATEGORY_LABELS[p.subcategory] || p.subcategory}` : "";
    const sizes = getProductSizesArray(p);
    const sizesLabel = sizes.length > 0 ? `<div class="ap-sizes">📏 ${sizes.join(" · ")}</div>` : "";
    const photoCount = getProductPhotosCount(p);
    const photosLabel = photoCount > 1 ? `<div class="ap-sizes">📸 ${photoCount} fotos</div>` : "";

    return `
      <div class="admin-product-item">
        <div class="ap-emoji">${getProductMediaHTML(p)}</div>
        <div class="ap-info">
          <div class="ap-name">${p.name}</div>
          <div class="ap-price">R$ ${Number(p.price).toFixed(2).replace(".", ",")}</div>
          <div class="ap-category">📁 ${catLabel}${subLabel}</div>
          ${sizesLabel}${photosLabel}
        </div>
        <button class="ap-delete" data-id="${p.id}" title="Excluir">🗑️</button>
      </div>
    `;
  }).join("");

  adminProductList.querySelectorAll(".ap-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = parseInt(btn.dataset.id);
      const prod = products.find((p) => p.id === id);
      if (!prod || !confirm(`Excluir "${prod.name}"?`)) return;
      try {
        await deleteProduct(id);
        await fetchProducts();
        renderAdminProducts();
        applyFilters();
        updateCart();
        showToast("🗑️ Produto excluído");
      } catch (error) { showToast("❌ Erro ao excluir produto"); }
    });
  });
}

/* =========================================
   UPLOAD DE FOTOS/VÍDEOS
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

  photoPreviewGrid.innerHTML = currentPhotos.map((src, i) => {
    const isVideo = src.startsWith("data:video/");
    const media = isVideo ? `<video src="${src}" muted></video>` : `<img src="${src}" alt="Arquivo ${i + 1}" />`;
    const badge = isVideo ? `<span class="pp-video-badge">VÍDEO</span>` : "";

    return `
      <div class="photo-preview-item">
        ${media} ${badge}
        ${i === 0 ? '<span class="pp-cover">CAPA</span>' : ""}
        <button type="button" class="pp-remove" data-index="${i}" title="Remover">✖</button>
      </div>
    `;
  }).join("");

  photoPreviewGrid.querySelectorAll(".pp-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPhotos.splice(parseInt(btn.dataset.index), 1);
      renderPhotoPreviews();
      if (navigator.vibrate) navigator.vibrate(15);
    });
  });

  photoUploadBtn.style.display = currentPhotos.length >= MAX_PHOTOS ? "none" : "flex";
}

pPhotoInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  const remaining = MAX_PHOTOS - currentPhotos.length;
  const toAdd = files.slice(0, remaining);
  if (files.length > remaining) showToast(`⚠️ Máximo de ${MAX_PHOTOS} arquivos (${remaining} adicionados)`);

  let processed = 0;
  toAdd.forEach((file) => {
    if (file.size > 20 * 1024 * 1024) {
      showToast(`⚠️ "${file.name}" é muito grande (máx. 20MB)`);
      processed++;
      return;
    }
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
  esportivos: [{ value: "roupas-academia", label: "👕 Roupas para Academia" }, { value: "tenis-esportivos", label: "👟 Tênis Esportivos" }],
  acessorios: [{ value: "oculos", label: "🕶️ Óculos" }, { value: "chapeus", label: "🧢 Chapéus" }],
};

pCategory.addEventListener("change", () => {
  const cat = pCategory.value;
  if (subcategoryOptions[cat]) {
    pSubcategory.innerHTML = '<option value="">Selecione...</option>' + subcategoryOptions[cat].map((s) => `<option value="${s.value}">${s.label}</option>`).join("");
    subcategoryFormGroup.style.display = "flex";
    pSubcategory.required = true;
  } else {
    subcategoryFormGroup.style.display = "none";
    pSubcategory.required = false;
    pSubcategory.value = "";
  }
});

/* =========================================
   ADICIONAR PRODUTO
   ========================================= */
addProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("pName").value.trim();
  const price = parseFloat(document.getElementById("pPrice").value);
  const rating = parseFloat(document.getElementById("pRating").value) || 5.0;
  const badge = document.getElementById("pBadge").value;
  const category = pCategory.value;
  const subcategory = subcategoryOptions[category] ? pSubcategory.value : "";
  const description = document.getElementById("pDescription").value.trim();
  const sizesRaw = document.getElementById("pSizes").value.trim();

  if (!name || isNaN(price) || price <= 0) return showToast("❌ Preencha nome e preço corretamente");
  if (!category) return showToast("❌ Selecione uma categoria");
  if (subcategoryOptions[category] && !subcategory) return showToast("❌ Selecione uma subcategoria");
  if (currentPhotos.length === 0) return showToast("❌ Adicione pelo menos uma foto do produto");

  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("rating", rating);
  formData.append("badge", badge);
  formData.append("category", category);
  formData.append("subcategory", subcategory);
  formData.append("description", description);
  formData.append("sizes", sizesRaw);

  currentPhotos.forEach((base64, index) => {
    try {
      const isVideo = base64.startsWith("data:video/");
      const mimeMatch = base64.match(/data:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const ext = isVideo ? (mime.includes("mp4") ? "mp4" : "webm") : (mime.includes("png") ? "png" : "jpg");
      const blob = base64ToBlob(base64);
      formData.append("photos", blob, `arquivo-${index + 1}.${ext}`);
    } catch (err) { console.warn(err); }
  });

  const submitBtn = addProductForm.querySelector("button[type='submit']");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Enviando...";
  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.7";

  try {
    await createProduct(formData);
    showToast(`✓ "${name}" adicionado!`);
    await fetchProducts();
    applyFilters();
    renderAdminProducts();

    addProductForm.reset();
    document.getElementById("pRating").value = "5.0";
    currentPhotos = [];
    renderPhotoPreviews();
    subcategoryFormGroup.style.display = "none";
    pSubcategory.required = false;

    if (navigator.vibrate) navigator.vibrate(40);
  } catch (error) {
    showToast("❌ Erro ao salvar produto.");
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

  if (Array.isArray(product.photos) && product.photos.length > 0) pdPhotosList = [...product.photos];
  else if (product.photo) pdPhotosList = [product.photo];
  else pdPhotosList = [];

  renderPdMedia();
  pdBadge.textContent = product.badge || "";
  pdName.textContent = product.name;
  pdRating.textContent = `⭐ ${product.rating || 5.0} • ${Math.floor(Math.random() * 200 + 50)} avaliações`;
  pdPrice.textContent = `R$ ${Number(product.price).toFixed(2).replace(".", ",")}`;
  pdDescription.textContent = product.description || "";

  const sizes = getProductSizesArray(product);
  if (sizes.length > 0) {
    pdSizesWrapper.style.display = "block";
    pdSizes.innerHTML = sizes.map((s) => `<button class="size-btn" data-size="${s}">${s}</button>`).join("");
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

  document.getElementById("pdQty").textContent = "1";
  productModal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function renderPdMedia() {
  if (pdPhotosList.length === 0) {
    pdMedia.innerHTML = (currentProduct && currentProduct.emoji) || "👟";
    pdPrev.style.display = "none"; pdNext.style.display = "none"; pdDots.innerHTML = "";
    return;
  }

  const url = pdPhotosList[pdPhotoIndex];
  const isVideo = /\.(mp4|webm|mov|avi)$/i.test(url) || url.startsWith("data:video/");
  pdMedia.innerHTML = isVideo ? `<video src="${url}" controls autoplay muted playsinline></video>` : `<img src="${url}" alt="${currentProduct.name}" />`;

  if (pdPhotosList.length > 1) {
    pdPrev.style.display = "flex"; pdNext.style.display = "flex";
    pdDots.innerHTML = pdPhotosList.map((_, i) => `<button class="pd-dot ${i === pdPhotoIndex ? "active" : ""}" data-index="${i}"></button>`).join("");
    pdDots.querySelectorAll(".pd-dot").forEach((dot) => {
      dot.addEventListener("click", () => { pdPhotoIndex = parseInt(dot.dataset.index); renderPdMedia(); });
    });
  } else {
    pdPrev.style.display = "none"; pdNext.style.display = "none"; pdDots.innerHTML = "";
  }
}

function closeProductModalFn() {
  productModal.classList.remove("open");
  document.body.style.overflow = "";
  currentProduct = null;
  selectedSize = null;
}

closeProductModal.addEventListener("click", closeProductModalFn);
productModal.addEventListener("click", (e) => { if (e.target === productModal) closeProductModalFn(); });

pdPrev.addEventListener("click", () => { if (pdPhotosList.length > 1) { pdPhotoIndex = (pdPhotoIndex - 1 + pdPhotosList.length) % pdPhotosList.length; renderPdMedia(); } });
pdNext.addEventListener("click", () => { if (pdPhotosList.length > 1) { pdPhotoIndex = (pdPhotoIndex + 1) % pdPhotosList.length; renderPdMedia(); } });

document.getElementById("pdQtyMinus").addEventListener("click", () => { if (selectedQty > 1) { selectedQty--; pdQty.textContent = selectedQty; } });
document.getElementById("pdQtyPlus").addEventListener("click", () => { if (selectedQty < 99) { selectedQty++; pdQty.textContent = selectedQty; } });

pdAddBtn.addEventListener("click", () => {
  if (!currentProduct) return;
  const sizes = getProductSizesArray(currentProduct);
  if (sizes.length > 0 && !selectedSize) return showToast("⚠️ Selecione um tamanho");
  addToCartWithOptions(currentProduct, selectedQty, selectedSize);
  closeProductModalFn();
});

/* =========================================
   PAGAMENTO — INTEGRAÇÃO ASAAS
   ========================================= */
async function iniciarPagamento() {
  if (cart.length === 0) return showToast("⚠️ Seu carrinho está vazio");

  const nomeInput = document.getElementById("clienteNome");
  const clienteNome = nomeInput ? nomeInput.value.trim() : "Cliente";
  if (!clienteNome) return showToast("⚠️ Por favor, digite seu nome para a comanda");

  const btn = document.querySelector(".checkout-btn");
  const originalText = btn.textContent;

  try {
    btn.textContent = "Gerando pagamento...";
    btn.disabled = true;
    btn.style.opacity = "0.7";

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const interest = selectedInstallment > 1 ? subtotal * INTEREST_RATE : 0;
    const totalWithInterest = subtotal + interest;
    const factor = subtotal > 0 ? totalWithInterest / subtotal : 1;

    const response = await fetch(`${BACKEND_URL}/api/create-preference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number((item.price * factor).toFixed(2)),
          qty: item.qty,
          size: item.size || null,
        })),
        installment: selectedInstallment,
        hasInterest: selectedInstallment > 1,
        clienteNome: clienteNome
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Falha ao gerar pagamento");
    }

    const data = await response.json();
    if (data.init_point) {
      showToast("✓ Redirecionando...");
      setTimeout(() => { window.location.href = data.init_point; }, 600);
    } else throw new Error("Link não gerado");

  } catch (error) {
    showToast("❌ Erro ao iniciar pagamento.");
    btn.textContent = originalText;
    btn.disabled = false;
    btn.style.opacity = "";
  }
}

/* =========================================
   EVENTOS GLOBAIS E INIT
   ========================================= */
document.getElementById("cartIcon").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("overlay").addEventListener("click", closeCart);
document.getElementById("searchBtn").addEventListener("click", searchProducts);
document.getElementById("searchInput").addEventListener("keyup", (e) => { if (e.key === "Enter") searchProducts(); });

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".checkout-btn").addEventListener("click", iniciarPagamento);

  document.querySelectorAll('input[name="installment"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      selectedInstallment = parseInt(radio.value);
      updateCart();
      if (navigator.vibrate) navigator.vibrate(10);
    });
  });

  const btnWhatsapp = document.getElementById("btnWhatsapp");
  const whatsappModal = document.getElementById("whatsappModal");
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
});

(async function init() {
  console.log("🚀 Iniciando GM Calçados...");
  await fetchProducts();
  renderProducts();
  updateCart();
})();