# Library Foundation

## Status

Diese Datei dokumentiert die aktuell getroffenen Grundentscheidungen fuer das Library-System von Lucid Editor.

## V1-Grundmodell

- V1 startet mit einer **projektlokalen Library**.
- Alles, was importiert oder angelegt wird, gehoert zunaechst nur zum aktuellen Projekt.
- Diese Library ist **projektweit gemeinsam** und nicht pro Level getrennt.
- Eine fest gekoppelte globale Library ist fuer V1 nicht vorgesehen.
- Spaeter sollen **Library-Packs** exportiert und in andere Projekte importiert werden koennen.

## Datengetriebener Ansatz

- Library-Objekte sind standardmaessig **datengetrieben**.
- Kein JavaScript-File pro Objekt als Standardmodell.
- Der Standardfall ist ein Item-Ordner mit Manifest und Assets.
- Optionaler Code fuer Sonderverhalten ist spaeter moeglich, aber nicht Teil des V1-Grundmodells.

## Begriffe

- **Asset**
  Rohdatei wie PNG, Sprite-Sheet oder JSON.
- **Library-Item**
  Wiederverwendbare Definition in der Library.
- **Entity-Instanz**
  Konkrete Platzierung eines Library-Items auf der Canvas.
- **Sprite-Definition**
  Animations-, Pivot- und Hitbox-Beschreibung eines Sprite-Items.

## Item-Typen in V1

V1 startet bewusst grob mit drei erweiterbaren Grundtypen:

- `graphic`
- `sprite`
- `logic`

Wichtig:

- `logic` bleibt als technischer Grundtyp erhalten.
- Primitive technische Zonen oder Marker muessen in V1 jedoch **nicht** zwingend zuerst als Library-Item existieren.
- Die Library ist bei `logic` eher fuer spaetere Wiederverwendung, Presets und technische Prefabs gedacht.

Spaetere Typen wie `effect`, `collision`, `trigger`, `audio` oder weitere Spezialisierungen bleiben moeglich, werden aber noch nicht als eigenstaendige Haupttypen gefuehrt.

## Ablage im Projekt

- Ein Ordner entspricht genau **einem** Library-Item.
- Die Library wird nach Typen getrennt abgelegt.
- Beispielpfade:
  - `library/graphics/baum-001/`
  - `library/sprites/hero-001/`
  - `library/logic/checkpoint-preset-001/`

## Import-Grundsaetze

- Importierte Dateien werden in den jeweiligen Item-Ordner **kopiert**.
- Das Projekt soll moeglichst in sich geschlossen bleiben.
- Relative Pfade werden gegenueber dem Item-Ordner gespeichert.

## Drag and Drop

- Drop auf die **Canvas**:
  Datei wird importiert und direkt als neue Instanz platziert.
- Drop in die **Library**:
  Datei wird importiert, aber nicht automatisch auf der Canvas platziert.

## Such- und Ordnungsmodell

- `label`, `description` und `tags` sind Teil des Library-Modells.
- Tags sind in V1 freie Werte, aber bei automatischem PNG-Import zunaechst leer.
- Die Library soll spaeter Suche und Realtime-Filterung bekommen.

## Performance-Grundsatz

- Auch das Library-Modell muss performancefreundlich bleiben.
- Assets werden wiederverwendet statt mehrfach eingebettet.
- Grosse Bilddaten sollen nicht als Base64 in Projektdateien vervielfaeltigt werden.
