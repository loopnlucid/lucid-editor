# Logic Foundation

## Status

Diese Datei beschreibt die aktuell festgelegten V1-Regeln fuer technische `logic`-Objekte und moegliche spaetere `logic`-Presets.

## Rolle von `logic`

- `logic` steht in V1 fuer technische Gameplay-Objekte auf der Map.
- Dazu gehoeren Marker, Triggerzonen und kollisionsrelevante Flaechen.
- `logic` ist bewusst vom rein visuellen Typ `graphic` getrennt.

## Grundsatz in V1

Primitive technische Logikobjekte werden in V1 **geometry-first direkt im Level** erzeugt und nicht primaer als Library-Items angelegt.

Das bedeutet:

- Rechtecke, Polygone oder spaeter Punkt-/Markerobjekte werden zuerst im Level erstellt.
- Die semantische Zuweisung wie `solid`, `hazard`, `checkpoint` oder `ladder` erfolgt danach im Inspector.
- Die Library bleibt fuer `logic` weiterhin moeglich, aber eher fuer **wiederverwendbare Logic-Presets** oder spaetere technische Prefabs.

### Konsequenz

- Nicht jedes technische Levelobjekt muss zuerst als Library-Eintrag existieren.
- Primitive technische Volumen sind damit naeher an klassischer Editor-Geometrie als an Asset-Platzierung.

## V1-Untertypen

V1 startet mit diesem Kern-Set:

- `spawn`
- `checkpoint`
- `solid`
- `one-way`
- `ladder`
- `hazard`

## Geometrie

- Rechteck ist die **Standardform**.
- Polygon ist in V1 **optional** moeglich.
- Marker und Flaechen koennen je nach Untertyp unterschiedlich gedacht sein.
- Primitive `logic`-Objekte entstehen in V1 direkt im Level.
- Der eigentliche `logic`-Typ wird nach dem Erzeugen ueber Eigenschaften oder Inspector zugewiesen.
- Neue primitive technische Geometrie startet im Editor-Workflow zunaechst mit `solid` als vorausgewaehltem Standardtyp und kann danach ueber Eigenschaften angepasst werden.

## Spawn

- `spawn` ist in V1 kein spezieller Projektwert, sondern ein direkt platzierbares technisches Levelobjekt.
- Pro Level ist genau **ein** Start-Spawn erlaubt.
- Wenn ein zweiter `spawn` gesetzt wird, erscheint ein Modal mit bewusster Entscheidung.
- Der Nutzer soll dabei:
  - den alten Spawn behalten koennen
  - den neuen Spawn setzen und den alten ersetzen koennen
  - die Aktion abbrechen koennen

## Checkpoint

- Ein `checkpoint` ist eine **Zone/Flaeche**, kein blosser Punkt.
- Ein Checkpoint-Objekt enthaelt:
  - die Aktivierungszone
  - einen separaten Respawn-Punkt
- Mehrere Checkpoints pro Level sind erlaubt.
- Zur Laufzeit merkt sich das Spiel spaeter den zuletzt aktivierten Checkpoint als aktuellen Respawn-Punkt.

## Solid

- `solid` ist in V1 immer **voll blockierend von allen Seiten**.

## One-Way

- `one-way` wird in V1 bewusst allgemeiner gedacht als die klassische Nur-von-oben-Plattform.
- Eine feste Richtungsangabe bestimmt, von welcher Seite blockiert wird.
- Zulaessige Richtungswerte in V1:
  - `up`
  - `down`
  - `left`
  - `right`

## Ladder

- `ladder` ist in V1 eine **Kletter-Zone**.
- V1 modelliert nur die Grundfunktion:
  - wenn sich die Figur in der Zone befindet, ist Klettern moeglich
- Komplexere Ein- und Ausstiegsregeln sind spaeter Aufgabe der Runtime.

## Hazard

- `hazard` bedeutet in V1 einfach **toedlich**.
- Feingranulare Schadensarten oder Schadenswerte werden spaeter ergaenzt.

## Platzierungsregeln

- Placement Rules sollen grundsaetzlich pro technischem Objekttyp oder spaeterem Preset moeglich sein.
- Das erste konkrete V1-Beispiel dafuer ist `spawn` mit maximal einer Instanz pro Level.

## Rolle von `logic` in der Library

- Die Library muss in V1 **nicht** der Standardweg fuer primitive technische Zonen sein.
- Ein `logic`-Eintrag in der Library ist eher fuer spaetere Wiederverwendung gedacht, zum Beispiel:
  - vordefinierte Trigger-Setups
  - komplexere technische Prefabs
  - speicherbare Presets aus bereits gezeichneten Logic-Objekten
