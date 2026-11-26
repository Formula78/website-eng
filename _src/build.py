"""Erzeugt aus den zweisprachigen Quellen in _src/ die ausgelieferten Seiten.

    python _src/build.py

Deutsch liegt im Hauptordner, Englisch unter en/. Außerdem entstehen sitemap.xml
und robots.txt. Die erzeugten Dateien nicht von Hand bearbeiten.
Benötigt: beautifulsoup4
"""
import datetime
import json
import re
import time
from pathlib import Path

from bs4 import BeautifulSoup, Comment

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_src"
SITE = "https://coastl.de"
VERSION = "9"  # bei Änderungen an CSS oder Skripten erhöhen
LANGS = ("de", "en")
OG_DEFAULT = "/images/og-coastl.jpg"
LINKEDIN = "https://www.linkedin.com/in/winny-hohensee-b015a3213/"

# Dateinamen je Sprache
FILES = {
    "index": {"de": "index.html", "en": "en/index.html"},
    "referenzen": {"de": "referenzen.html", "en": "en/work.html"},
    "ueber-mich": {"de": "ueber-mich.html", "en": "en/about.html"},
    "kontakt": {"de": "kontakt.html", "en": "en/contact.html"},
    "impressum": {"de": "impressum.html", "en": "en/legal-notice.html"},
    "datenschutz": {"de": "datenschutz.html", "en": "en/privacy.html"},
}
NOINDEX = {"impressum", "datenschutz"}

# Titel, Beschreibung, Bild für Suchmaschinen und geteilte Links
META = {
    "index": {
        "de": ("Strömungsberechnung & CFD: Ingenieur in Kiel | coastl",
               "Idee oder Strömungsproblem? Berechnung und Optimierung für Boote, Propeller, Foils und mehr. Erste Einschätzung kostenlos. Ingenieur aus Kiel."),
        "en": ("Flow Simulation & CFD: Engineer in Kiel | coastl",
               "Idea or flow problem? Analysis and optimization for boats, propellers, foils and more. Free first assessment. Engineering from Kiel, Germany."),
    },
    "referenzen": {
        "de": ("Referenz: 3,5-m-Propeller für Muskelkraftflugzeug | coastl",
               "Aerodynamisch optimierter Propeller für das Human Powered Aircraft Libelle: 3,5 m Durchmesser, 800 g, mit CFD ausgelegt und aus Carbon gebaut."),
        "en": ("Reference: 3.5 m Human-Powered Aircraft Propeller | coastl",
               "Aerodynamically optimized propeller for the human-powered aircraft Libelle: 3.5 m diameter, 800 g, designed with CFD and built in carbon fiber."),
        "image": "/images/bg1.jpg",
    },
    "ueber-mich": {
        "de": ("Winny Hohensee, Schiffbauingenieur aus Kiel | coastl",
               "Winny Hohensee, B.Eng. Schiffbau und Maritime Technik. Berechnung und Optimierung umströmter Bauteile, mit Erfahrung im Faserverbundbau."),
        "en": ("Winny Hohensee, Naval Architect in Kiel | coastl",
               "Winny Hohensee, B.Eng. in naval architecture and maritime technology. Analysis and optimization of flow-exposed parts, with composite experience."),
    },
    "kontakt": {
        "de": ("Projekt anfragen: Strömung, Propeller, Foils | coastl",
               "Beschreiben Sie kurz Ihr Vorhaben: erste Einschätzung kostenlos, Angebot zum Festpreis. Für private Projekte und Bootsbauer, Ingenieur aus Kiel."),
        "en": ("Start a Project: Flow, Propellers, Foils | coastl",
               "Briefly describe your project: free first assessment, fixed-price quote. For private projects and boat builders, engineering from Kiel, Germany."),
    },
    "impressum": {"de": ("Impressum | coastl", ""), "en": ("Legal Notice | coastl", "")},
    "datenschutz": {"de": ("Datenschutzerklärung | coastl", ""), "en": ("Privacy Policy | coastl", "")},
}

# Alternativtexte und Beschriftungen für Screenreader (Deutsch -> Englisch)
ATTR_EN = {
    "Das Flugzeug Libelle auf dem Rollfeld, Helfer halten die Tragfläche, rechts der große zweiblättrige Propeller":
        "The aircraft Libelle on the runway, helpers holding the wing, the large two-blade propeller on the right",
    "Das muskelkraftbetriebene Flugzeug Libelle im Flug über der Startbahn": "The human-powered aircraft Libelle flying above the runway",
    "Fertig belegte Formen für Druck- und Saugseite": "Molds for pressure and suction side with plies in place",
    "Laminieren einer Blatthälfte in der Negativform": "Laminating a blade half in the female mold",
    "Winny Hohensee": "Winny Hohensee",
    "Animation der Rechengeometrie: Propeller dreht sich, mit Rumpf, ohne Tragflügel":
        "Animation of the analysis geometry: rotating propeller with fuselage, without wing",
    "Animierte Strömungssimulation eines Hydrofoils im unregelmäßigen Seegang mit schwankendem Druckfeld":
        "Animated flow simulation of a hydrofoil in irregular waves with a fluctuating pressure field",
    "Datenblatt": "Data sheet",
    "Hauptnavigation": "Main navigation",
    "Inhalt": "Contents",
    "coastl – Startseite": "coastl – home",
}


