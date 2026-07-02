# Sprites Foundation

## Status

Diese Datei beschreibt die aktuell festgelegten V1-Regeln fuer `sprite`-Items und das Lucid-Sprite-Grundmodell.

## V1-Sprite-Format

- V1 startet bewusst einfach mit:
  - **einem Sprite-Sheet**
  - **fester Frame-Breite**
  - **fester Frame-Hoehe**
- Langfristig darf das Format spaeter erweitert werden, aber V1 optimiert auf schnellen Fortschritt und gute Beherrschbarkeit.
- Lucid definiert ein **eigenes Sprite-Format**.
- `sprite_mapper.py` soll spaeter an dieses Format angepasst oder um einen passenden Export erweitert werden.

## Import

- Sprites kommen in V1 nur ueber **Sprite-Sheet plus Manifest** in die Library.
- Ein Sprite-Item steht fuer **genau ein Objekt**.
  - Beispiel: ein Character, eine Kiste, eine Lampe, ein Schalter
- Mehrere verschiedene Objekte in einem einzigen Sprite-Item sind fuer V1 nicht vorgesehen.
- Alle Animationen eines Sprites liegen in **einem** Sheet mit **einer** einheitlichen Frame-Groesse. Der lineare Frame-Index (`col = index % columns`, `row = index / columns`) ergibt sich aus der Sheet-Breite geteilt durch die Frame-Breite; `columns` muss deshalb nicht separat gespeichert werden.

## Sheet-Erzeugung

- Beim Zusammenfuehren mehrerer Quell-Clips in ein Sprite-Sheet werden alle Frames auf die **gemeinsame** Frame-Groesse gebracht.
- Das Skalieren erfolgt **pivot-gerecht** (Standard: unten mittig), damit ein Character in allen Animationen dieselbe Standhoehe hat und beim Zustandswechsel nicht springt.
- Ausgangsmaterial mit unterschiedlichen Aufloesungen pro Clip muss also normalisiert werden, nicht nur mit Rand aufgefuellt.

## Manifest-Beispiel

```json
{
  "schemaVersion": 1, "version": 1, "type": "sprite",
  "id": "hero-001", "label": "Held", "description": "", "tags": [],
  "sheet": "hero.png", "frameWidth": 192, "frameHeight": 192,
  "pivot": { "x": 0.5, "y": 1.0 }, "role": "character",
  "defaultState": "idle",
  "animations": {
    "idle": { "startFrame": 0,  "frameCount": 7, "fps": 8,  "loop": true },
    "run":  { "startFrame": 7,  "frameCount": 8, "fps": 14, "loop": true },
    "jump": { "startFrame": 15, "frameCount": 8, "fps": 12, "loop": false }
  },
  "hitbox": null, "capabilities": []
}
```

## Animationen

- Ein Sprite kann mehrere **benannte Animationen** haben.
  - Beispiel: `idle`, `run`, `jump`, `switch-on`
- V1 beschreibt Frames pro Animation zunaechst als:
  - `startFrame`
  - `frameCount`
- Jede Animation besitzt eigene:
  - `fps`
  - `loop`
- Ein Sprite besitzt einen `defaultState`, also eine Standardanimation.

## Pivot und Platzierung

- Sprites speichern einen **normierten Pivot** im Bereich `0..1`.
- Standard-Pivot in V1:
  - `0.5, 1.0`
  - also unten mittig
- Beim Platzieren eines Sprites landet der **Pivot auf der Mausposition**.
- Sprite-Instanzen werden in V1 in ihrer **nativen Frame-Groesse** platziert.

## Hitbox

- Ein Sprite kann in V1 optional genau **eine** Standard-Hitbox haben.
- Diese Hitbox ist ein **Rechteck**.
- Die Werte sind **normiert auf die Frame-Groesse**.

## Was V1 bewusst noch nicht macht

- Keine Frame-Events
- Keine freie Atlas-Geometrie
- Keine Mehrfach-Hitboxen
- Keine Skalierung pro Sprite-Instanz

## Darstellung im Editor

- Auf der Canvas spielt ein Sprite in V1 direkt seine **Standardanimation** ab.
- In der Library ist die Vorschau in V1 **statisch**.
- Die Standardvorschau kommt automatisch aus dem **ersten Frame der Standardanimation**.
- Spaeter kann optional ein eigenes Preview-Bild unterstuetzt werden.

## Spiegelung

- Horizontales Spiegeln wird in V1 unterstuetzt.
- Die Spiegelung gehoert zur **Instanz**, nicht zum Library-Item.
- Dasselbe Sprite-Item kann also mehrfach platziert und pro Instanz unterschiedlich gespiegelt werden.

## Rolle und Faehigkeiten

Ein Sprite speichert neben seinen visuellen Daten auch eine einfache semantische Einordnung.

### Rollen

V1 startet mit einer kleinen festen Rollenliste:

- `character`
- `prop`
- `switch`
- `effect`

Wichtig:

- `prop` bedeutet Weltobjekt, nicht zwingend passiv.
- Eine Kiste kann also `prop` sein und trotzdem interaktiv werden.

### Faehigkeiten

V1 startet mit einer kleinen festen Faehigkeitenliste:

- `openable`
- `breakable`
- `collectible`
- `switchable`
- `damageable`

Rolle und Faehigkeiten sind bewusst getrennt:

- Rolle beantwortet eher: **Was ist das?**
- Faehigkeiten beantworten eher: **Was kann es?**
