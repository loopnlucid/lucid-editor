# Graphics Foundation

## Status

Diese Datei beschreibt die aktuell festgelegten V1-Regeln fuer `graphic`-Items.

## Rolle von `graphic`

- `graphic` ist in V1 ein **rein visuelles** Library-Item.
- Keine Kollision.
- Keine Gameplay-Logik.
- Keine Rotation oder Skalierung in V1.

## Import

- Ein einzelnes PNG wird in V1 immer als `graphic` importiert.
- Das Item wird automatisch angelegt, ohne Pflichtdialog.
- Spaeter kann `graphic -> sprite` als bewusste Konvertierung ergaenzt werden, wenn das Sprite-System und der Sprite-Editor stehen.

## Dateibenennung und Assets

- Die importierte Hauptbilddatei bekommt im Item-Ordner einen Standardnamen wie `image.png`.
- Die originale Bildbreite und Bildhoehe werden beim Import ausgelesen und im Manifest gespeichert.
- Die Vorschau in der Library verwendet in V1 einfach die originale Bilddatei verkleinert.
- Ein separates Thumbnail ist in V1 nicht noetig.

## Automatische Metadaten

- `label` wird aus dem Dateinamen erzeugt.
  - Beispiel: `baum-gross.png` -> `baum gross`
- `id` wird automatisch erzeugt und bleibt danach stabil.
  - Beispiel: `baum-001`, `baum-002`
- `tags` sind bei automatischem Import zunaechst leer.
- `description` ist optional und spaeter editierbar.

## Platzierung auf der Canvas

- Neue `graphic`-Instanzen landen auf der aktuell aktiven Ebene.
- Platzierung erfolgt in der **Originalgroesse** des Bildes.
- Der Ursprungspunkt fuer `graphic` ist in V1 **oben links**.
- `graphic` ist in V1 weder drehbar noch skalierbar.

## Bearbeitbare Metadaten

Nach dem Import sollen mindestens diese Felder bearbeitbar sein:

- `label`
- `description`
- `tags`

## Best Practice fuer kombinierte Szenenobjekte

Grosse statische Objekte und kleine Animationen sollten moeglichst getrennt modelliert werden.

Beispiel:

- Gebaeude als `graphic`
- blinkendes Licht als separates `sprite` oder spaeter `effect`

Das ist sauberer, flexibler und in der Regel guenstiger fuer Performance als ein grosses vollanimiertes Gesamtsprite.
