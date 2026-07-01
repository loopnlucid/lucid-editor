# Lucid Editor Brainstorming

Dieses Dokument ist eine Arbeitsnotiz fuer die fruehe konzeptionelle Planung. Es ist bewusst noch keine finale Spezifikation. Hier halten wir Ziele, Leitentscheidungen, offene Fragen und Prioritaeten fest. Aus diesem Dokument sollen spaeter `PLAN.md`, technische Doku und feinere Umsetzungsplaene abgeleitet werden.

Die bereits entschiedenen Grundpfeiler werden nach und nach in die Dateien unter `docs/foundations/` ueberfuehrt, damit dieses Dokument offen und explorativ bleiben kann.

## Zielbild

Lucid Editor soll langfristig kein einfacher Bild-Placement-Editor sein, sondern ein erweiterbares Content-Tool fuer 2D-Jump-and-Run-Spiele. Der Editor soll:

- Level bauen
- Library-Objekte verwalten
- Sprites und Animationen definieren oder importieren
- technische Gameplay-Objekte platzieren
- Daten fuer eine separate Spiel-Runtime exportieren

Wichtig: Der Editor ist nicht das fertige Spiel. Er erzeugt und verwaltet Inhalte. Das eigentliche Spiel sollte diese Inhalte spaeter laden und interpretieren koennen.

## Bereits festgehaltene Leitentscheidungen

### Editor, Runtime und Export trennen

- Der Editor soll Content erzeugen.
- Das Spiel soll diesen Content laden.
- Exportformat und Runtime muessen von Anfang an mitgedacht werden.

Diese Trennung ist wichtig fuer Erweiterbarkeit, Tests, Steam-Deployment und spaetere Wiederverwendung.

### Library datengetrieben statt codegetrieben

- Kein JavaScript-File pro Objekt als Standardmodell.
- Standardfall: datengetriebene Library-Items mit Manifesten.
- Optional koennen Spezialobjekte spaeter eigene Skriptlogik bekommen, aber nur als Ausnahme.

Empfohlene Richtung:

- ein Ordner pro Library-Item oder Asset-Pack
- `manifest.json`
- Asset-Dateien wie PNG, Sprite-Sheet, Preview
- optional spaeter `behavior.js` fuer Sonderfaelle

### Sprites nicht nur fuer Charaktere denken

Ein Sprite ist nicht automatisch ein Charakter. Das Format soll auch andere Faelle tragen:

- NPCs
- Gegner
- Lampen mit Flicker
- Schalter mit Zustandswechsel
- Tueren
- animierte Dekoelemente
- Effekte oder technische Objekte mit visuellen States

### SpriteMapper kurzfristig extern lassen

- Der vorhandene `sprite_mapper.py` bleibt zunaechst ein externes Werkzeug.
- Kurzfristig ist wichtiger, das Ausgabeformat sauber festzulegen.
- Spaeter kann der SpriteMapper importiert oder als Editor-Bereich integriert werden.

### Performance als Querschnittsthema

- Performance muss bei allen Grundpfeilern mitlaufen, besonders bei grossen Sprites, vielen Instanzen, Partikeln und auf schwaecherer Hardware.
- Editor-Preview und Runtime-Darstellung muessen nicht in jedem Detail identisch sein, wenn vereinfachte Vorschauen die Bedienung stabil und fluessig halten.
- Asset-Wiederverwendung, Culling, Pooling, Limits und referenzbasierte Datenhaltung sind fruehe Architekturthemen, keine spaeten Optimierungen.

## 1. Library und Asset-Struktur

### Ziel

Die Library soll spaeter sehr viele Inhalte tragen koennen, ohne unuebersichtlich oder technisch fragil zu werden.

### Gewuenschte Faehigkeiten

- Library-Items mehrfach auf Canvas platzierbar
- visuelle Vorschau bei Grafiken und Sprites
- Kategorien, Tags und Suche
- Realtime-Filterung
- Drag and Drop aus der Library auf die Canvas
- Import neuer Inhalte ohne Codeumbau

