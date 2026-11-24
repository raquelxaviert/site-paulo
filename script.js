// ================= Configuração =================
const WHATSAPP = "5531985467066";
const WA_MSG = "Olá, Paulo! Vi seu site e queria um orçamento de móveis planejados.";

// [categoria, arquivo, formato no grid]
const PHOTOS = [
  ["cozinha", "cozinha-01", "hero"],
  ["quarto", "quarto-01"],
  ["banheiro", "banheiro-02"],
  ["cozinha", "cozinha-03"],
  ["cozinha", "cozinha-12", "wide"],
  ["quarto", "quarto-03"],
  ["banheiro", "banheiro-01"],
  ["cozinha", "cozinha-04"],
  ["cozinha", "cozinha-06"],
  ["quarto", "quarto-02"],
  ["banheiro", "banheiro-04"],
  ["cozinha", "cozinha-07"],
  ["cozinha", "cozinha-02"],
  ["quarto", "quarto-04"],
  ["banheiro", "banheiro-03"],
  ["cozinha", "cozinha-08"],
  ["cozinha", "cozinha-05"],
  ["quarto", "quarto-05"],
  ["banheiro", "banheiro-05"],
  ["cozinha", "cozinha-09"],
  ["cozinha", "cozinha-10"],
  ["quarto", "quarto-06"],
  ["banheiro", "banheiro-06"],
  ["cozinha", "cozinha-11"],
];
const LABEL = { cozinha: "Cozinha", quarto: "Quarto", banheiro: "Banheiro" };

