# Inhalte bearbeiten – Anleitung

Alle Texte der Website stehen in diesem Ordner `content/`. Sie brauchen dafür **keine
Programmierkenntnisse** – nur einen einfachen Texteditor (z. B. VS Code, TextEdit im
„Reiner Text“-Modus oder direkt im Browser auf GitHub).

**Änderungen gehen automatisch online:** Sobald eine Änderung auf GitHub im Zweig `main`
gespeichert ist („Commit changes“), wird die Website automatisch geprüft, neu gebaut und
veröffentlicht – nach etwa 1–2 Minuten ist sie live. Hochladen ist nicht nötig.

## Welche Datei steuert was?

| Datei               | Inhalt                                                                |
| ------------------- | --------------------------------------------------------------------- |
| `practice.yml`      | Adresse, Telefon, Fax, E-Mail, **Sprechzeiten**, Doctolib-Link, Logos |
| `de/home.md`        | Startseite (Begrüßung, Schwerpunkte, Zitat)                           |
| `de/notice.md`      | **Aktueller Hinweis** (Kasten auf Start- und Kontaktseite)            |
| `de/leistungen.md`  | Leistungsspektrum                                                     |
| `de/team.md`        | Ärztin (Lebenslauf, Sprachen, Mitgliedschaften) und Praxisteam        |
| `de/praxis.md`      | Bildergalerie mit Bildunterschriften                                  |
| `de/kontakt.md`     | Kontaktseite (Termintext, Lageplan-Beschreibung)                      |
| `de/impressum.md`   | Impressum                                                             |
| `de/datenschutz.md` | Datenschutzerklärung                                                  |
| `en/…`, `ru/…`      | Dieselben Dateien auf Englisch bzw. Russisch                          |

Beschriftungen von Menü und Schaltflächen (z. B. „Termin online“, Wochentage) stehen in
`messages/de.json`, `messages/en.json` und `messages/ru.json`.

## Platzhalter für Praxisdaten

Adresse, Telefon, Fax, E-Mail und Name der Ärztin werden in allen `.md`-Dateien (Text und
Kopfbereich) über Platzhalter aus `practice.yml` eingesetzt. Eine Änderung in `practice.yml`
wirkt so automatisch überall, auch im Impressum und in der Datenschutzerklärung:

| Platzhalter         | wird zu (Beispiel)                                                 |
| ------------------- | ------------------------------------------------------------------ |
| `{{aerztin}}`       | Dr. med. Regina Nadolny                                            |
| `{{strasse}}`       | Riehlstr. 7                                                        |
| `{{plz_ort}}`       | 14057 Berlin                                                       |
| `{{adresse}}`       | Riehlstr. 7, 14057 Berlin                                          |
| `{{telefon}}`       | 030 3218153 oder 030 3226177 (englisch/russisch: +49 30 … or/или …) |
| `{{fax}}`           | 030 32602420                                                       |
| `{{email}}`         | praxis@diabetologie-am-lietzensee.de (wird automatisch ein Link)   |
| `{{email_rezepte}}` | rezepte@diabetologie-am-lietzensee.de                              |

Ein falsch geschriebener Platzhalter bricht `pnpm build` mit einer Meldung ab.

## Deutsche Begriffe in englischen/russischen Texten

Damit Vorleseprogramme deutsche Fachbegriffe richtig aussprechen, werden sie in den
englischen und russischen Dateien so markiert:
`<span lang="de">Fachärztin für Allgemeinmedizin</span>`. Das funktioniert im Text und in
den Listen der `team.md` (Titel, Lebenslauf, Mitgliedschaften, Rollen).

## So sind die Dateien aufgebaut

Jede `.md`-Datei hat oben einen **Kopfbereich** zwischen zwei Zeilen `---`. Dort stehen
Angaben im Format `name: Wert`. Darunter folgt normaler Text in **Markdown**:

```markdown
## Zwischenüberschrift

Ein Absatz. **Fett** und _kursiv_.

- Listenpunkt
- noch ein Punkt

[Linktext](https://www.beispiel.de)
```

Regeln für den Kopfbereich:

- Einrückungen (Leerzeichen am Zeilenanfang) genau beibehalten, **keine Tabulatoren**.
- Listeneinträge beginnen mit `- `.
- Texte, die einen Doppelpunkt `:` enthalten, in Anführungszeichen setzen: `text: "Hinweis: …"`.
  Das gilt auch für Listeneinträge: `- "Ultraschall: Schilddrüse und Bauch"`.
- Zeilen, die mit `*`, `&`, `!`, `#` oder `@` beginnen, ebenfalls in Anführungszeichen setzen.

Jede Datei wird beim Bauen geprüft. Fehlt ein Feld, ist ein Feldname falsch geschrieben
(z. B. `titel:` statt `title:`) oder steht ein Text, wo eine Liste erwartet wird, bricht
`pnpm build` mit einer deutschen Meldung ab, die Datei, Zeile bzw. Position nennt.

## Sprechzeiten ändern

In `practice.yml` unter `hours:`. Beispiel Dienstag mit zwei Zeiträumen:

```yaml
tue:
  times:
    - { from: '09:00', to: '12:30' }
    - { from: '14:30', to: '16:30' }
```

Ein Tag ohne Sprechzeit wird einfach gelöscht. `note: by_appointment` ergänzt
„… und nach Vereinbarung“. Die Zeiten erscheinen automatisch auf allen Seiten und in allen
Sprachen.

