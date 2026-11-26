/* coastl — Seitenlogik
   1. Sprache (DE/EN)   2. Mobilmenü   3. E-Mail kopieren
   4. Anfrageformular (Versand über Web3Forms, sonst E-Mail-Programm)                  */

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

    const field = (fd, name) => (fd.get(name) || "").toString().trim();
    const say = (de, en) => { status.textContent = L() === "de" ? de : en; };

    function compose() {
      const fd = new FormData(form);
      const de = L() === "de";
      const name = field(fd, "name");
      const email = field(fd, "email");
      const org = field(fd, "org");
      const when = field(fd, "when");
      const msg = field(fd, "message");

      const subject = field(fd, "subject") ||
        (de ? "Anfrage" : "Inquiry") + (name ? " – " + name : "");

      const lines = [msg, "", "—"];
      if (name) lines.push("Name: " + name);
      if (email) lines.push("E-Mail: " + email);
      if (org) lines.push((de ? "Unternehmen/Projekt: " : "Company/project: ") + org);
      if (when) lines.push((de ? "Zeitrahmen: " : "Timeframe: ") + when);
      return { subject, body: lines.join("\n"), name, email, org, when, msg };
    }

    async function send(key) {
      const m = compose();
      const data = {
        access_key: key,
        subject: "coastl.de: " + m.subject,
        email: m.email,
        name: m.name,
        message: m.msg,
        "Unternehmen/Projekt": m.org,
        "Zeitrahmen": m.when,
        "Sprache": L(),
        botcheck: form.querySelector("input[name=botcheck]").checked
      };
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), 20000);
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
          signal: abort.signal
        });
        const out = await res.json();
        return res.ok && out.success === true;
      } catch (e) {
        return false;
      } finally {
        clearTimeout(timer);
      }
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const key = form.dataset.key;
      const msgEl = form.querySelector("textarea[name=message]");
      const mailEl = form.querySelector("input[name=email]");
      if (key && (!mailEl.value.trim() || !mailEl.checkValidity())) {
        mailEl.focus();
        say("Bitte geben Sie eine gültige E-Mail-Adresse an, damit ich antworten kann.", "Please enter a valid email address so I can reply.");
        return;
      }
      if (!msgEl.value.trim()) {
        msgEl.focus();
        say("Bitte beschreiben Sie kurz Ihr Vorhaben.", "Please describe your project briefly.");
        return;
      }

      if (!key) {   // ohne Schlüssel: E-Mail-Programm öffnen
        const { subject, body } = compose();
        window.location.href = "mailto:" + EMAIL +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
        say("Ihr E-Mail-Programm sollte sich jetzt mit der fertigen Nachricht öffnen. Falls nicht, kopieren Sie den Text über „Text kopieren“.",
            "Your email app should now open with the prepared message. If it doesn’t, use “Copy text”.");
        return;
      }

      const button = form.querySelector("button[type=submit]");
      button.disabled = true;
      say("Wird gesendet …", "Sending …");
      const ok = await send(key);
      button.disabled = false;
      if (ok) {
        form.reset();
        say("Danke, Ihre Nachricht ist angekommen. Ich melde mich bei Ihnen.", "Thank you, your message has been sent. I will get back to you.");
      } else {
        say("Das Senden hat nicht geklappt. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es erneut oder schreiben Sie an " + EMAIL + ".",
            "Sending failed. Your input is still here. Please try again or write to " + EMAIL + ".");
      }
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
