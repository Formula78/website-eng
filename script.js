/* coastl — Seitenlogik
   1. Sprache (DE/EN)   2. Mobilmenü   3. E-Mail kopieren
   4. Anfrageformular (öffnet das eigene E-Mail-Programm)                  */

(function () {
  "use strict";

  const root = document.documentElement;
  const EMAIL = "hohensee@coastl.de";

  /* ---------- 1. Sprache ---------------------------------------------- */
  function applyLang(lang) {
    root.dataset.lang = lang;
    root.lang = lang === "en" ? "en-US" : "de";
    const t = document.querySelector("title");
    if (t) {
      if (!t.dataset.de) t.dataset.de = t.textContent;
      document.title = (lang === "en" && t.dataset.en) ? t.dataset.en : t.dataset.de;
    }
    document.querySelectorAll("[data-ph-de]").forEach((el) => {
      el.placeholder = lang === "en" ? el.dataset.phEn : el.dataset.phDe;
    });
    document.querySelectorAll("button.lang").forEach((b) => {
      b.setAttribute("aria-label", lang === "de" ? "Switch to English" : "Auf Deutsch umschalten");
    });
    document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  }
  const L = () => (root.dataset.lang === "en" ? "en" : "de");

  applyLang(L());
  // Die Sprachseiten verlinken sich gegenseitig; nur die 404-Seite schaltet per Knopf um.
  document.querySelectorAll("button.lang").forEach((b) =>
    b.addEventListener("click", () => applyLang(L() === "de" ? "en" : "de"))
  );

  /* ---------- 2. Mobilmenü ------------------------------------------- */
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.getElementById("main-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.focus();
      }
    });
  }

  /* ---------- 3. Kopieren -------------------------------------------- */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
      ta.remove();
      return ok;
    }
  }
  function flash(btn, ok) {
    const orig = btn.innerHTML;
    btn.textContent = ok ? (L() === "de" ? "kopiert" : "copied") : (L() === "de" ? "nicht möglich" : "failed");
    setTimeout(() => { btn.innerHTML = orig; }, 1600);
  }
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => flash(btn, await copyText(btn.dataset.copy || EMAIL)));
  });

  /* ---------- 4. Anfrageformular ------------------------------------- */
  const form = document.getElementById("inquiry");
  if (form) {
    const status = document.getElementById("form-status");
    let lastText = "";

    function compose() {
      const fd = new FormData(form);
      const de = L() === "de";
      const topic = (fd.get("subject") || "").toString().trim();
      const name = (fd.get("name") || "").toString().trim();
      const org = (fd.get("org") || "").toString().trim();
      const when = (fd.get("when") || "").toString();
      const msg = (fd.get("message") || "").toString().trim();

      const subject = topic ||
        (de ? "Anfrage" : "Inquiry") + (name ? " – " + name : "");

      const lines = [];
      lines.push(msg, "", "—");
      if (name) lines.push((de ? "Name: " : "Name: ") + name);
      if (org) lines.push((de ? "Unternehmen/Projekt: " : "Company/project: ") + org);
      if (when) lines.push((de ? "Zeitrahmen: " : "Timeframe: ") + when);
      return { subject, body: lines.join("\n") };
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const msgEl = form.querySelector("textarea[name=message]");
      if (!msgEl.value.trim()) {
        msgEl.focus();
        status.textContent = L() === "de" ? "Bitte beschreiben Sie kurz Ihr Vorhaben." : "Please describe your project briefly.";
        return;
      }
      const { subject, body } = compose();
      lastText = (L() === "de" ? "An: " : "To: ") + EMAIL + (L() === "de" ? "\nBetreff: " : "\nSubject: ") + subject + "\n\n" + body;
      window.location.href = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      status.textContent = L() === "de"
        ? "Ihr E-Mail-Programm sollte sich jetzt mit der fertigen Nachricht öffnen. Falls nicht, kopieren Sie den Text über „Text kopieren“."
        : "Your email app should now open with the prepared message. If it doesn’t, use “Copy text”.";
    });

    const copyAll = document.getElementById("copy-inquiry");
    if (copyAll) {
      copyAll.addEventListener("click", async () => {
        const { subject, body } = compose();
        lastText = (L() === "de" ? "An: " : "To: ") + EMAIL + (L() === "de" ? "\nBetreff: " : "\nSubject: ") + subject + "\n\n" + body;
        flash(copyAll, await copyText(lastText));
      });
    }
  }

})();
