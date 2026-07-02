# Lucid Editor Implementation Roadmap

Dieses Dokument ist die **Umsetzungsansicht** des Projekts.  
Hier steht nicht die komplette Produktvision, sondern:

- was bereits umgesetzt ist
- was als naechster Coding-Block ansteht
- in welcher Reihenfolge der Editor sinnvoll weitergebaut werden soll

## Status-Legende

- `[x]` umgesetzt
- `[~]` als naechster Block geplant oder aktiv in Arbeit
- `[ ]` noch offen

## Umgang mit bestehendem Code

- Die bestehende Ordnerstruktur unter `Lucid Editor/` bleibt die Arbeitsbasis.
- Der aktuelle Implementierungsstand wird als **ersetzbarer Prototyp** behandelt, nicht als unangreifbare Zielarchitektur.
- Die Dokumentation ist die fachliche Quelle der Wahrheit. Wenn bestehender Code dem dokumentierten V1-Schnitt widerspricht, wird er schrittweise ersetzt statt aus Bequemlichkeit konserviert.
- Behalten werden sollen vor allem:
  - die Projektstruktur
  - das Dokumentationssystem
  - sinnvolle Utilities und wiederverwendbare Canvas-Helfer
- Nicht kuenstlich mitgeschleppt werden sollen veraltete Prototyp-Teile wie fruehe State-, Inspector-, Toolbar- oder Persistenzlogik, wenn sie dem dokumentierten Ziel im Weg stehen.
- Umbauten erfolgen **in place** im bestehenden `Lucid Editor/` statt als dritter paralleler Editor-Neustart.
- Ueberholte Dateien und Module sollen nach erfolgreichem Ersatz zeitnah entfernt werden. Es sollen bewusst **keine Dateileichen und keine konkurrierenden Zweitsysteme** entstehen.
- Referenzdateien wie alte Editor-Staende duerfen nur als klar erkennbare Referenz bestehen bleiben, nicht als zweite Wahrheit neben dem neuen Code.

## Stand heute

### Bereits umgesetzt

- `[x]` Neuer modularer Startpunkt unter `Lucid Editor/`
- `[x]` MVC-nahe Grundstruktur mit `model`, `views`, `controllers`, `services`, `config`
- `[x]` Browserbasierter Editor-Prototyp ohne Framework
- `[x]` UI-Shell entlang des dokumentierten Level-Editor-Schnitts mit linker Workspace-Navigation, oberer Werkzeugleiste, rechter Sidebar und unterer Statusleiste
- `[x]` Canvas-Grundrenderer mit Kamera, Bounds, Haupt-/Nebenraster, Layern und erster technischer Geometrie
- `[x]` Linkes Ebenenpanel mit aktivem Layer, Sichtbarkeit und Sperre
- `[x]` Rechte Sidebar nach V1-Schnitt mit `Info`, `Eigenschaften`, `Library` und `Level Settings`
- `[x]` Werkzeugleiste mit `Markieren`, `Verschieben`, `Pan`, `Zoom`, `Rectangle` und `Polygon`
- `[x]` Beispiel-Library im Editorzustand mit Suche, Auswahldetails und zentrierter Platzierung
- `[x]` Aktives Multi-Level-nahes Projektmodell im laufenden Code mit `levels`, `startLevelId`, `editorState` und levelbezogenen `bounds`, `cameraStart`, `settings`
- `[x]` Geometry-first-Erzeugung fuer erste `logic`-Zonen als Rechteck und Polygon mit Default-Typ `solid`
- `[x]` Einfaches Platzieren, Verschieben, Mehrfachauswahl per `Shift`, Loeschen und erste Eigenschaftenbearbeitung
- `[x]` `Undo/Redo` fuer Kernaktionen und `Level Settings`
- `[x]` Browser-Speichern und Laden auf Basis des neuen Projektzustands mit Legacy-Migration des alten Prototypformats
- `[x]` Ausfuehrliche Foundations fuer Datenmodell, UI-Workflow und Projektformat

### Noch nicht umgesetzt

- `[ ]` Echte `Project View` als eigener Workspace
- `[ ]` Getrennter `Playtest`-Modus
- `[ ]` Manifestbasierte projektweite Library auf Dateisystemebene
- `[x]` Direkte Formbearbeitung bestehender Rechtecke und Polygone auf der Canvas
- `[ ]` Vollstaendige Spawn-/Checkpoint-Regeln inklusive Ersetzungsdialog, Respawn-Punkt und Playtest-Wirksamkeit
- `[ ]` Finale Registry-plus-Manifest-Persistenz ohne inline gespeicherte Library-Definitionen
- `[ ]` Projektweite Versions- und Formatpflege im kompletten Dateisystem-Flow

## Empfohlene Bau-Reihenfolge

### Phase 1: Prototyp an V1-Grundschnitt angleichen

