
//
// ==========================
// PROJECT SECTION (SAFE)
// ==========================
//

const container = document.getElementById("project-list");

if (container) {
  const projects = [
    {
      title: "Hydrofoil Moth Design",
      desc: "VLM Analyse und Lift/Drag Optimierung"
    },
    {
      title: "Human Powered Aircraft Propeller",
      desc: "JavaProp basierte Effizienzoptimierung"
    },
    {
      title: "OpenFOAM CFD Study",
      desc: "Strömungsanalyse und Konvergenzstudien"
    }
  ];

  projects.forEach(p => {
    const div = document.createElement("div");
    div.className = "project";

    div.innerHTML = `
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
    `;

    container.appendChild(div);
  });
}

//
// ==========================
// FLOW CANVAS (SAFE)
// ==========================
//

const canvas = document.getElementById("flow");

if (canvas) {
  const ctx = canvas.getContext("2d");

  let w, h;
  const airfoil = {
    x: 0,
    y: 0,
    size: 180,
    coords: [
      { x: 1.0000, y: 0.0000 }, { x: 0.9500, y: 0.0086 }, { x: 0.9000, y: 0.0138 },
      { x: 0.8000, y: 0.0242 }, { x: 0.7000, y: 0.0340 }, { x: 0.6000, y: 0.0418 },
      { x: 0.5000, y: 0.0480 }, { x: 0.4000, y: 0.0520 }, { x: 0.3000, y: 0.0528 },
      { x: 0.2000, y: 0.0508 }, { x: 0.1500, y: 0.0472 }, { x: 0.1000, y: 0.0392 },
      { x: 0.0750, y: 0.0352 }, { x: 0.0500, y: 0.0292 }, { x: 0.0250, y: 0.0210 },
      { x: 0.0125, y: 0.0154 }, { x: 0.0000, y: 0.0000 }, { x: 0.0125, y: -0.0152 },
      { x: 0.0250, y: -0.0200 }, { x: 0.0500, y: -0.0280 }, { x: 0.0750, y: -0.0348 },
      { x: 0.1000, y: -0.0386 }, { x: 0.1500, y: -0.0440 }, { x: 0.2000, y: -0.0480 },
      { x: 0.3000, y: -0.0518 }, { x: 0.4000, y: -0.0500 }, { x: 0.5000, y: -0.0470 },
      { x: 0.6000, y: -0.0418 }, { x: 0.7000, y: -0.0340 }, { x: 0.8000, y: -0.0246 },
      { x: 0.9000, y: -0.0134 }, { x: 0.9500, y: -0.0080 }, { x: 1.0000, y: 0.0000 }
    ],
    scaled: []
  };

  function updateAirfoilPath() {
    const scaleX = airfoil.size * 0.96;
    const scaleY = airfoil.size * 1.3;
    airfoil.scaled = airfoil.coords.map((point) => ({
      x: airfoil.x + (point.x - 0.5) * scaleX,
      y: airfoil.y - point.y * scaleY
    }));
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    airfoil.x = w * 0.45;
    airfoil.y = h * 0.5;
    airfoil.size = Math.min(300, w * 0.4, h * 0.45);
    updateAirfoilPath();
    draw();
  }

  window.addEventListener("resize", resize);
  resize();

  function drawAirfoil() {
    ctx.save();
    ctx.beginPath();
    airfoil.scaled.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 1)";
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  function streamlineOffset(baseY, x) {
    const centerX = airfoil.x;
    const width = airfoil.size * 0.9;
    const dx = x - centerX;
    if (dx < -width || dx > width * 1.1) return 0;
    const t = (dx + width) / (width * 2.1);
    const sign = baseY < airfoil.y ? -1 : 1;
    const magnitude = (1 - Math.min(Math.abs(baseY - airfoil.y) / (h * 0.28), 1)) * 18;
    return Math.sin(Math.PI * t) * magnitude * sign * 0.85;
  }

  function drawStreamline(baseY, alpha) {
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const x = -40 + (w + 80) * (i / 80);
      const y = baseY + streamlineOffset(baseY, x);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  function draw() {
    ctx.fillStyle = "rgba(15, 23, 42, 1)";
    ctx.fillRect(0, 0, w, h);

    [h * 0.17, h * 0.27, h * 0.37, h * 0.47, h * 0.57, h * 0.67, h * 0.77].forEach((y, index) => {
      drawStreamline(y, 0.22 - index * 0.02);
    });

    drawAirfoil();
  }

  draw();
}

const i18n = {
  de: {
    "title-home": "Leistungen",
    "title-references": "Referenzen",
    "title-contact": "Kontakt",
    "title-imprint": "Impressum",
    "title-privacy": "Datenschutz",
    "nav-services": "Leistungen",
    "nav-references": "Referenzen",
    "nav-contact": "Kontakt",
    "nav-imprint": "Impressum",
    "footer-privacy": "Datenschutz",
    "footer-imprint": "Impressum",
    "hero-eyebrow": "INNOVATIVE SYSTEME",
    "hero-heading": "Entwicklung effizienter Strömungs- und Leichtbausysteme",
    "hero-text": "Arbeitsschwerpunkt ist die Entwicklung und Optimierung technischer Systeme im Bereich Aerodynamik, Hydrodynamik und Leichtbau. Im Fokus stehen effiziente Geometrien, belastbare Auslegungen und eine durchgängige Verbindung von Simulation, Konstruktion und Fertigung.",
    "hero-primary": "Referenzen ansehen",
    "hero-secondary": "Kontakt aufnehmen",
    "feature1-heading": "Composite-Fertigung und Leichtbau",
    "feature1-text": "Erfahrung in der Herstellung faserverstärkter Strukturen für hochbelastete, gewichtssensitive Anwendungen. Der Schwerpunkt liegt auf funktionsintegrierten Leichtbaulösungen, die aerodynamische oder strukturelle Anforderungen direkt in die Geometrie übersetzen. Dabei werden sowohl manuelle Fertigungsverfahren als auch prozessnahe Designentscheidungen berücksichtigt.",
    "feature2-heading": "Hydrofoil- und Strömungssysteme",
    "feature2-text": "Entwurf und Optimierung von Hydrofoils und anderen strömungsmechanischen Komponenten für maritime Anwendungen. Ziel ist eine hohe hydrodynamische Effizienz bei gleichzeitig stabilen Betriebseigenschaften über den relevanten Geschwindigkeitsbereich. Die Auslegung erfolgt auf Basis numerischer Simulationen und parametrischer Geometriemodelle.",
    "feature3-heading": "Systemoptimierung und Reverse Engineering",
    "feature3-text": "Analyse bestehender Bauteile und Systeme mittels 3D-Scan-Technologie. Aus den erfassten Geometriedaten werden Abweichungen, Optimierungspotenziale und konstruktive Schwachstellen identifiziert. Dieser Ansatz wird sowohl für die Weiterentwicklung bestehender Designs als auch für die Reproduktion und Verbesserung von Komponenten genutzt.",
    "feature4-heading": "Numerische Simulation und parametrische Optimierung",
    "feature4-text": "Einsatz von CFD-Methoden und automatisierten Optimierungsverfahren zur Verbesserung aerodynamischer und hydrodynamischer Systeme. Kombination aus schnellen Modellansätzen und hochauflösenden Simulationen ermöglicht eine effiziente Exploration des Designraums und eine gezielte Performance-Optimierung.",
    "feature5-heading": "Anwendungen",
    "feature5-text": "Die beschriebenen Methoden werden in unterschiedlichen technischen Bereichen eingesetzt, darunter Leichtbaukomponenten, Propulsionssysteme, Hydrofoils sowie experimentelle Flug- und Strömungssysteme. Ziel ist stets die Entwicklung funktionaler, effizienter und fertigungsgerechter Lösungen.",
    "references-heading": "Referenzen",
    "references-project-title": "Human Powered Aircraft Propeller",
    "references-project-text-1": "Für das Human-Powered-Aircraft-Projekt Odonata wurde ein hocheffizienter Propeller mit einem Durchmesser von 3,5 m und einem Gewicht von 800 g entwickelt. Ziel des Projekts ist es, den aktuellen Langstrecken-Weltrekord für muskelkraftbetriebene Luftfahrzeuge zu brechen. Weitere Informationen zum Projekt sind unter <a href=\"https://hpa-odonata.de/\" target=\"_blank\" rel=\"noopener\">https://hpa-odonata.de/</a> verfügbar.",
    "references-project-text-2": "Die Propellerentwicklung basiert auf einem parametrischen Geometriemodell, das eine systematische Variation der Entwurfsparameter ermöglicht. Die Auslegung und Optimierung erfolgten iterativ mithilfe von JavaProp, CAESES und STAR-CCM+. Dabei wurde JavaProp für schnelle Performanceabschätzungen eingesetzt, CAESES zur Parametrisierung und Optimierung der Geometrie sowie STAR-CCM+ für hochauflösende CFD-Simulationen auf Basis der URANS-Gleichungen.",
    "references-project-text-3": "Im Fokus der Auslegung stehen ein hoher aerodynamischer Wirkungsgrad im relevanten Betriebsbereich, eine robuste Performance über den gesamten Flugzustand sowie die strukturelle Umsetzung bei minimalem Gewicht.",
    "references-project-text-4": "Der Propeller ist ein zentraler Bestandteil des Gesamtsystems und trägt wesentlich zur Gesamtleistung des Odonata-Flugzeugs bei.",
    "references-card-title": "Moth Hydrofoil Design",
    "references-card-text": "Hier steht ein Entwurfstext für das Hydrofoil-Design. Das Projekt fokussiert sich auf leichte, strukturstabile Flügel und optimierte hydrodynamische Eigenschaften.",
    "references-placeholder-title": "3D-Modell kommt hier später",
    "references-placeholder-text": "Hier wird zukünftig ein weiteres interaktives Modell für das Moth Hydrofoil Design platziert.",
    "contact-heading": "Kontakt",
    "contact-email-placeholder": "Deine E-Mail",
    "contact-message-placeholder": "Deine Nachricht",
    "contact-submit": "Senden",
    "contact-or": "oder direkt:",
    "imprint-heading": "Impressum",
    "imprint-responsible": "<strong>Verantwortlich für den Inhalt:</strong>",
    "imprint-name-label": "Name:",
    "imprint-email-label": "E-Mail:",
    "imprint-description": "Diese Website dient der Darstellung von Ingenieurprojekten.",
    "privacy-heading": "Datenschutz",
    "privacy-intro": "Diese Website verarbeitet personenbezogene Daten nur in dem Umfang, der zur Nutzung der Website und zur Kontaktaufnahme erforderlich ist.",
    "privacy-responsible-heading": "Verantwortlicher",
    "privacy-responsible-name": "Winny Hohensee",
    "privacy-responsible-email": "E-Mail: <a href=\"mailto:hohensee@coastl.de\">hohensee@coastl.de</a>",
    "privacy-general-heading": "Allgemeine Hinweise",
    "privacy-general-text": "Die Nutzung dieser Website ist grundsätzlich ohne Angabe personenbezogener Daten möglich. Soweit auf dieser Website personenbezogene Daten, wie Name, E-Mail-Adresse oder Nachrichtentext, erhoben werden, erfolgt dies stets auf freiwilliger Basis.",
    "privacy-server-heading": "Server-Log-Dateien",
    "privacy-server-text": "Der Provider der Website erhebt und speichert automatisch Informationen in Server-Log-Dateien, die Ihr Browser an uns übermittelt. Dazu gehören beispielsweise Browsertyp, Zugriffszeit, IP-Adresse und Referrer-URL. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.",
    "privacy-form-heading": "Kontaktformular",
    "privacy-form-text": "Wenn Sie das Kontaktformular nutzen, werden die von Ihnen eingegebenen Daten (E-Mail-Adresse und Nachricht) an Formspree zur Übermittlung an den Websitebetreiber übertragen. Diese Daten werden verwendet, um Ihre Anfrage zu beantworten. Formspree handelt dabei als externer Dienstleister und kann die Daten gemäß seiner Datenschutzerklärung verarbeiten.",
    "privacy-external-heading": "Externe Links",
    "privacy-external-text": "Im Footer befindet sich ein Link zu LinkedIn. Es sind keine LinkedIn-Plugins eingebettet; beim Klick auf den Link werden lediglich die LinkedIn-Seite in einem neuen Fenster geöffnet.",
    "privacy-cookies-heading": "Cookies und Tracking",
    "privacy-cookies-text": "Auf dieser Website werden keine Tracking-Dienste oder Analysewerkzeuge wie Google Analytics verwendet. Es werden keine Cookies für Auswertung oder Werbung gesetzt. Browserinterne Sitzungsdaten können jedoch technisch notwendig eingesetzt werden.",
    "privacy-rights-heading": "Ihre Rechte",
    "privacy-rights-text": "Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie das Recht, der Verarbeitung Ihrer personenbezogenen Daten zu widersprechen. Zur Ausübung dieser Rechte können Sie die oben genannten Kontaktdaten verwenden.",
    "privacy-changes-heading": "Änderungen dieser Datenschutzerklärung",
    "privacy-changes-text": "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen umzusetzen."
  },
  en: {
    "title-home": "Services",
    "title-references": "References",
    "title-contact": "Contact",
    "title-imprint": "Imprint",
    "title-privacy": "Privacy",
    "nav-services": "Services",
    "nav-references": "References",
    "nav-contact": "Contact",
    "nav-imprint": "Imprint",
    "footer-privacy": "Privacy",
    "footer-imprint": "Imprint",
    "hero-eyebrow": "INNOVATIVE SYSTEMS",
    "hero-heading": "Development of efficient flow and lightweight systems",
    "hero-text": "The focus is on developing and optimizing technical systems in aerodynamics, hydrodynamics and lightweight construction. The emphasis is on efficient geometries, robust designs and an integrated connection between simulation, engineering and manufacturing.",
    "hero-primary": "View references",
    "hero-secondary": "Contact us",
    "feature1-heading": "Composite manufacturing and lightweight design",
    "feature1-text": "Experience in manufacturing fiber-reinforced structures for highly stressed, weight-sensitive applications. The focus is on function-integrated lightweight solutions that translate aerodynamic or structural requirements directly into the geometry. Both manual manufacturing processes and design decisions close to manufacturing are taken into account.",
    "feature2-heading": "Hydrofoil and flow systems",
    "feature2-text": "Design and optimization of hydrofoils and other fluid mechanical components for maritime applications. The goal is high hydrodynamic efficiency while maintaining stable operating characteristics across the relevant speed range. Design is based on numerical simulations and parametric geometry models.",
    "feature3-heading": "System optimization and reverse engineering",
    "feature3-text": "Analysis of existing components and systems using 3D scanning technology. From the captured geometry data, deviations, optimization potentials and structural weak points are identified. This approach is used both for further development of existing designs and for reproduction and improvement of components.",
    "feature4-heading": "Numerical simulation and parametric optimization",
    "feature4-text": "Use of CFD methods and automated optimization procedures to improve aerodynamic and hydrodynamic systems. Combining fast model approaches with high-resolution simulations enables efficient exploration of the design space and targeted performance optimization.",
    "feature5-heading": "Applications",
    "feature5-text": "The methods described are used in different technical areas, including lightweight components, propulsion systems, hydrofoils and experimental flight and flow systems. The aim is always to develop functional, efficient and manufacturable solutions.",
    "references-heading": "References",
    "references-project-title": "Human Powered Aircraft Propeller",
    "references-project-text-1": "For the human-powered aircraft project Odonata, a highly efficient propeller with a diameter of 3.5 m and a weight of 800 g was developed. The project's goal is to break the current long-distance world record for muscle-powered aircraft. More information about the project is available at <a href=\"https://hpa-odonata.de/\" target=\"_blank\" rel=\"noopener\">https://hpa-odonata.de/</a>.",
    "references-project-text-2": "Propeller development is based on a parametric geometry model that allows systematic variation of design parameters. Design and optimization were carried out iteratively using JavaProp, CAESES and STAR-CCM+. JavaProp was used for fast performance estimates, CAESES for parameterization and geometry optimization, and STAR-CCM+ for high-resolution CFD simulations based on the URANS equations.",
    "references-project-text-3": "The focus of the design is on high aerodynamic efficiency in the relevant operating range, robust performance across the entire flight envelope, and structural implementation with minimal weight.",
    "references-project-text-4": "The propeller is a central component of the overall system and makes a significant contribution to the overall performance of the Odonata aircraft.",
    "references-card-title": "Moth Hydrofoil Design",
    "references-card-text": "This section describes the hydrofoil design concept. The project focuses on lightweight, structurally stable wings and optimized hydrodynamic performance.",
    "references-placeholder-title": "3D model coming soon",
    "references-placeholder-text": "An additional interactive model for the Moth Hydrofoil Design will be placed here in the future.",
    "contact-heading": "Contact",
    "contact-email-placeholder": "Your email",
    "contact-message-placeholder": "Your message",
    "contact-submit": "Send",
    "contact-or": "or directly:",
    "imprint-heading": "Imprint",
    "imprint-responsible": "<strong>Responsible for content:</strong>",
    "imprint-name-label": "Name:",
    "imprint-email-label": "Email:",
    "imprint-description": "This website is intended to showcase engineering projects.",
    "privacy-heading": "Privacy",
    "privacy-intro": "This website processes personal data only to the extent necessary for using the site and establishing contact.",
    "privacy-responsible-heading": "Data controller",
    "privacy-responsible-name": "Winny Hohensee",
    "privacy-responsible-email": "Email: <a href=\"mailto:hohensee@coastl.de\">hohensee@coastl.de</a>",
    "privacy-general-heading": "General information",
    "privacy-general-text": "Using this website is generally possible without providing personal data. If personal data such as name, email address or message text is collected on this website, this is always done on a voluntary basis.",
    "privacy-server-heading": "Server log files",
    "privacy-server-text": "The website provider automatically collects and stores information in server log files that your browser transmits to us. This includes browser type, access time, IP address and referrer URL. These data are not combined with other data sources.",
    "privacy-form-heading": "Contact form",
    "privacy-form-text": "If you use the contact form, the information you enter (email address and message) will be transmitted to Formspree to forward it to the website operator. This data is used to answer your request. Formspree acts as an external service provider and may process the data according to its privacy policy.",
    "privacy-external-heading": "External links",
    "privacy-external-text": "There is a link to LinkedIn in the footer. No LinkedIn plugins are embedded; clicking the link simply opens the LinkedIn page in a new window.",
    "privacy-cookies-heading": "Cookies and tracking",
    "privacy-cookies-text": "This website does not use tracking services or analytics tools such as Google Analytics. No cookies are set for evaluation or advertising. Browser-internal session data may still be used if technically necessary.",
    "privacy-rights-heading": "Your rights",
    "privacy-rights-text": "You have the right to information, correction, deletion, restriction of processing, data portability, and the right to object to the processing of your personal data. You can use the contact details above to exercise these rights.",
    "privacy-changes-heading": "Changes to this privacy policy",
    "privacy-changes-text": "We reserve the right to adjust this privacy policy so that it always complies with current legal requirements or to implement changes to our services."
  }
};

function translatePage(lang) {
  try {
    const locale = i18n[lang] || i18n.de;
    document.documentElement.lang = lang;

    // translate elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (!key) return;
      const value = locale[key];
      if (value === undefined) return;
      element.textContent = value;
    });

    // translate elements that should receive HTML
    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      const key = element.dataset.i18nHtml;
      if (!key) return;
      const value = locale[key];
      if (value === undefined) return;
      element.innerHTML = value;
    });

    // placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      const value = locale[key];
      if (value !== undefined) {
        element.placeholder = value;
      }
    });

    // title
    const titleElement = document.querySelector("title[data-i18n]");
    if (titleElement) {
      const titleKey = titleElement.dataset.i18n;
      const titleValue = locale[titleKey];
      if (titleValue !== undefined) {
        document.title = titleValue;
      }
    }

    // update toggle button text/aria
    const button = document.getElementById("lang-toggle");
    if (button) {
      button.textContent = lang === "de" ? "EN" : "DE";
      button.setAttribute("aria-label", lang === "de" ? "Switch to English" : "Zurück zu Deutsch");
    }

    localStorage.setItem("site-language", lang);
    console.debug('[i18n] Translated page to', lang);
  } catch (err) {
    console.error('[i18n] translatePage error:', err);
  }
}

function initLanguageSwitcher() {
  console.debug('[i18n] initLanguageSwitcher');
  const button = document.getElementById("lang-toggle");
  let lang = localStorage.getItem("site-language") || "de";
  if (!Object.keys(i18n).includes(lang)) lang = "de";
  translatePage(lang);

  // direct button binding if present
  if (button) {
    button.addEventListener("click", () => {
      lang = lang === "de" ? "en" : "de";
      translatePage(lang);
    });
  }

  // fallback: delegate clicks to document (covers dynamically inserted buttons)
  document.addEventListener('click', (ev) => {
    const target = ev.target instanceof Element ? ev.target : null;
    if (!target) return;
    const btn = target.closest('#lang-toggle');
    if (btn) {
      lang = lang === 'de' ? 'en' : 'de';
      translatePage(lang);
    }
  });
}

// Ensure language switcher initializes after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try { initLanguageSwitcher(); } catch (e) { console.error(e); }
  });
} else {
  try { initLanguageSwitcher(); } catch (e) { console.error(e); }
}
