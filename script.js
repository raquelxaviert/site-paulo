// ===== Configuração =====
const WHATSAPP = "5531985467066";
const WA_MSG = "Olá, Paulo! Vi seu site e gostaria de um orçamento de móveis planejados.";

const PHOTOS = [
  ["cozinha", "cozinha-01"], ["quarto", "quarto-01"], ["banheiro", "banheiro-01"],
  ["cozinha", "cozinha-02"], ["cozinha", "cozinha-03"], ["quarto", "quarto-03"],
  ["banheiro", "banheiro-02"], ["cozinha", "cozinha-04"], ["cozinha", "cozinha-06"],
  ["quarto", "quarto-02"], ["banheiro", "banheiro-04"], ["cozinha", "cozinha-07"],
  ["cozinha", "cozinha-12"], ["quarto", "quarto-04"], ["banheiro", "banheiro-03"],
  ["cozinha", "cozinha-08"], ["cozinha", "cozinha-05"], ["quarto", "quarto-05"],
  ["banheiro", "banheiro-05"], ["cozinha", "cozinha-09"], ["cozinha", "cozinha-10"],
  ["quarto", "quarto-06"], ["banheiro", "banheiro-06"], ["cozinha", "cozinha-11"],
];
const LABELS = { cozinha: "Cozinha", quarto: "Quarto", banheiro: "Banheiro" };

// ===== Links do WhatsApp =====
const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WA_MSG)}`;
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waUrl;
  a.target = "_blank";
  a.rel = "noopener";
});

document.getElementById("year").textContent = new Date().getFullYear();

// ===== Menu mobile e nav =====
const nav = document.querySelector(".nav");
document.getElementById("menuToggle").addEventListener("click", () => nav.classList.toggle("menu-open"));
document.querySelectorAll("#menu a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("menu-open")));
window.addEventListener("scroll", () => nav.classList.toggle("is-scrolled", window.scrollY > 10), { passive: true });

// ===== Galeria =====
const grid = document.getElementById("galleryGrid");
grid.innerHTML = PHOTOS.map(([cat, file], i) => `
  <figure class="gallery__item" data-cat="${cat}" data-i="${i}">
    <img src="assets/img/${file}.jpg" alt="${LABELS[cat]} planejado(a) por Paulo Lourenço" loading="lazy" />
    <span>${LABELS[cat]}</span>
  </figure>`).join("");

document.querySelectorAll(".filters button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filters button").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const f = btn.dataset.filter;
    grid.querySelectorAll(".gallery__item").forEach((el) => {
      el.classList.toggle("is-hidden", f !== "all" && el.dataset.cat !== f);
    });
  });
});

// ===== Lightbox =====
const lb = document.getElementById("lightbox");
const lbImg = lb.querySelector("img");
let current = 0;
const visible = () => [...grid.querySelectorAll(".gallery__item:not(.is-hidden)")];
function show(i) {
  const items = visible();
  current = (i + items.length) % items.length;
  lbImg.src = items[current].querySelector("img").src;
}
grid.addEventListener("click", (e) => {
  const item = e.target.closest(".gallery__item");
  if (!item) return;
  show(visible().indexOf(item));
  lb.classList.add("is-open");
  lb.setAttribute("aria-hidden", "false");
});
const closeLb = () => { lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true"); };
lb.querySelector(".lightbox__close").addEventListener("click", closeLb);
lb.querySelector(".lightbox__prev").addEventListener("click", () => show(current - 1));
lb.querySelector(".lightbox__next").addEventListener("click", () => show(current + 1));
lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
document.addEventListener("keydown", (e) => {
  if (!lb.classList.contains("is-open")) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") show(current - 1);
  if (e.key === "ArrowRight") show(current + 1);
});

// ===== Vídeos: tocam sozinhos quando aparecem na tela =====
const vObs = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) { target.preload = "auto"; target.play().catch(() => {}); }
    else target.pause();
  });
}, { threshold: 0.4 });
document.querySelectorAll(".video video").forEach((v) => vObs.observe(v));

// ===== Animação de entrada =====
const revealEls = document.querySelectorAll(".section__head, .service, .steps__grid li, .review, .about__photo, .about__text, .video, .faq__list details, .stats__grid > div");
revealEls.forEach((el) => el.classList.add("reveal"));
// Itens lado a lado entram em cascata
[".services__grid", ".steps__grid", ".reviews__grid", ".stats__grid", ".faq__list"].forEach((sel) => {
  document.querySelectorAll(`${sel} > *`).forEach((el, i) => el.style.setProperty("--d", `${(i % 4) * 0.12}s`));
});
const rObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); rObs.unobserve(e.target); }
  });
}, { threshold: 0.12 });
revealEls.forEach((el) => rObs.observe(el));

// ===== Contagem subindo nos números =====
const fmt = (n, dec) => n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.decimals || "0", 10);
  const dur = 2000;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = fmt(target * eased, dec);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const cObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { countUp(e.target); cObs.unobserve(e.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll("[data-count]").forEach((el) => cObs.observe(el));

// ===== Barra de progresso de leitura =====
const bar = document.getElementById("progress");
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}, { passive: true });
