const page = document.body.dataset.page;
const preloader = document.getElementById("preloader");
const chooser = document.getElementById("chooser");
const supportedLangs = new Set(["ru", "en"]);
let savedLang = null;
try {
  savedLang = localStorage.getItem("cm-lang");
} catch {
  // Storage can be unavailable in private or restricted browser contexts.
}
const browserLang = (navigator.language || "en").toLowerCase().startsWith("ru") ? "ru" : "en";
let lang = supportedLangs.has(savedLang) ? savedLang : browserLang;
if (page !== "404") document.body.classList.add("lock");

function applyLang(l) {
  lang = supportedLangs.has(l) ? l : browserLang;
  try {
    localStorage.setItem("cm-lang", lang);
  } catch {
    // Language switching still works when persistent storage is blocked.
  }
  const dict = I18N[lang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const v = dict[el.dataset.i18n];
    if (typeof v === "string") el.textContent = v;
  });
  const t = dict["title." + page];
  if (t) document.title = t;
  document.documentElement.lang = lang;
  document.querySelectorAll("#langSwitch button").forEach(b => b.classList.toggle("on", b.dataset.setlang === lang));
}
applyLang(lang);

const langSwitch = document.getElementById("langSwitch");
if (langSwitch) langSwitch.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b || b.dataset.setlang === lang) return;
  document.body.classList.add("swap");
  setTimeout(() => {
    applyLang(b.dataset.setlang);
    document.body.classList.remove("swap");
  }, 190);
});

document.addEventListener("click", e => {
  const a = e.target.closest("a");
  if (!a || a.target === "_blank") return;
  const href = a.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("http")) return;
  if (a.hostname !== location.hostname) return;
  e.preventDefault();
  document.body.classList.add("leave");
  setTimeout(() => {
    location.href = href;
  }, 170);
});

if (page === "404") {
  document.body.classList.remove("lock");
  document.body.classList.add("ready");
} else if (page !== "home") {
  document.body.classList.remove("lock");
  document.body.classList.add("ready");
} else {
  const minDelay = new Promise(r => setTimeout(r, 900));
  const assetLoad = new Promise(r => {
    const i = new Image();
    i.onload = i.onerror = r;
    i.src = "images/logo_1024x1024.webp";
  });
  const winLoad = new Promise(resolve => {
    if (document.readyState === "complete") {
      resolve();
      return;
    }
    window.addEventListener("load", resolve, { once: true });
    setTimeout(resolve, 5000);
  });
  Promise.all([minDelay, assetLoad, winLoad]).then(() => {
    if (preloader) preloader.classList.add("off");
    if (!supportedLangs.has(savedLang) && page === "home" && chooser) {
      setTimeout(() => chooser.classList.add("on"), 480);
    } else {
      document.body.classList.remove("lock");
      document.body.classList.add("ready");
    }
  });
  if (chooser) {
    chooser.addEventListener("click", e => {
      const b = e.target.closest(".lang-btn");
      if (!b) return;
      chooser.classList.remove("on");
      setTimeout(() => {
        applyLang(b.dataset.lang);
        document.body.classList.remove("lock");
        document.body.classList.add("ready");
      }, 460);
    });
  }
}