document.documentElement.classList.add("js");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ================= WhatsApp =================
const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WA_MSG)}`;
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waUrl;
  a.target = "_blank";
  a.rel = "noopener";
});
document.getElementById("year").textContent = new Date().getFullYear();

// ================= Nav: some ao descer, volta ao subir =================
const nav = document.getElementById("nav");
const burger = document.getElementById("burger");
const waFloat = document.querySelector(".wa-float");
let lastY = scrollY;
addEventListener("scroll", () => {
  const y = scrollY;
  nav.classList.toggle("is-solid", y > 20);
  if (!nav.classList.contains("is-open")) nav.classList.toggle("is-hidden", y > lastY && y > 400);
  waFloat.classList.toggle("is-in", y > innerHeight * 0.6);
  lastY = y;
}, { passive: true });

burger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", open);
});
document.querySelectorAll("#menu a").forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  burger.setAttribute("aria-expanded", "false");
}));

// ================= Entrada do hero (< 800ms) =================
const enter = [...document.querySelectorAll("[data-enter]")];
enter.forEach((el, i) => el.style.setProperty("--d", `${100 + i * 120}ms`));
setTimeout(() => {
  enter.forEach((el) => el.classList.add("is-in"));
  document.getElementById("heroMedia").classList.add("is-in");
}, 40);

// ================= Parallax leve (2 camadas no máximo por tela) =================
const parEls = [
  { el: document.querySelector(".hero__frame img"), box: document.querySelector(".hero__frame"), amt: 40 },
  ...[...document.querySelectorAll("[data-par]")].map((el) => ({ el, box: el.parentElement, amt: 70 * +el.dataset.par })),
];
let parTick = false;
function parallax() {
  parTick = false;
  const vh = innerHeight;
  parEls.forEach(({ el, box, amt }) => {
    const r = box.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 em volta do centro da tela
    el.style.setProperty("--py", `${(-p * amt).toFixed(1)}px`);
  });
}
if (!reduce) {
  addEventListener("scroll", () => { if (!parTick) { parTick = true; requestAnimationFrame(parallax); } }, { passive: true });
  parallax();
}

// ================= Trena =================
// Fita desenrola com mola ao abrir a página e recolhe conforme rola.
const tape = document.getElementById("tape");
const strip = document.getElementById("tapeStrip");
const marks = document.getElementById("tapeMarks");

function drawMarks() {
  // números a cada 100px, contando a partir do gancho (direita), como numa trena de verdade
  const w = marks.offsetWidth;
  let html = "";
  for (let n = 1; n * 100 < w - 12; n++) {
    html += `<span class="tape__num${n % 10 === 0 ? " is-red" : ""}" style="right:${n * 100}px">${n}</span>`;
  }
  marks.innerHTML = html;
}
drawMarks();
let rw;
addEventListener("resize", () => { clearTimeout(rw); rw = setTimeout(drawMarks, 150); });

if (reduce) {
  tape.style.setProperty("--ext", 1);
} else {
  let x = 0, v = 0, target = 0, running = false;
  const heroH = () => document.querySelector(".hero").offsetHeight;
  const scrollTarget = () => 1 - Math.min(scrollY / (heroH() * 0.9), 1) * 0.88;
  const step = () => {
    // mola: rígida o bastante para "estalar" no fim, com um quique pequeno
    v += (target - x) * 0.09;
    v *= 0.78;
    x += v;
    tape.style.setProperty("--ext", Math.max(0, Math.min(1.02, x)).toFixed(4));
    if (Math.abs(target - x) > 0.0005 || Math.abs(v) > 0.0005) requestAnimationFrame(step);
    else running = false;
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(step); } };
  setTimeout(() => { target = scrollTarget(); kick(); }, 450);
  addEventListener("scroll", () => { target = scrollTarget(); kick(); }, { passive: true });
}

// ================= Folha que desenrola (Serviços) =================
// Quando a seção entra na tela, o rolo de planta corre da esquerda para a direita
// de uma vez só, revelando a folha. O rolo afina conforme o papel sai dele.
const sheet = document.getElementById("sheet");
const roll = document.getElementById("roll");
if (reduce) {
  sheet.style.clipPath = "none";
  roll.remove();
} else {
  const DUR = 1700;
  const ease = (t) => 1 - Math.pow(1 - t, 3.2); // começa rápido, assenta devagar
  const play = () => {
    const W = sheet.offsetWidth;
    const t0 = performance.now();
    sheet.querySelectorAll("[data-reveal]").forEach((el, i) => {
      el.style.setProperty("--d", `${120 + Math.min(i, 6) * 90}ms`);
      el.classList.add("is-in");
    });
    const frame = (now) => {
      const p = ease(Math.min((now - t0) / DUR, 1));
      // o rolo entra de fora da tela (esquerda) e sai pela direita
      const d = roll.offsetWidth;
      const x = (W + d * 2.3) * p;
      const edge = Math.max(0, Math.min(W, x - d * 0.65)); // centro do rolo
      sheet.style.clipPath = `inset(0 ${(W - edge).toFixed(1)}px 0 0)`;
      roll.style.setProperty("--x", `${x.toFixed(1)}px`);
      roll.style.setProperty("--k", Math.max(0.35, Math.sqrt(1 - edge / W)).toFixed(3));
      roll.style.setProperty("--tex", `${(x * 1.6).toFixed(1)}px`);
      if (p < 1) requestAnimationFrame(frame);
      else { roll.classList.add("is-done"); sheet.style.clipPath = "none"; }
    };
    requestAnimationFrame(frame);
  };
  const sheetObs = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting && e.intersectionRect.height > innerHeight * 0.3)) { sheetObs.disconnect(); play(); }
  }, { threshold: [0, 0.1, 0.2, 0.3, 0.4] });
  // observa a seção (o recorte da folha faria o observador achar que ela está invisível)
  sheetObs.observe(sheet.parentElement);
}

// ================= Sopro de serragem (seção "Na prática") =================
// A frente da revelação corre da esquerda para a direita e uma nuvem de serragem
// é soprada junto, espalhando e assentando no fim.
const proof = document.getElementById("proof");
const proofIn = document.getElementById("proofIn");
const dustCv = document.getElementById("sawdust");
if (reduce) {
  proofIn.classList.add("is-open");
} else {
  const ctx = dustCv.getContext("2d");
  const COLORS = ["#F3DDBB", "#E8C9A0", "#D9B07E", "#C99A66", "#FBEBD3"];
  const DUR = 1500;
  let W = 0, H = 0, parts = [];

  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = proof.offsetWidth; H = proof.offsetHeight;
    dustCv.width = W * dpr; dustCv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = (x, n, burst) => {
    for (let i = 0; i < n; i++) {
      const y = H * (0.08 + Math.random() * 0.84);
      parts.push({
        x: x + (Math.random() - 0.5) * (burst ? 40 : 90),
        y,
        vx: (burst ? 9 : 5) + Math.random() * 9,
        vy: (Math.random() - 0.5) * 2.4,
        w: 1 + Math.random() * 3.4,
        h: 0.8 + Math.random() * 1.8,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 0,
        max: 650 + Math.random() * 900,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        ph: Math.random() * 6.28,
        haze: Math.random() < (burst ? 0.22 : 0.14) ? 10 + Math.random() * 28 : 0, // nuvem de pó fino
      });
    }
  };
  const ease = (t) => 1 - Math.pow(1 - t, 2.6);

  const play = () => {
    size();
    proofIn.querySelectorAll("[data-reveal]").forEach((el, i) => {
      el.style.setProperty("--d", `${80 + i * 70}ms`);
      el.classList.add("is-in");
    });
    spawn(-20, 190, true); // o sopro inicial
    const t0 = performance.now();
    let last = t0;
    const frame = (now) => {
      const dt = Math.min(now - last, 40); last = now;
      const t = Math.min((now - t0) / DUR, 1);
      const p = ease(t);
      const front = p * (W + W * 0.12);
      proofIn.style.setProperty("--m", `${(p * 112 - 12).toFixed(2)}%`);
      if (t < 1) spawn(front, 22, false);

      ctx.clearRect(0, 0, W, H);
      parts = parts.filter((q) => (q.life += dt) < q.max && q.x < W + 40);
      for (const q of parts) {
        const k = dt / 16.7;
        q.vx *= Math.pow(0.965, k);                 // o ar freia a serragem
        q.vy += Math.sin(q.ph + q.life * 0.008) * 0.06 * k + 0.012 * k; // turbulência + assenta
        q.x += q.vx * k; q.y += q.vy * k; q.r += q.vr * k;
        const a = 1 - q.life / q.max;
        if (q.haze) {
          const rad = q.haze * (1 + q.life / q.max); // a nuvem se espalha
          const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rad);
          g.addColorStop(0, "rgba(232, 201, 160, .16)");
          g.addColorStop(1, "rgba(232, 201, 160, 0)");
          ctx.globalAlpha = Math.max(0, a);
          ctx.fillStyle = g;
          ctx.fillRect(q.x - rad, q.y - rad, rad * 2, rad * 2);
          continue;
        }
        ctx.globalAlpha = Math.max(0, a * a) * 0.9;
        ctx.fillStyle = q.c;
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.r);
        ctx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (t >= 1) proofIn.classList.add("is-open");
      if (t < 1 || parts.length) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    };
    requestAnimationFrame(frame);
  };
  const proofObs = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting && e.intersectionRect.height > innerHeight * 0.35)) { proofObs.disconnect(); play(); }
  }, { threshold: [0, 0.15, 0.3, 0.45, 0.6] });
  proofObs.observe(proof);
}

// ================= Martelo no fechamento =================
const finalSec = document.getElementById("contato");
const hammerObs = new IntersectionObserver((entries) => {
  if (entries.some((e) => e.isIntersecting)) { hammerObs.disconnect(); finalSec.classList.add("is-play"); }
}, { threshold: 0.55 });
hammerObs.observe(finalSec);

// ================= Revelação no scroll =================
// Cascata só entre irmãos que entram juntos, no máximo 6 passos.
const reveal = new IntersectionObserver((entries) => {
  const batch = entries.filter((e) => e.isIntersecting);
  batch.forEach((e, i) => {
    e.target.style.setProperty("--d", `${Math.min(i, 5) * 90}ms`);
    e.target.classList.add("is-in");
    reveal.unobserve(e.target);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

// ================= Galeria =================
const grid = document.getElementById("grid");
grid.innerHTML = PHOTOS.map(([cat, file, shape], i) => `
  <figure class="tile${shape ? ` tile--${shape}` : ""}" data-cat="${cat}" tabindex="0" role="button" aria-label="Ampliar foto: ${LABEL[cat]}">
    <img src="assets/img/${file}.jpg" alt="${LABEL[cat]} planejado por Paulo Lourenço" loading="${i < 6 ? "eager" : "lazy"}" />
    <figcaption class="mono">Nº ${String(i + 1).padStart(2, "0")} · ${LABEL[cat]}</figcaption>
  </figure>`).join("");

document.querySelectorAll("[data-total]").forEach((s) => {
  const k = s.dataset.total;
  s.textContent = String(k === "all" ? PHOTOS.length : PHOTOS.filter((p) => p[0] === k).length).padStart(2, "0");
});

const tiles = [...grid.children];
const tileObs = new IntersectionObserver((entries) => {
  entries.filter((e) => e.isIntersecting).forEach((e, i) => {
    e.target.style.setProperty("--d", `${Math.min(i, 5) * 70}ms`);
    e.target.classList.add("is-in");
    tileObs.unobserve(e.target);
  });
}, { threshold: 0.1 });
tiles.forEach((t) => tileObs.observe(t));

function applyFilter(f) {
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-on", c.dataset.filter === f));
  let shown = 0;
  tiles.forEach((t) => {
    const out = f !== "all" && t.dataset.cat !== f;
    t.classList.toggle("is-out", out);
    if (!out) {
      // no filtro, a primeira foto visível vira o destaque
      t.classList.toggle("tile--hero", shown === 0);
      t.classList.remove("is-in");
      t.style.setProperty("--d", `${Math.min(shown, 5) * 60}ms`);
      requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("is-in")));
      shown++;
    }
  });
}
document.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => applyFilter(c.dataset.filter)));

// Clicar num serviço filtra a galeria
document.querySelectorAll("[data-go]").forEach((a) => a.addEventListener("click", () => applyFilter(a.dataset.go)));

// ================= Prévia que segue o mouse no índice =================
const preview = document.getElementById("preview");
const previewImg = preview.querySelector("img");
if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) {
  let x = 0, y = 0, cx = 0, cy = 0, raf = null;
  const loop = () => {
    cx += (x - cx) * 0.16;
    cy += (y - cy) * 0.16;
    preview.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    raf = requestAnimationFrame(loop);
  };
  document.querySelectorAll("#index a").forEach((a) => {
    a.addEventListener("mouseenter", (e) => {
      previewImg.src = a.dataset.img;
      if (!raf) { cx = x = e.clientX + 160; cy = y = e.clientY; loop(); }
      preview.classList.add("is-on");
    });
    a.addEventListener("mousemove", (e) => { x = e.clientX + 160; y = e.clientY; });
  });
  document.getElementById("index").addEventListener("mouseleave", () => {
    preview.classList.remove("is-on");
    setTimeout(() => { if (!preview.classList.contains("is-on")) { cancelAnimationFrame(raf); raf = null; } }, 400);
  });
}

// ================= Lightbox =================
const lb = document.getElementById("lightbox");
const lbImg = lb.querySelector("img");
const lbCap = lb.querySelector("figcaption");
let cur = 0;
const visible = () => tiles.filter((t) => !t.classList.contains("is-out"));
function show(i) {
  const list = visible();
  cur = (i + list.length) % list.length;
  const t = list[cur];
  lbImg.src = t.querySelector("img").src;
  lbImg.alt = t.querySelector("img").alt;
  lbCap.textContent = `${t.querySelector("figcaption").textContent} · ${cur + 1} de ${list.length}`;
}
function openLb(tile) {
  show(visible().indexOf(tile));
  lb.hidden = false;
  requestAnimationFrame(() => lb.classList.add("is-open"));
  document.body.style.overflow = "hidden";
  lb.querySelector(".lb-close").focus();
}
function closeLb() {
  lb.classList.remove("is-open");
  document.body.style.overflow = "";
  setTimeout(() => { lb.hidden = true; }, 350);
}
grid.addEventListener("click", (e) => { const t = e.target.closest(".tile"); if (t) openLb(t); });
grid.addEventListener("keydown", (e) => {
  const t = e.target.closest(".tile");
  if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openLb(t); }
});
lb.querySelector(".lb-close").addEventListener("click", closeLb);
lb.querySelector(".lb-prev").addEventListener("click", () => show(cur - 1));
lb.querySelector(".lb-next").addEventListener("click", () => show(cur + 1));
lb.addEventListener("click", (e) => { if (e.target === lb || e.target.tagName === "FIGURE") closeLb(); });
addEventListener("keydown", (e) => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") show(cur - 1);
  if (e.key === "ArrowRight") show(cur + 1);
});
// arrastar no celular
let touchX = null;
lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  touchX = null;
});

// ================= Vídeos tocam quando aparecem =================
const vObs = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting && !reduce) { target.preload = "auto"; target.play().catch(() => {}); }
    else target.pause();
  });
}, { threshold: 0.35 });
document.querySelectorAll(".clip video").forEach((v) => vObs.observe(v));

// ================= Contadores =================
const fmt = (n) => Math.round(n).toLocaleString("pt-BR");
const countObs = new IntersectionObserver((entries) => {
  entries.filter((e) => e.isIntersecting).forEach(({ target: el }) => {
    countObs.unobserve(el);
    const to = +el.dataset.count;
    if (reduce) { el.textContent = fmt(to); return; }
    const dur = 1600, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = fmt(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach((el) => countObs.observe(el));