### Empfohlene Struktur

Begriffe sauber trennen:

- Asset
  Rohdatei wie PNG, Sprite-Sheet, Audio, JSON
- Sprite-Definition
  Frames, Animationen, Hitboxen, Pivot, Events, States
- Library-Item oder Prefab
  Wiederverwendbares Objekt im Editor
- Entity-Instanz
  Konkrete Platzierung auf der Canvas
- Behavior
  Optionales Laufzeitverhalten

V1 verwendet bereits die groben technischen Haupttypen `graphics`, `sprites` und `logic`. Darueber oder innerhalb davon koennen spaeter fachliche Gruppierungen sinnvoll werden, zum Beispiel:

- visuelle Dekoelemente
- Akteure
- technische Gameplay-Objekte
- Trigger
- Effekte

V1 denkt ein Item pro Ordner. Spaeter koennen daraus zusaetzlich Packs werden. Typische Dateien pro Item oder spaeterem Pack:

- `manifest.json`
- `preview.png` oder `thumbnail.png`
- `sprite.png` oder `atlas.png`
- `sprite.json` oder `animations.json`
- optionale weitere Ressourcen

### Offene Fragen

- Wie sehen spaetere Library-Pack-Container und deren Versionierung aus?
- Wie werden projektlokale Items und spaeter importierte Packs sauber nebeneinander verwaltet?
- Wie werden fehlende Assets oder kaputte Referenzen sichtbar gemacht?

### Richtungsentscheidung: primitive Logic-Geometrie

Bei technischen Levelobjekten wie:

- `solid`
- `hazard`
- `checkpoint`
- `ladder`
- `one-way`

gibt es aktuell zwei denkbare Arbeitsmodelle:

- **Library-first**
  - zuerst einen technischen Typ oder ein Library-Item waehlen
  - danach Geometrie zeichnen
- **Geometry-first**
  - zuerst Rechteck oder Polygon zeichnen
  - danach den semantischen Typ im Editor zuweisen

Entschiedene Richtung:

- Primitive technische Volumen werden zunaechst **geometry-first direkt im Level** erzeugt.
- Die semantische Zuweisung erfolgt danach im Editor.
- Die Library ist dafuer in V1 nicht der primaere Einstiegspunkt.

Konkret bedeutet das:

- primitive Logikvolumen werden direkt im Level erzeugt
- die Typzuweisung erfolgt danach im Inspector oder ueber Eigenschaften
- nur wiederverwendbare technische Setups werden spaeter aktiv in die Library oder in Prefabs ueberfuehrt

Vorteil dieser Richtung:

- technischer Geometrie-Workflow wird natuerlicher
- Library bleibt staerker auf Wiederverwendung konzentriert
- der Editor mischt Asset-Placement und Geometrieerstellung weniger unnoetig

## 2. Drag and Drop

### Gewuenschte Flows

- Dateien vom Betriebssystem in die Library ziehen
- Library-Items auf die Canvas ziehen
- Bilder direkt auf eine Ebene oder in eine Import-Zone ziehen
- spaeter vielleicht Reordering von Ebenen oder Ordnern

### Zu klaerende Details

- Wie werden Sprite-Sheet plus Manifest gemeinsam importiert?
- Wie werden Konflikte bei gleichen IDs oder Dateinamen beim Import behandelt?
- Wie wird verhindert, dass Nutzer versehentlich unvollstaendige Sets importieren?

## 3. Sprite-System

### Ziel

Ein einheitliches Format fuer Charaktere, Gegner, Schalter, visuelle Props und andere animierte Objekte.

### Minimaler Inhalt einer Sprite-Definition

- `id`
- `label`
- `image`
- `frameWidth`
- `frameHeight`
- `animations`
- `pivot`
- `hitboxes`
- `events`
- `defaultState`
- `looping`

