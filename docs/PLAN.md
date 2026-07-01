# Lucid Editor Plan

Detailentscheidungen fuer die Grundpfeiler liegen nicht mehr nur in dieser Datei, sondern zusaetzlich in:

- `docs/IMPLEMENTATION-ROADMAP.md`
- `docs/TECH-STACK.md`
- `docs/foundations/library.md`
- `docs/foundations/graphics.md`
- `docs/foundations/sprites.md`
- `docs/foundations/logic.md`
- `docs/foundations/storage.md`
- `docs/foundations/project-format.md`
- `docs/foundations/ui-workflow.md`

## Ziel
Lucid Editor wird ein erweiterbarer 2D-Level-Editor fuer Jump-and-Run-Spiele. Er soll nicht nur einfache Grafikobjekte auf eine Canvas legen, sondern langfristig als kombinierter Scene-, Gameplay- und Trigger-Editor funktionieren.

Der neue Start in `Lucid Editor/` ersetzt bewusst nicht sofort die alte Datei `level-editor.html`, sondern schafft eine saubere Basis, auf die wir schrittweise Funktionen migrieren und neue Systeme aufsetzen koennen.

## Produktziele

### Kernfaehigkeiten
- Mehrfach platzierbare Library-Items
- Trennung zwischen Library-Definition und konkreter Instanz auf der Canvas
- Mehrere Levels innerhalb eines Projekts mit gemeinsamer projektweiter Library
- Mehrere klar getrennte Arbeitsbereiche statt eines einzigen ueberladenen Editorbildschirms
- Kollabierbare Seitenleisten-Bloecke fuer Properties, Library und Projektfunktionen
- Ebenen mit Parallax, Sichtbarkeit und Sperre
- Kamera-Navigation im Editor
- Speicherbares Projektformat fuer Szene, Library und Einstellungen

### Erweiterte Faehigkeiten
- Sprite-Animationen mit mehreren Zustaenden
- Trigger-Zonen fuer Checkpoints, Kamera und Events
- Unsichtbare Gameplay-Volumen wie Leiter, One-Way, Hazard, Kamera-Zone
- Nicht nur grafische, sondern auch technische Objekte
- Iteratives Wachstum der Library ueber die Zeit
- Eigene Workspaces fuer Projektverwaltung, Library-Verwaltung, spaeter Sprite-Bearbeitung und Export
- Engine-Anbindung fuer echtes Playtesting

## Nicht-funktionale Anforderungen

### Performance
- Fluessige Bedienung auch auf Rechnern ohne starke Grafikkarte.
- Grosse Sprites, viele Instanzen und Partikel frueh mitdenken, nicht erst nachtraeglich optimieren.
- Asset-Wiederverwendung, Culling, Pooling und vereinfachte Editor-Previews als Grundprinzipien beruecksichtigen.
- Projekt- und Exportformate moeglichst referenzbasiert halten statt grosse Bilddaten mehrfach einzubetten.

## Architekturentscheidung

### Grundsatz
Wir verwenden vorerst keinen grossen Frontend-Framework-Stack. Stattdessen nutzen wir native Browser-JavaScript-Dateien, klare Dateitrennung und eine MVC-nahe Struktur.

### Arbeitsumgebung in V1

- Der Editor bleibt in V1 bewusst **browserbasiert**.
- Die Basis fuer Speichern und Laden bleibt ein normaler Browser-Dateiworkflow.
- Eine spaetere `File System Access API` darf als progressive Komfortschicht hinzukommen, ist aber keine harte Voraussetzung fuer die erste lauffaehige Version.

### Warum kein HTML-Monolith mehr
Die alte `level-editor.html` mischt:
- State
- Rendering
- Input
- Persistenz
- UI
- Playtest-Logik

Das ist fuer den naechsten Ausbauschritt zu eng gekoppelt.

### Gewaehlte Struktur
- `src/model`
  Enthalten den Editorzustand, das Datenmodell und Factory-Funktionen.
- `src/views`
  Enthalten Rendering fuer Panels und Canvas.
- `src/controllers`
  Enthalten Orchestrierung, Event-Flows und State-Aenderungen.