def url(page, lang):
    path = FILES[page][lang]
    if path.endswith("index.html"):
        path = path[: -len("index.html")]
    return f"{SITE}/{path}"


def structured_data(lang):
    de = lang == "de"
    services = ([
        ("Strömungsberechnung und Optimierung", "Strömungssimulation, Variantenvergleich und Optimierung."),
        ("Propeller-Auslegung", "Auslegung und Optimierung von Propellern mit Blattelementtheorie und CFD."),
        ("Hydrofoil- und Finnenauslegung", "Foils, Finnen und Ruder für Wassersport und maritime Anwendungen."),
        ("3D-Scan und Reverse Engineering", "Bauteile scannen, als CAD-Modell nachbilden und verbessern."),
    ] if de else [
        ("Flow simulation and optimization", "Flow simulation, comparison of variants and optimization."),
        ("Propeller design", "Design and optimization of propellers using blade element theory and CFD."),
        ("Hydrofoil and fin design", "Foils, fins and rudders for water sports and marine applications."),
        ("3D scanning and reverse engineering", "Scanning parts, rebuilding them as CAD models and improving them."),
    ])
    return {"@context": "https://schema.org", "@graph": [
        {
            "@type": "ProfessionalService", "@id": f"{SITE}/#coastl", "name": "coastl", "url": url("index", lang),
            "description": META["index"][lang][1], "email": "hohensee@coastl.de",
            "image": SITE + OG_DEFAULT, "logo": f"{SITE}/images/coastl_logo_dark.png",
            # Bewusst ohne Straße: die vollständige Anschrift steht nur im Impressum.
            "address": {"@type": "PostalAddress", "addressLocality": "Kiel", "addressRegion": "Schleswig-Holstein", "addressCountry": "DE"},
            "areaServed": [{"@type": "Country", "name": "Germany"}, {"@type": "Place", "name": "Europe"}],
            "knowsLanguage": ["de", "en"],
            "knowsAbout": (["Strömungssimulation", "CFD", "Aerodynamik", "Hydrodynamik", "Propeller", "Hydrofoil", "Faserverbund-Leichtbau"]
                           if de else ["Flow simulation", "CFD", "Aerodynamics", "Hydrodynamics", "Propellers", "Hydrofoils", "Composite lightweight design"]),
            "founder": {"@id": f"{SITE}/#winny-hohensee"},
            "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Leistungen" if de else "Services", "itemListElement": [
                {"@type": "Offer", "itemOffered": {"@type": "Service", "name": n, "description": d}} for n, d in services]},
        },
        {
            "@type": "Person", "@id": f"{SITE}/#winny-hohensee", "name": "Winny Hohensee", "honorificSuffix": "B.Eng.",
            "jobTitle": "Schiffbauingenieur" if de else "Naval architect", "url": url("ueber-mich", lang),
            "alumniOf": {"@type": "CollegeOrUniversity", "name": "Fachhochschule Kiel" if de else "Kiel University of Applied Sciences"},
            "sameAs": [LINKEDIN],
        },
        {"@type": "WebSite", "@id": f"{SITE}/#website", "url": f"{SITE}/", "name": "coastl",
         "inLanguage": ["de", "en"], "publisher": {"@id": f"{SITE}/#coastl"}},
    ]}


def head_tags(soup, page, lang):
    head = soup.head
    for tag in head.find_all(["title", "script"]):
        tag.decompose()
    for tag in head.find_all("meta"):
        if tag.get("name") in ("description", "robots") or str(tag.get("property", "")).startswith("og:") \
                or str(tag.get("name", "")).startswith("twitter:"):
            tag.decompose()
    for tag in head.find_all("link", rel=lambda r: r in ("canonical", "alternate")):
        tag.decompose()

    title, desc = META[page][lang]
    new = []

    def add(tag_name, text=None, **attrs):
        t = soup.new_tag(tag_name, attrs=attrs)
        if text is not None:
            t.string = text
        new.append(t)

    add("title", title)
    if desc:
        add("meta", name="description", content=desc)
    if page in NOINDEX:
        add("meta", name="robots", content="noindex, follow")
    else:
        add("link", rel="canonical", href=url(page, lang))
        for other in LANGS:
            add("link", rel="alternate", hreflang=other, href=url(page, other))
        add("link", rel="alternate", hreflang="x-default", href=url(page, "en"))
        image = SITE + META[page].get("image", OG_DEFAULT)
        for prop, value in [("og:type", "website"), ("og:site_name", "coastl"), ("og:title", title), ("og:description", desc),
                            ("og:url", url(page, lang)), ("og:image", image),
                            ("og:locale", "de_DE" if lang == "de" else "en_US")]:
            add("meta", property=prop, content=value)
        add("meta", name="twitter:card", content="summary_large_image")
    if page in ("index", "ueber-mich"):
        add("script", json.dumps(structured_data(lang), ensure_ascii=False, indent=1), type="application/ld+json")

    anchor = head.find("meta", attrs={"name": "viewport"})
    for tag in new:
        anchor.insert_after("\n  ", tag)
        anchor = tag