### Wahrscheinlich noetige Erweiterungen

- mehrere Hitbox-Typen
  Kollision, Hurtbox, Interaction, Trigger
- State-Machine-nahe Angaben
  idle, run, jump, switch-on, switch-off, flicker
- Richtungsvarianten
  links, rechts oder gespiegelt
- Marker oder Events in Frames
  z. B. Schritt, Partikel, Sound, Trigger
- mehrere visuelle Layer
  z. B. Koerper plus Waffe oder Glow

### Arbeitsannahme

Das aktuelle Ausgabeformat des SpriteMappers ist nicht automatisch das Ziel. Es darf angepasst werden, wenn ein allgemeineres und stabileres Format daraus entsteht.

### Wichtige Designregel

Sprite-Daten und Gameplay-Logik nicht unnoetig vermischen. Ein Schalter ist nicht nur eine Animation, sondern:

- visuelle States
- Interaktionslogik
- optionale Trigger-Ausgabe
- Properties fuer Verhalten

## 4. Partikel und Effekte

### Gewuenschte Beispiele

- Nebel
- Rauch
- Staub
- Funken
- Regen
- Schnee
- Laub
- Glut
- Fireflies oder Ambient-Partikel

### Konzeptionelle Richtung

Partikel sollten wahrscheinlich nicht als rohe Bildobjekte modelliert werden, sondern als `Effect Emitter` oder `Particle Emitter` in der Library.

Ein Emitter koennte definieren:

- verwendete Textur oder Sprite
- Spawn-Rate
- maximale Partikelanzahl
- Lebensdauer
- Geschwindigkeit
- Richtung und Streuung
- Groessenbereich
- Alpha-Verlauf
- Farbe oder Farbverlauf
- Blend-Mode
- Looping
- Triggerbarkeit
- Editor-Preview an oder aus

### Wichtige Ueberlegung

Editor-Preview und Runtime-Qualitaet muessen nicht identisch sein. Im Editor kann eine vereinfachte Vorschau sinnvoll sein, damit die Bedienung fluessig bleibt.

### Performance-Hinweise

- Object Pooling statt staendig neu erzeugter Partikel
- Offscreen-Culling
- harte Limits pro Emitter und Szene
- klare Trennung zwischen dekorativen und gameplay-relevanten Effekten

## 5. Speichern, Laden und Projektformat

### Grundsatz

Projekt speichern und Spiel exportieren sind nicht dasselbe.

### Editor-Projekt sollte speichern

- Metadaten
- Layer
- Kamera
- Spawn
- Library-Definitionen oder Projekt-Referenzen
- Entity-Instanzen
- Properties und Overrides
- Trigger und technische Objekte
- relevante UI-Zustaende

### Wichtig

- Projektformat versionieren
- Migrationen spaeter ermoeglichen
- keine grossen Base64-Einbettungen als Standard
- lieber Asset-Referenzen als eingebettete Bilddaten

### Spaeter denkbar

- Autosave
- Recovery nach Absturz
- separate Exportprofile
- Validierung vor dem Speichern oder Export

### Offene Fragen

- Wie sehen spaetere Pack-Referenzen im Projektformat aus, wenn Library-Packs importiert werden?
- Wie robust soll das System gegen verschobene Dateien sein?

## 6. Spiel-Runtime, Export und Steam

### Strategische Richtung

Der Editor sollte Levels und Content in ein runtime-taugliches Format exportieren. Das Spiel selbst ist ein separates Laufzeitsystem.

### Vermutlich sinnvolle Trennung

- `Lucid Editor`
  Content-Tool
- `Runtime` oder `Game`
  laedt und spielt exportierte Inhalte ab

### Warum das wichtig ist

- besser fuer Tests
- besser fuer Wiederverwendung
- besser fuer Packaging
- besser fuer Steam

### Steam-Relevanz

