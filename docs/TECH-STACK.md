# Lucid Editor Tech Stack

## Zielbild fuer V1

Lucid Editor bleibt in V1 bewusst **browserbasiert**, lokal nutzbar und technisch leichtgewichtig.  
Die erste Version soll ohne schweren Build- oder Framework-Stack auskommen.

## Kerntechnologien

- **Host**
  - Moderner Desktop-Browser
- **UI**
  - HTML
  - CSS
- **Anwendungslogik**
  - Vanilla JavaScript
- **Rendering**
  - HTML5 Canvas 2D
- **Datenformate**
  - JSON fuer `project.json`, `manifest.json` und spaetere Exportdaten

## Architektur

- Keine grossen Frontend-Frameworks in V1
- Keine Bundler-Pflicht fuer den ersten lauffaehigen Editor
- MVC-nahe Ordnerstruktur:
  - `src/model`
  - `src/views`
  - `src/controllers`
  - `src/services`
  - `src/config`

## Konkrete Bibliotheksentscheidungen

### Direkt vorgesehen

- **Lucide** (im Einsatz)
  - fuer Toolbar-, Panel- und Status-Icons
  - Die verwendeten Icons liegen als unveraenderte Lucide-SVG-Pfade in `src/utils/common.js` (`ICON_PATHS`) vor; es werden bewusst **keine eigenen Icons** gezeichnet. Fehlt ein passendes Icon, wird eine Auswahl mit dem Team abgestimmt statt selbst gezeichnet.
- **Ajv**
  - fuer JSON-Schema-Validierung von `project.json`, `manifest.json` und spaeteren Exportdaten
- **SortableJS**
  - fuer DOM-basiertes Reordering wie Layerlisten oder Level-Kacheln

### Bewusste Grenzen

- `SortableJS` ist **nicht** die Grundlage fuer Canvas-Interaktion.
- Drag-and-Drop und Manipulation **auf der Canvas** bleiben eigene Editorlogik, weil dort Weltkoordinaten, Layerregeln, Sperren, Auswahl, Toolmodi und Geometriebearbeitung zusammenspielen.

## Dateizugriff im Browser

### Baseline fuer V1

Der Editor soll immer auch ohne Spezial-API arbeiten koennen:

- Laden ueber Dateiauswahl im Browser
- Speichern ueber JSON-Download

Das ist die robusteste Basis und funktioniert breit.

### File System Access API

Die `File System Access API` ist eine Browser-API, mit der eine Web-App nach ausdruecklicher Nutzerfreigabe:

- echte Dateien direkt oeffnen kann
- bestehende Dateien direkt wieder speichern kann
- spaeter auch mit Projektordnern arbeiten kann

Praktisch heisst das:

- ohne diese API:
  - `Datei laden`
  - `Datei speichern unter`
  - Download/Upload-Workflow
- mit dieser API:
  - eher wie ein kleiner Desktop-Editor
  - Projekt direkt aus einem gewaehlten Ordner oeffnen
  - Aenderungen gezielt wieder in dieselbe Datei schreiben

Wichtiger Punkt:

- Die API ist stark an **Chromium-basierte Browser** gebunden.
- Deshalb wird sie in Lucid Editor **nicht als harte Pflicht**, sondern als **optionale Komfortschicht** gedacht.

Kurz:
- **Baseline:** normaler Browser-Dateiworkflow
- **spaeter optional:** `File System Access API` als besserer Projektordner-Workflow

## Externe Werkzeuge

Lucid Editor steht nicht isoliert, sondern neben bestehenden Hilfstools:

- `sprite_mapper.py`
  - Python/Tkinter-Tool fuer Sprite-Zuordnung
- `mp4_to_spritesheet.py`
  - Python/OpenCV-Tool fuer Video-zu-Spritesheet
- `build_character_manifest.js`
  - Node-Skript fuer Manifest-Generierung

Diese Werkzeuge bleiben vorerst **externe Pipeline-Bausteine** und werden nicht fuer V1 direkt in den Editor integriert.

## Bibliotheken

### V1-Editor

- keine UI-Bibliothek oder kein grosses Design-Framework
- keine Canvas-Engine
- keine State-Management-Bibliothek
- kein Build-Framework als Voraussetzung

### Spaeter denkbar

- **Phaser**
  - wahrscheinlichster Kandidat fuer Playtest-/Runtime-Adapter
  - nicht als Basis des Editors, sondern als **separates Runtime-Modul innerhalb desselben Softwarepakets**
- **Matter.js**
  - nur wenn spaeter deutlich mehr Physik noetig wird

## UI- und Designsystem-Regeln

- Die Editoroberflaeche wird **nicht** auf ein fremdes Design-Framework gestuetzt.
- Stattdessen nutzt Lucid Editor ein eigenes kleines Designsystem mit wiederverwendbaren UI-Bausteinen.
- Farben, Abstaende, Typografie, Radius, Schatten, Linien und Icongroessen sollen so weit wie moeglich ueber **CSS-Variablen** bzw. Design-Tokens gepflegt werden.
- Ziel ist:
  - konsistente Oberflaeche
  - spaetere Umstellung von Farbwelten ohne grossen Umbau
  - wiederverwendbare Panels, Toolbars, Buttons, Inputs und Statusbausteine
  - gut lesbares, dokumentiertes CSS statt schnell gewachsener Sonderfaelle

## Playtest und Runtime

- Der erste Editor bleibt browserbasiert und eigenstaendig benutzbar.
- Ein spaeterer `Playtest` gehoert trotzdem **zum Lucid-Editor-Paket** und ist kein separates Fremdtool.
- Technisch wird dafuer voraussichtlich ein **getrennter Runtime-/Playtest-Adapter** eingebettet.
- Aktuell ist **Phaser** der naheliegendste Kandidat fuer diesen Adapter.
- Wichtig bleibt die Trennung:
  - **Editor-Shell:** HTML, CSS, Vanilla JS, Canvas
  - **Playtest-/Runtime-Modul:** spaeter voraussichtlich Phaser

## Versionierung

- Die laufende Editorversion steht in `VERSION.json`.
- Formatversionen wie `projectSchemaVersion` werden dort ebenfalls mitgefuehrt.
- `docs/CHANGELOG.md` beschreibt die Aenderungen in Textform.

## Git-Repository-Grenze

- Das Git-Repository fuer die aktive Produktentwicklung liegt **direkt in `Lucid Editor/`**.
- Dateien und Ordner ausserhalb von `Lucid Editor/` gehoeren aktuell **nicht** zum produktiven Repository.
- Experimentelle Altdateien, Test-HTMLs und vorlaeufige externe Tools im uebergeordneten Ordner bleiben bewusst ausserhalb der Versionshistorie des Editors.
- Externe Werkzeuge wie der bisherige Sprite-Mapper werden erst dann in das Repository aufgenommen, wenn sie bewusst in den Editor integriert oder als offizieller Produktbestandteil uebernommen werden.