def build(page, lang):
    other = "en" if lang == "de" else "de"
    soup = BeautifulSoup((SRC / f"{page}.html").read_text(encoding="utf-8"), "html.parser")

    # nur die Elemente der Zielsprache behalten
    for el in soup.find_all(attrs={"data-l": other}):
        el.decompose()
    for el in soup.find_all(attrs={"data-l": lang}):
        del el["data-l"]
    soup.html["lang"] = "de" if lang == "de" else "en-US"
    soup.html["data-lang"] = lang

    head_tags(soup, page, lang)

    for el in soup.find_all(attrs={"data-ph-de": True}):
        el["placeholder"] = el[f"data-ph-{lang}"]
        del el["data-ph-de"], el["data-ph-en"]

    # Sprachumschalter: normaler Link auf die Schwesterseite
    button = soup.select_one("button.lang")
    if button:
        link = soup.new_tag("a", attrs={
            "class": "lang", "href": "/" + url(page, other)[len(SITE) + 1:], "hreflang": other,
            "aria-label": "English version" if lang == "de" else "Deutsche Version"})
        for child in list(button.contents):
            link.append(child.extract())
        button.replace_with(link)

    if lang == "en":
        for el in soup.find_all(id=re.compile(r"^en-")):
            el["id"] = el["id"][3:]
        for el in soup.find_all(True):
            for attr in ("alt", "aria-label"):
                value = el.get(attr)
                if not value or el.name == "a" and "lang" in el.get("class", []):
                    continue
                if value not in ATTR_EN:
                    raise SystemExit(f"{page}: englische Fassung für {attr}={value!r} fehlt in ATTR_EN")
                el[attr] = ATTR_EN[value]

    # interne Links auf die Dateinamen der Sprache umstellen
    for a in soup.find_all("a", href=True):
        m = re.fullmatch(r"([a-z-]+)\.html(#.*)?", a["href"])
        if m and m.group(1) in FILES:
            name = FILES[m.group(1)][lang].split("/")[-1]
            a["href"] = ("./" if name == "index.html" else name) + (m.group(2) or "")

    # Dateien immer ab dem Hauptordner laden (en/ liegt eine Ebene tiefer)
    assets = re.compile(r"^(images/|media/|style\.css|script\.js|foil-video\.js|prop-video\.js|linkedin\.png)")
    for el in soup.find_all(True):
        for attr in ("src", "href", "srcset"):
            value = el.get(attr)
            if value and assets.match(value):
                value = "/" + value
                el[attr] = re.sub(r"\?v=\d+", "", value) + (f"?v={VERSION}" if value.split("?")[0].endswith((".css", ".js")) else "")

    for c in soup.find_all(string=lambda s: isinstance(s, Comment) and "generiert" in s):
        c.extract()
    html = str(soup).replace("<!DOCTYPE html>", f"<!DOCTYPE html>\n<!-- generiert aus _src/{page}.html mit _src/build.py -->", 1)
    html = re.sub(r"\n[ \t]*(\n[ \t]*)+\n", "\n\n", html)
    target = ROOT / FILES[page][lang]
    target.parent.mkdir(exist_ok=True)
    write(target, html.rstrip() + "\n")


def write(target, text):
    """Schreibt mit Wiederholung: Cloud-Laufwerke sperren Dateien gelegentlich kurz."""
    for attempt in range(10):
        try:
            target.write_text(text, encoding="utf-8", newline="\n")
            return
        except OSError:
            if attempt == 9:
                raise
            time.sleep(1)


def sitemap():
    today = datetime.date.today().isoformat()
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for page in FILES:
        if page in NOINDEX:
            continue
        for lang in LANGS:
            out += ["  <url>", f"    <loc>{url(page, lang)}</loc>", f"    <lastmod>{today}</lastmod>"]
            out += [f'    <xhtml:link rel="alternate" hreflang="{o}" href="{url(page, o)}"/>' for o in LANGS]
            out += [f'    <xhtml:link rel="alternate" hreflang="x-default" href="{url(page, "en")}"/>', "  </url>"]
    out.append("</urlset>")
    write(ROOT / "sitemap.xml", "\n".join(out) + "\n")
    write(ROOT / "robots.txt", "# Alle Such- und KI-Crawler dürfen die Seite lesen.\nUser-agent: *\nAllow: /\n\n"
          f"Sitemap: {SITE}/sitemap.xml\n")


if __name__ == "__main__":
    for page in FILES:
        for lang in LANGS:
            build(page, lang)
    sitemap()
    print(f"{len(FILES) * len(LANGS)} Seiten, sitemap.xml und robots.txt erzeugt")