Wenn das Spiel spaeter auf Steam erscheinen soll, muessen wir frueh auf folgende Punkte achten:

- stabiles Exportformat
- reproduzierbare Build-Pipeline
- klare Trennung zwischen Rohdaten, Projektdateien und Shipping-Daten
- keine editorinternen Spezialformate ohne Runtime-Strategie

### Offene strategische Fragen

- Welche Runtime-Engine wird spaeter verwendet?
- Wird die Runtime im selben Repository leben oder getrennt?
- Gibt es einen Editor-Export und zusaetzlich einen Build-Schritt fuer das Spiel?

## 7. Git und Arbeitsweise

### Aktueller Stand

Im Workspace ist derzeit kein echtes `.git` vorhanden. Langfristig sollte das Projekt in einem echten Git-Repository gefuehrt werden.

### Empfehlung

- frueh auf echtes Git umstellen
- saubere Commits
- Branches fuer groessere Themen
- Changelog und Plan nicht vergessen

### Fuer dieses Projekt besonders wichtig

- klaeren, welche Dateien generiert sind
- klaeren, welche Assets Quellmaterial sind
- ggf. spaeter Git LFS fuer groessere Binaerdaten pruefen

### Sinnvolle Regeln

- generierte Dateien nicht manuell pflegen, wenn eine Quelle existiert
- Doku und Architekturentscheidungen mitversionieren
- Importformate stabil halten oder mit Migrationshinweisen aendern

## 8. AGENTS.md

### Warum das Thema wichtig ist

`AGENTS.md` kann fuer dieses Projekt ein sehr nuetzliches Steuerdokument sein, damit kuenftige KI- oder Entwicklerbeitraege die Architektur nicht wieder in einen Monolithen zurueckschieben.

### Vorhandener Stand

Im Repository gibt es bereits ein `AGENTS.md` mit allgemeinen Projektregeln fuer Tools, Assets und Workflows.

### Spaeter sinnvoll

Zusaetzlich ein spezifisches `Lucid Editor/AGENTS.md`, das nur fuer den neuen Editor gilt.

### Inhalt eines spaeteren Editor-spezifischen AGENTS

- keine neuen Monolith-Dateien
- datengetriebene Library als Standard
- Sprite-Format nicht stillschweigend aendern
- `CHANGELOG.md` bei groesseren Aenderungen pflegen
- neue Features gegen `BRAINSTORMING.md` und `PLAN.md` pruefen
- bei Architekturthemen erst Doku aktualisieren, dann Code

## 9. Editor-UX, die spaeter wichtig wird

Nicht sofort alles, aber wahrscheinlich spaeter wichtig:

- Suche in der Library
- Thumbnail-Ansichten
- Multi-Select
- Duplizieren
- Undo und Redo
- Snapping und Grid
- Copy und Paste
- Kontextmenues
- Favoriten oder zuletzt verwendet
- Tastaturkuerzel
- Property-Overrides pro Instanz
- Sichtbarkeits- und Sperrlogik fuer Ebenen und Gruppen

## 10. Prioritaeten fuer die naechsten konzeptionellen Runden

### Zuerst genauer ausarbeiten

1. Library-Struktur
2. Sprite-Format
3. Projektformat fuer Speichern und Laden
4. Exportmodell fuer Runtime und Spiel

### Danach

5. Partikel- und Effektmodell
6. Such-, Preview- und Drag-and-Drop-UX
7. AGENTS- und Git-Workflow

## 11. Offene Entscheidungen

- exakte Ordnerstruktur fuer Library und Asset-Packs
- exaktes Sprite-Manifestformat
- Umgang mit projektlokalen versus globalen Assets
- Verhalten von Drag and Drop bei unvollstaendigen Importen
- ob und wann Partikel direkt im Editor bearbeitet werden
- wie stark SpriteMapper spaeter integriert werden soll
- wann eine echte Runtime parallel aufgebaut wird
