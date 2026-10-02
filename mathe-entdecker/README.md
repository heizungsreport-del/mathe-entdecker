# Projekt und PWA

## Ausgangslage

- Reines HTML, CSS und JavaScript; kein Framework oder Bundler.
- Ursprünglich drei handgeschriebene Dateien in `dist/`, keine package.json, kein Build.
- Das bereits vorhandene Git-Repository im übergeordneten Ordner hatte noch keinen Commit und keinen Remote.
- Die funktionierende Ausgangsversion wurde vor Änderungen in einem Git-Commit gesichert.
- Alte lokale Einzeldatei-Exporte im übergeordneten Verzeichnis bleiben unverändert; sie sind nicht Teil der PWA oder Veröffentlichung.
- Die frühere `.openai/hosting.json` wird nicht veröffentlicht und für GitHub Pages nicht benutzt.

## Struktur

```text
dist/                 Bearbeitbare statische Quelldateien (bestehender Pfad bleibt erhalten)
  index.html          Oberfläche und Apple-Meta-Tags
  app.js              Aufgaben, Navigation, Zustand im Arbeitsspeicher
  style.css           Responsive Darstellung, Systemfonts, Touch-Anpassungen
  manifest.webmanifest
  pwa.js              Registrierung, Offline-Bereitschaft und Update-Hinweis
  sw.js               Service Worker; Versionsplatzhalter wird beim Build ersetzt
  icons/              PNG: 180, 192, 512 und maskierbare 512 Pixel
scripts/build.mjs     Sauberer Build, Hash über alle ausgelieferten Dateien
scripts/serve.mjs     Lokaler HTTP-Test unter /mathe-entdecker/
test/app.test.mjs     Node-Tests ohne zusätzliche Pakete
build/                Erzeugte Veröffentlichung; nicht im Git-Repository
```

`dist/` bleibt aus Kompatibilitätsgründen der bisherige Quellpfad. Für die Veröffentlichung
wird `build/` jedes Mal neu erzeugt. Der Build entfernt ausschließlich sein eigenes
Ausgabeverzeichnis. Er übernimmt keine Repository-Konfiguration, Secrets oder Dokumentation.

## PWA und Cache

Alle Asset-URLs, Manifest-IDs, Scope und Start-URL sind relativ. Deshalb funktioniert die
App sowohl unter einem Domain-Root als auch unter `/mathe-entdecker/`, ohne hardcodierten
GitHub-Benutzernamen. Es wird keine zweite PWA-Bibliothek verwendet.

Beim ersten HTTPS-/localhost-Aufruf werden HTML (Start-URL und index.html), CSS,
JavaScript, Manifest und alle vier Icons vollständig vorgeladen. Die Mathematikinhalte
und SVG-Zahlenstrahlen werden lokal in app.js erzeugt. Es gibt keine Sounddateien,
entfernten Bilder, Schriftdateien oder benötigten externen APIs. Browser-Vorlesen ist
eine zusätzliche Gerätefunktion und nicht Voraussetzung für das Lernen.

Ein neues Cache-Präfix enthält den App-Pfad, die Version einen Hash aller Quelldateien.
Eine unvollständige Installation ersetzt keine funktionierende Version. Der Worker
liefert zusammenpassende Dateien aus seinem eigenen Cache, greift nicht in benachbarte
Pages-Projekte ein und löscht bei Aktivierung nur veraltete Caches seines eigenen Pfads.
Updates warten bis zum Schließen der App oder auf eine ausdrückliche Bestätigung;
keine automatische Unterbrechung einer Runde. Cache Storage ist keine dauerhafte Garantie:
Das Betriebssystem oder das Löschen von Websitedaten kann ihn entfernen.

`file://` bleibt für die ursprüngliche lokale Nutzung möglich, aktiviert aber keinen
Service Worker. Installations-/Offline-Funktionen benötigen HTTPS oder localhost.

## Safari und Bedienung

- Kein erzwungenes Quer-/Hochformat, keine Zoomsperre, Safe-Area-Abstände.
- Buttons mindestens 44 CSS-Pixel hoch, Select 16 Pixel und Antwortfeld 25 Pixel.
- Keine Funktion benötigt Hover. Tastatur, Enter und Touch bleiben möglich.
- Vorlesen nur im direkten Benutzerereignis; Stop bei Aufgabenwechsel/Hintergrund.
- Systemfonts; keine externe Font-Verbindung. Die Optik kann je nach Gerät leicht variieren.
- Zahlprüfung akzeptiert ganze Zahlen und korrekt gruppierte Tausender, verwirft z. B. `1.2`.
- Ziel: aktuelle Safari-/iPadOS-Versionen mit nativen dialog- und Service-Worker-APIs.

## Durchgeführte Tests (02.10.2026)

- Sechs Node-Tests erfolgreich: 600 erzeugte Aufgaben, unabhängiges Nachrechnen
  von Rechenregeln und Sachaufgaben, Manifest/Base-Path, tatsächliche PNG-Größen,
  keine externen Font-/Script-Referenzen, keine neue Lernstandspeicherung.
- Service-Worker-Tests: alle notwendigen Dateien offline, Start-URLs mit Query-String,
  Abgrenzung zu anderen Websites, sichere Cache-Bereinigung, explizite Update-Aktivierung,
  fehlgeschlagene Installation bewahrt vorhandenen Cache.
- Production-Build erfolgreich; HTTP-Aufruf unter `/mathe-entdecker/`.
- Browser: Start, Aufgabenauswahl, Schwierigkeit, Antwort per Enter, richtige Rückmeldung.
- Offline: HTTP-Server beendet und Unerreichbarkeit per HTTP-Client bestätigt;
  danach App neu geladen und vollständige Fünfer-Runde mit Klammer-/Punktrechnung gelöst.
- Neuladen setzt Sitzung/Sterne wie dokumentiert zurück.
- Geprüfte iPad-Viewportgrößen: 768×1024 und 1024×768; kein horizontaler Seitenüberlauf,
  sichtbare Buttons mindestens 44 Pixel hoch.

Die Browserprüfung erfolgt im verfügbaren Desktop-WebKit-Browser mit iPad-Viewportgrößen.
Ein physisches iPad, die Installation über das echte Safari-Teilen-Menü und die Ausgabe
der dort installierten Vorlesestimmen wurden damit nicht geprüft. Abschließender Gerätetest:
App installieren, einmal vom Home-Bildschirm online öffnen, dann Flugmodus einschalten,
App neu öffnen und eine Runde lösen. Die aktuellen Lernstände sind bewusst nicht dauerhaft.