- `[x]` Bestehende UI-Struktur auf die dokumentierte Shell ausrichten
- `[x]` Aktuelles Editor-State-Modell auf das dokumentierte Projekt- und Levelmodell anheben
- `[x]` Toolbar-Logik auf echte Werkzeuge statt Einzelbuttons umstellen
- `[x]` Inspector in die dokumentierten Sektionen aufteilen

### Phase 2: Erster wirklich benutzbarer Level Editor

- `[~]` Werkzeugsystem mit Shortcuts `M`, `V`, `H`, `R`, `P`, `Ctrl+Enter`, `Esc`
- `[x]` Normale Auswahl, Mehrfachauswahl per `Shift`, Verschieben, Loeschen
- `[x]` `Rectangle` und `Polygon` fuer technische Levelobjekte
- `[~]` Typzuweisung und Bearbeitung fuer `solid`, `hazard`, `ladder`, `one-way`, `spawn`, `checkpoint`
- `[~]` `Level Settings` fuer Bounds, Kamera, Hintergrund und Meta
- `[x]` `Undo/Redo` fuer Inhaltsaenderungen und `Level Settings`

### Phase 3: Frueher spielbarer Slice

- `[ ]` Sehr einfacher `Playtest` frueh vorziehen, sobald die Kernwerkzeuge und technische Zonen minimal stehen
- `[ ]` Eine einfache Spielfigur in einem simplen Level laufen und springen lassen
- `[ ]` Solide Kollision mit `solid`-Zonen
- `[ ]` Start am `spawn`
- `[ ]` Sehr einfache Kamera fuer den Testlauf
- `[ ]` Fokus auf Motivation und schnelles Fuehlen des Editors, nicht auf schon vollstaendige Runtime-Tiefe

### Phase 4: Persistenz auf das echte Projektmodell bringen

- `[ ]` `project.json` auf Multi-Level-Projektstruktur umstellen
- `[ ]` Projektweite Library-Registry einfuehren
- `[ ]` Levelweise `layers` und `entities` speichern
- `[ ]` Editorzustand wie aktives Level, Kamera und offene Sektionen sauber speichern
- `[ ]` Bestehenden Download/Upload-Flow auf das neue Modell umstellen

### Phase 5: Project View bauen

- `[ ]` Eigener Workspace fuer Projektuebersicht
- `[ ]` Kachelansicht fuer Levels mit Thumbnail, Auswahl und Doppelklick zum Oeffnen
- `[ ]` `Neues Level` als erste Kachel
- `[ ]` Level sortieren, Start-Level setzen, aktiv/inaktiv, duplizieren, loeschen
- `[ ]` Projektweite Toolbar-Aktionen fuer Oeffnen, Speichern und spaetere Projektfunktionen

### Phase 6: Playtest als separaten Modus ausbauen

- `[ ]` Den fruehen spielbaren Slice zu einem klar getrennten In-Editor-Playtest ausbauen
- `[ ]` Kleine Playtest-Leiste mit `Zurueck` und `Vollbild`
- `[ ]` Vollbild nur aus laufendem In-Editor-Playtest heraus
- `[ ]` Spawn-, Kamera- und Checkpoint-Startlogik nach dokumentierter V1-Regel
- `[ ]` Maus-Inspektion im Playtest: Zoom direkt, Pan ueber gedruecktes Mausrad

### Phase 7: Dateisystem und echte Library-Struktur

- `[ ]` Projektordnerstruktur mit Item-Ordnern und `manifest.json` anbinden
- `[ ]` Echte Bild- und Sprite-Assets statt nur Prototyp-Daten einbinden
- `[ ]` Browser-Fallback fuer Upload/Download beibehalten
- `[ ]` Optionalen `File System Access API`-Adapter als Komfortschicht ergaenzen

## Naechster konkreter Coding-Block

Wenn wir schnell zu einer ersten belastbaren Basis kommen wollen, ist der naechste Block:

1. Direkte Canvas-Bearbeitung fuer bestehende Rechtecke und Polygone nachziehen
2. `spawn` und `checkpoint` als vollwertige technische Objekt-Workflows vervollstaendigen
3. Den ersten minimalen Playtest mit Figur, `spawn` und `solid` wirklich anschliessen
4. Solide Kollision und einfache Kamera fuer diesen Testlauf integrieren
5. Browser-Speichern/Laden vom aktuellen Brueckenformat weiter in Richtung finalem `project.json` schieben

## Pflege-Regel

- Dieses Dokument zeigt den **Umsetzungsstatus**.
- `docs/PLAN.md` und `docs/foundations/` bleiben die **fachliche Richtung**.
- `docs/CHANGELOG.md` erklaert **was sich geaendert hat**.
- `VERSION.json` ist die **aktuelle Versionsquelle**.