## Hinweis-Kasten ein- und ausblenden

Nur in `de/notice.md` – die Einstellungen gelten für alle Sprachen:

- `show: true` → sichtbar, `show: false` → ausgeblendet
- `until: 2026-12-31` → wird nach diesem Tag ausgeblendet, sobald die Website das nächste
  Mal veröffentlicht wird (also bei der nächsten gespeicherten Änderung). Soll der Hinweis
  genau an einem bestimmten Tag verschwinden, an diesem Tag `show: false` setzen.
- `tone: warning` → auffälligere Farbe, z. B. bei Praxisschließung
- `stand: 2026-10-09` → Datum der letzten Textänderung. Bei jeder Textänderung auf das
  heutige Datum setzen.

`en/notice.md` und `ru/notice.md` enthalten nur die Übersetzung (`title:` und Text) und
ebenfalls `stand:`. Stimmt dieses Datum nicht mit `de/notice.md` überein, zeigen die
englische und russische Seite den **deutschen** Text (mit dem Hinweis „noch nicht
übersetzt“) – so sieht niemand einen veralteten Hinweis. Nach dem Übersetzen das Datum dort
angleichen.

Unten in der Datei stehen fertige **Vorlagen** (Urlaub mit Vertretung, Schließtag,
Notdienst 116 117, Stellenanzeige, Telefonstörung) zum Kopieren.

## Neue Mitarbeiterin hinzufügen

1. Foto (quadratisch, mind. 500 × 500 Pixel, JPG) in
   `src/lib/assets/images/team/` ablegen, z. B. `vorname-nachname.jpg`.
2. In `de/team.md` unter `staff:` einen Block ergänzen:

   ```yaml
   - name: Vorname Nachname
     photo: vorname-nachname.jpg
     roles:
       - Medizinische Fachangestellte
   ```

   Ohne `photo:` werden die Initialen angezeigt. Ist `photo:` angegeben, die Datei aber
   nicht vorhanden, bricht `pnpm build` mit einer Liste der vorhandenen Fotos ab
   (Groß-/Kleinschreibung der Dateiendung ist egal, `.JPG` geht also auch).

3. Dasselbe in `en/team.md` und `ru/team.md` (mit übersetzten Rollen). Namen, Fotos und
   Reihenfolge müssen in allen drei Dateien gleich sein – sonst bricht `pnpm build` mit einer
   Meldung ab, die beide Listen zeigt.

## Bilder auf der Startseite

Das große Bild oben (gleichzeitig Vorschaubild beim Teilen) und die Bildleiste stehen in
`practice.yml` unter `images:`. Die Symbole der drei Schwerpunkt-Kacheln sind fest im Code
hinterlegt (Tropfen, Mutter, Fuß); eine vierte Kachel bekommt wieder das erste Symbol.

## Übersetzungen

Steht in einer englischen/russischen Datei `translated: false`, ist es noch eine deutsche
Kopie; die Seite zeigt dann einen Hinweis „noch nicht übersetzt“. Nach dem Übersetzen
diese Zeile löschen.

## Vorschau und Veröffentlichen

```sh
pnpm install   # einmalig
pnpm dev       # Vorschau unter http://localhost:5173 – Änderungen erscheinen sofort,
               # Fehler in einer Datei werden direkt auf der Seite angezeigt
pnpm build     # erzeugt die fertige Website im Ordner build/
```

Die Vorschau auf dem eigenen Rechner ist optional. Zum Veröffentlichen genügt es, die
Änderung auf GitHub im Zweig `main` zu speichern: Die Website wird dann **automatisch geprüft,
gebaut und veröffentlicht** (Fortschritt im Reiter „Actions“ auf GitHub, Dauer ca. 1–2
Minuten).

Enthält eine Datei einen Fehler (z. B. ein fehlendes Pflichtfeld oder ein falsch geschriebenes
Datum), wird **nichts veröffentlicht** – die bisherige Website bleibt online. Unter „Actions“
erscheint dann ein rotes ✗; ein Klick darauf zeigt eine deutsche Fehlermeldung mit Datei und
Problem. Fehler beheben, erneut speichern – fertig.

---

## English summary

All site content lives in `content/`: `practice.yml` holds language-independent facts
(address, phones, emails, opening hours, booking link, certification logos); each page has one
Markdown file per language in `content/{de,en,ru}/` with YAML frontmatter for structured data
and Markdown for prose. `de/notice.md` controls the announcement banner for all languages (`show`, optional `until`
date, `tone`, `stand`); en/ru notices only hold the translated text and are used while their
`stand` matches the German one. Copy-ready templates are in an HTML comment. Practice facts
can be inserted anywhere with placeholders such as `{{telefon}}` or `{{adresse}}` (see the
table above); German terms in en/ru text are wrapped in `<span lang="de">…</span>`. Content is
validated at build time with German error messages. UI labels live in
`messages/*.json`. Images go into `src/lib/assets/images/` and are referenced by file name.
Files marked `translated: false` are German placeholders. Preview with `pnpm dev` (optional).
Every push to `main` is automatically checked, built and deployed to GitHub Pages
(`.github/workflows/deploy.yml`); an expired `until` date takes effect on the next deploy. If
validation fails, nothing is deployed and the live site stays unchanged.
