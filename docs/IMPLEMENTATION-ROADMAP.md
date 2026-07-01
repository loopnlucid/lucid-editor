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
- `[x]` Canvas-Grundrenderer mit Kamera, Zoom und einfacher Entity-Auswahl
- `[x]` Linkes Ebenenpanel mit aktivem Layer, Sichtbarkeit und Sperre
- `[x]` Rechte Inspector-Grundflaeche als frueher Prototyp
- `[x]` Beispiel-Library im Editorzustand
- `[x]` Einfaches Platzieren, Verschieben und Loeschen von Instanzen
- `[x]` Einfaches JSON-Speichern und JSON-Laden
- `[x]` Ausfuehrliche Foundations fuer Datenmodell, UI-Workflow und Projektformat

### Noch nicht umgesetzt

- `[ ]` Echte `Project View` als eigener Workspace
- `[ ]` Mehrlevel-Projektmodell im laufenden Code
- `[ ]` Rechte Sidebar nach neuem V1-Schnitt mit `Info`, `Eigenschaften`, `Library`, `Level Settings`
- `[ ]` Werkzeugsystem mit `Markieren`, `Verschieben`, `Pan`, `Rectangle`, `Polygon`, `Zoom`
- `[ ]` Geometry-first-Erzeugung fuer technische Zonen
- `[ ]` `Undo/Redo`
- `[ ]` Getrennter `Playtest`-Modus
- `[ ]` Manifestbasierte projektweite Library auf Dateisystemebene
- `[ ]` Projektweite Versions- und Formatpflege im Codefluss

## Empfohlene Bau-Reihenfolge

### Phase 1: Prototyp an V1-Grundschnitt angleichen

- `[~]` Bestehende UI-Struktur auf die dokumentierte Shell ausrichten
- `[~]` Aktuelles Editor-State-Modell schrittweise an das dokumentierte Projekt- und Levelmodell heranfuehren
- `[ ]` Toolbar-Logik auf echte Werkzeuge statt Einzelbuttons umstellen
- `[ ]` Inspector in die dokumentierten Sektionen aufteilen

### Phase 2: Erster wirklich benutzbarer Level Editor

- `[ ]` Werkzeugsystem mit Shortcuts `M`, `V`, `H`, `R`, `P`, `Ctrl+Enter`, `Esc`
- `[ ]` Normale Auswahl, Mehrfachauswahl per `Shift`, Verschieben, Loeschen
- `[ ]` `Rectangle` und `Polygon` fuer technische Levelobjekte
- `[ ]` Typzuweisung und Bearbeitung fuer `solid`, `hazard`, `ladder`, `one-way`, `spawn`, `checkpoint`
- `[ ]` `Level Settings` fuer Bounds, Kamera, Hintergrund und Meta
- `[ ]` `Undo/Redo` fuer Inhaltsaenderungen und `Level Settings`

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

1. Toolbar auf echtes Werkzeugmodell umstellen
2. Rechte Sidebar auf `Info`, `Eigenschaften`, `Library`, `Level Settings` schneiden
3. `Rectangle` und `Polygon` implementieren
4. `Undo/Redo` fuer Kernaktionen einfuehren
5. Einen ersten minimalen spielbaren Slice mit Figur, `spawn` und `solid` vorbereiten
6. Danach Speichern/Laden auf das dokumentierte Levelmodell heben

## Pflege-Regel

- Dieses Dokument zeigt den **Umsetzungsstatus**.
- `docs/PLAN.md` und `docs/foundations/` bleiben die **fachliche Richtung**.
- `docs/CHANGELOG.md` erklaert **was sich geaendert hat**.
- `VERSION.json` ist die **aktuelle Versionsquelle**.
