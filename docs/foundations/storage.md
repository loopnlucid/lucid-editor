# Storage And Manifests Foundation

## Status

Diese Datei beschreibt die aktuell festgelegten V1-Regeln fuer Speicherung und Library-Manifeste.

Details zum eigentlichen `project.json`-Aufbau liegen zusaetzlich in `project-format.md`.

## Hybrid-Speicherstrategie

Lucid Editor verwendet in V1 ein Hybrid-Modell:

- `project.json`
  enthaelt Projektzustand, Szene, Layer, Instanzen und editorbezogenen Zustand
- `manifest.json` im Item-Ordner
  ist die **Quelle der Wahrheit** fuer das jeweilige Library-Item

### Browserbasierte Uebergangsbruecke

- Solange die projektweite Dateisystem-Library mit echten Item-Ordnern und `manifest.json` noch nicht live angebunden ist, darf der browserbasierte Save/Load-Zwischenstand die aktuell geladenen Library-Definitionen temporaer **inline im gespeicherten Snapshot** mittragen.
- In diesem Zwischenstand darf ein im Sprite-Editor erzeugtes Sprite sein gepacktes Sheet als **Data-URL** direkt im Library-Item (`sheet`) tragen, damit es ohne Dateisystem sofort in der Library erscheint und platzierbar ist. Das ist bewusst die Bruecke; das Zielbild bleibt der relative Pfad zum Sheet im Item-Ordner.
- Diese Brueckenform ist bewusst **nur eine Zwischenstufe** fuer den browserbasierten Prototyp.
- Das Zielbild fuer V1 bleibt trotzdem:
  - `project.json` referenziert projektweite Library-Eintraege
  - die eigentlichen Library-Definitionen leben in den jeweiligen `manifest.json`-Dateien

## Rollenverteilung

### `project.json`

- enthaelt die zentralen Projektdaten fuer mehrere Levels und den wichtigen Editorzustand
- fuehrt eine projektweite Library-Registry
- verweist auf Library-Items, statt ihre Asset-Daten vollstaendig zu duplizieren
- Details dazu sind in `project-format.md` festgehalten
- Im browserbasierten Zwischenstand darf `project.json` beziehungsweise der exportierte Snapshot die aktuell geladenen Library-Daten voruebergehend inline spiegeln, bis die Dateisystem-Registry real angeschlossen ist.

### `manifest.json`

Beschreibt das jeweilige Library-Item selbst:

- Typ
- Name
- optionale Beschreibung
- Tags
- Dateipfade
- typspezifische Daten wie Groesse, Animationen oder Logic-Untertyp

## Gemeinsame Manifest-Felder

Alle Library-Items teilen in V1 einen gemeinsamen Kern:

- `schemaVersion`
- `version`
- `type`
- `id`
- `label`
- `description`
- `tags`
- `createdAt`
- `updatedAt`

Zusatzregeln:

- `description` ist optional.
- `tags` ist immer als Feld vorhanden, auch wenn es leer ist.
- `type` steht explizit im Manifest und wird nicht nur aus dem Ordner abgeleitet.

## Dateipfade

- Der Pfad zur Hauptdatei steht explizit im Manifest.
- Pfade werden nur **relativ zum Item-Ordner** gespeichert.
- Keine absoluten Systempfade.

## Was V1 bewusst noch nicht speichert

- Kein allgemeines `enabled`- oder `active`-Feld fuer Library-Items
- Kein verpflichtendes `source`- oder `importInfo`-Feld
- Keine eingebetteten grossen Base64-Bilddaten als Standardstrategie

## Typspezifische Speicherregeln

### `graphic`

- Speichert die Hauptbilddatei explizit, z. B. `image.png`
- Speichert die originale Groesse als gemeinsames `size`-Objekt

### `sprite`

- Speichert den Pfad zum Sprite-Sheet explizit
- Speichert Animationen, Pivot, Rolle und optionale Hitbox-Daten

### `logic`

- Beschreibt in V1 vor allem optionale wiederverwendbare `logic`-Presets oder spaetere technische Prefabs
- Primitive technische `logic`-Objekte werden in V1 primaer direkt auf Projekt-/Instanzebene erwartet
- Geometrische Instanzdaten und die konkrete Typzuweisung liegen fuer primitive Zonen primär bei den Level-Entities
- Platzierungsregeln wie `spawn max 1` gehoeren konzeptionell weiter zum Logic-Modell
