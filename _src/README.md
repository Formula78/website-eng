# Seiten bearbeiten

Die Seiten werden **hier** bearbeitet, nicht im Hauptordner. Jede Quelle enthält
Deutsch und Englisch (`data-l="de"` / `data-l="en"`). Danach erzeugen:

    python _src/build.py

Ergebnis: deutsche Seiten im Hauptordner, englische unter `en/`, dazu
`sitemap.xml` und `robots.txt`. Seitentitel und Beschreibungen stehen in
`build.py` (`META`). Bei Änderungen an CSS oder Skripten dort `VERSION` erhöhen.

Direkt im Hauptordner bearbeitet werden nur `style.css`, die `*.js`-Dateien,
`404.html`, `images/` und `media/`.

Ordner mit Unterstrich liefert GitHub Pages nicht aus.