- `src/services`
  Enthalten Persistenz und spaetere Asset- oder Engine-Adapter.
- `src/config`
  Enthalten Konfiguration, Defaults und Startdefinitionen.
- `assets/styles`
  Enthalten das Styling.
- `docs`
  Enthalten Planung und Changelog.

### MVC-Einschaetzung
Ein striktes klassisches MVC ist fuer diesen Editor nicht noetig. Sinnvoll ist eine pragmatische Variante:
- Model: Editorzustand, Layer, Library-Items, Entity-Instanzen
- View: Canvas, Ebenenliste, Inspector, Library-Panel
- Controller: Benutzeraktionen, Persistenz, Projektfluss

Diese Form ist fuer das Projekt besser als ein loses globales Script, aber leichter als ein schweres Framework.

## Datenmodell V1

### Library-Grundmodell
- Projektlokale, aber projektweit gemeinsame Library in V1
- Datengetriebene Item-Ordner mit `manifest.json`
- Drei grobe Haupttypen in V1:
  - `graphic`
  - `sprite`
  - `logic`

### Entity-Modell
- Library-Items und Instanzen bleiben getrennt
- Instanzen verweisen stabil auf Item-IDs
- Typspezifische Details liegen in den Foundation-Dokumenten
- `project.json` fuehrt mehrere Levels, eine projektweite Library-Registry und Editorzustand

## Library-Richtung

### V1-Fokus
- `graphic` fuer rein visuelle Objekte
- `sprite` fuer animierte oder zustandsbehaftete Objekte
- `logic` fuer technische Spielflaechen und Marker

### Spaetere Erweiterung
- feinere Unterteilungen
- Library-Packs fuer Wiederverwendung zwischen Projekten
- weitere Typen oder Spezialisierungen nur bei echtem Bedarf

## Speicherstrategie

### Was gespeichert werden soll
- Projekt-Metadaten
- Layer
- Entity-Instanzen
- Kamera
- relevante UI-Einstellungen wie offene oder geschlossene Inspector-Sektionen
- Verweise auf projektlokale Library-Items

### Wichtige Regel
Nicht nur Platzierungen speichern, sondern auch die gewachsene projektweite projektlokale Library sauber verwalten. Das Projektformat bleibt hybrid: `project.json` fuer Levels und Zustand, `manifest.json` als Quelle der Wahrheit pro Item.

## Engine-Strategie

### Stand jetzt
Der neue Editor ist absichtlich engine-neutral.

### Spaeter sinnvoll
- Phaser als wahrscheinlicher Hauptkandidat fuer Playtesting und Laufzeit
- PixiJS nur dann, wenn wir Renderer und Gameplay staerker selbst bauen wollen
- Matter.js nur als Zusatz, falls Physik deutlich ausgebaut wird

### Konsequenz
Der Editorzustand soll spaeter in ein engine-taugliches Runtime-Format exportierbar sein. Deshalb bleiben Library-Items, Entity-Instanzen und Layer als neutrale Datenmodelle angelegt.

## Migrationsstrategie aus dem alten Editor

### Bereits uebernommen
- Ebenenmodell mit Parallax-Idee
- Kamera-Grundlogik
- Canvas-Renderer als eigener View-Baustein
- Save/Load als JSON

### Noch zu migrieren
- Polygon-Editing
- Trigger-Geometrien
- Spawn-Handling im Detail
- echte Bildimporte
- Sprite-Preview und Sprite-States
- Playtest-Integration

## Naechste sinnvolle Schritte
1. Die dokumentierte UI-Shell und das Werkzeugmodell in den laufenden Prototyp ueberfuehren.
2. `Rectangle` und `Polygon` als geometry-first-Werkzeuge fuer technische Zonen einfuehren.
3. `Undo/Redo` sowie die neue rechte Sidebar-Struktur des `Level Editors` aufbauen.
4. Persistenz vom einfachen Prototyp auf das dokumentierte Multi-Level-`project.json` heben.
5. `Project View` als eigenen Workspace implementieren.
6. Den getrennten `Playtest`-Modus als UI- und Ablaufgeruest aufbauen.
