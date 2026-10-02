# Mathe Entdecker

Eine kleine Mathe-Lern-App für Klasse 4, ohne Anmeldung, Werbung oder Analytics.
Der Anwendungscode befindet sich in [`mathe-entdecker/`](mathe-entdecker/README.md).

## Lokal testen

Node.js 22 oder neuer genügt. Es gibt keine npm-Abhängigkeiten und keinen Installationsschritt.

```sh
cd mathe-entdecker
npm test
npm run build
npm run preview
```

Danach `http://127.0.0.1:8766/mathe-entdecker/` öffnen. Alternativ ohne npm:
`node --test`, `node scripts/build.mjs`, `node scripts/serve.mjs`.

## Veröffentlichung

Das vorhandene Git-Repository liegt eine Ebene oberhalb des App-Verzeichnisses.
Der Workflow `.github/workflows/pages.yml` prüft die App, baut sie und veröffentlicht
nur `mathe-entdecker/build/` über GitHub Pages bei jedem Push auf `main`.
In GitHub muss unter **Settings → Pages → Build and deployment → Source**
einmalig **GitHub Actions** ausgewählt sein.

Änderungen an `mathe-entdecker/dist/` vornehmen, testen, committen und `main` pushen:

```sh
git add mathe-entdecker .github README.md .gitignore
git commit -m "Update Mathe Entdecker"
git push origin main
```

## iPad

Die veröffentlichte HTTPS-Adresse in Safari öffnen und auf **Offline bereit** warten.
Dann **Teilen → Zum Home-Bildschirm** wählen; falls angezeigt, **Als Web-App öffnen**
aktivieren. Die App vom neuen Home-Bildschirm-Symbol einmal online starten und erneut
auf **Offline bereit** warten. Danach sind die Übungen offline verfügbar.

Neue Versionen erscheinen als **Neue Version laden**. Erst die Runde abschließen:
Das bestätigte Neuladen setzt die laufende Sitzung zurück. Ohne Bestätigung wird
eine wartende Version spätestens aktiv, wenn alle offenen App-Fenster geschlossen sind.

## Datenschutz und Speicher

Sterne, Schwierigkeit, Antworten und Fortschritt liegen nur im JavaScript-Arbeitsspeicher.
Sie werden beim Neuladen zurückgesetzt. Es gibt kein localStorage, keine IndexedDB,
keine Accounts und keine Übertragung von Antworten oder Ergebnissen.
Der Service Worker speichert ausschließlich App-Dateien in **Cache Storage** auf
dem jeweiligen Gerät. Safari und die installierte App können getrennte Speicherbereiche
haben. Löschen von Websitedaten, privates Surfen oder Speicherbereinigung des Systems
können den Offline-Cache entfernen; dann ist ein erneutes Online-Öffnen nötig.

GitHub Pages erhält technisch notwendige Abrufe der veröffentlichten Dateien.
Die App fügt keine Tracking-, Werbe- oder Analytics-Dienste hinzu.
Schriftarten werden vom Gerät verwendet, ohne Google-Fonts-Aufruf.
Vorlesen wird nur auf Knopfdruck ausgelöst; eine vorhandene lokale deutsche Stimme
wird bevorzugt. Verfügbarkeit und Offline-Betrieb der Stimmen hängen vom Gerät ab.

## Prüfung und Grundlagen

Siehe [technische Dokumentation und Testprotokoll](mathe-entdecker/README.md).
Die Pages-Konfiguration folgt der [GitHub-Dokumentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
Offline-Caching basiert auf dem [Service-Worker-Lebenszyklus](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).
Die Home-Bildschirm-Konfiguration nutzt die von [WebKit beschriebenen Manifest-Einstellungen](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).
