# Project Format Foundation

## Status

Diese Datei beschreibt die aktuell festgelegten V1-Regeln fuer `project.json`, Level, Layer, Entity-Instanzen und editorbezogenen Projektzustand.

## Rolle von `project.json`

`project.json` ist die zentrale Projektdatei fuer:

- Levels
- Layer
- platzierte Instanzen
- wichtigen Editorzustand
- Referenzen auf die projektweite Library des Projekts

Wichtig:

- `project.json` ist **nicht** die Quelle der Wahrheit fuer die Library-Item-Definitionen.
- Diese Rolle bleibt bei den einzelnen `manifest.json`-Dateien der Library-Items.
- Das Projekt als Ganzes bleibt uebertragbar, wenn der komplette Projektordner weitergegeben wird.

## V1-Grundsatz

- `project.json` speichert **mehrere Levels plus wichtigen Editorzustand**.
- Die projektlokale Library wird ueber eine **explizite projektweite Registry** referenziert.
- Verwendet- und ungenutzt-Status von Library-Items werden **nicht gespeichert**, sondern aus den Instanzen abgeleitet.

### Wichtige Uebergangsbruecke im aktuellen Browser-Stand

- Solange die manifestbasierte Dateisystem-Library noch nicht aktiv angebunden ist, darf der browserbasierte Save/Load-Zwischenstand die aktuell geladenen Library-Definitionen temporaer **inline im gespeicherten Snapshot** mitfuehren.
- Diese Brueckenstrategie ersetzt **nicht** das langfristige Ziel eines registry- plus manifestbasierten Projektformats.
- Sobald der Dateisystem-Flow steht, bleibt die Registry wieder die alleinige projektweite Wahrheit fuer Library-Referenzen innerhalb von `project.json`.

## Projektweiter Kern

Feine Felder koennen sich spaeter noch erweitern, aber V1 sollte mindestens diese Bereiche tragen:

- `schemaVersion`
- `version`
- `meta`
- `projectSettings`
- `library`
- `startLevelId`
- `levels`
- `editorState`

### Empfohlene Bedeutung

- `schemaVersion`
  Version des Projektformats
- `version`
  inhaltliche Projektversion
- `meta`
  Projektname und spaetere Projektmetadaten
- `projectSettings`
  projektweite globale Einstellungen, die nicht pro Level doppelt gepflegt werden sollen
- `library`
  projektweite Registry aller projektlokalen Library-Items
- `startLevelId`
  explizites Standard-Start-Level fuer Editor-Playtest und spaetere Runtime
- `levels`
  Sammlung der Level des Projekts
- `editorState`
  persistierbarer projektweiter Editorzustand

## Multi-Level-Grundsatz

- Ein Projekt kann in V1 **mehrere Levels** enthalten.
- Die Library ist dabei **projektweit gemeinsam**.
- Mehrere Levels koennen also dieselben Library-Items verwenden, ohne Asset-Duplikate innerhalb desselben Projekts zu erzeugen.
- Im Editor ist in V1 immer **genau ein Level aktiv bearbeitbar**.
- Nur dieses aktive Level muss gleichzeitig bearbeitet und dargestellt werden.
- Jedes Level ist in `project.json` ein eigener Block mit eigenen `layers` und eigenen `entities`.

## Projektstart

- Jedes Projekt besitzt in V1 ein explizites `startLevelId`.
- Dieses Feld legt fest, mit welchem Level Editor-Playtest und spaetere Runtime standardmaessig beginnen.
- Damit bleibt der Projektstart klar definiert, auch wenn die Reihenfolge der Levels spaeter geaendert wird.
- Beim Oeffnen eines Projekts im Editor soll dagegen standardmaessig das **zuletzt aktive Level** wiederhergestellt werden.
- `startLevelId` und zuletzt aktives Editor-Level bleiben damit bewusst getrennte Verantwortlichkeiten.
- `startLevelId` muss in V1 immer auf ein **aktives Level** zeigen.
- Ein inaktives Level darf nicht als projektweites Start-Level bestehen bleiben.

## Projektweite Settings

- Ein Projekt soll in V1 zusaetzlich einen allgemeinen **`projectSettings`-Block** besitzen.
- Dieser Block ist fuer globale Projekt- oder Spielvorgaben gedacht, die nicht in jedem Level einzeln gepflegt werden sollen.
- Typische Beispiele dafuer sind spaeter:
  - Zielaufloesung
  - allgemeine Physik-Defaults
  - Exportvorgaben
  - gemeinsame Runtime- oder Build-Standards
- Damit bleiben projektweite Regeln sauber von levelbezogenen `settings` getrennt.

### Zusammenspiel mit Level-Settings

- `projectSettings` liefern in V1 die **projektweiten Defaults**.
- Die `settings` eines einzelnen Levels duerfen diese Defaults **gezielt ueberschreiben**.
- Dadurch bleibt:
  - gemeinsames Verhalten zentral pflegbar
  - levelspezifische Abweichung trotzdem moeglich
- Diese Default-/Override-Logik ist die bevorzugte Grundregel fuer globale Projekt- versus Level-Einstellungen.

## Level-Modell

### Grundsatz

- Jedes Level ist ein eigener Projektbaustein mit eigenem Metadaten-Kern.
- Levels sind in V1 **untereinander noch nicht verlinkt**.
- Jedes Level besitzt eigene bearbeitbare Bounds und eine eigene Kamera-Startposition.
- Jedes Level enthaelt seine eigenen `layers` und seine eigenen `entities`.

### Level-Metadaten

Die genaue Feldliste kann noch wachsen, aber ein Level soll in V1 mindestens:

- eine stabile technische ID
- einen sichtbaren Namen
- optionale weitere Metadaten wie Version, Beschreibung, Reihenfolge oder Tags

tragen koennen.

### Level-Version

- Jedes Level darf in V1 eine eigene **inhaltliche Versionsnummer** besitzen.
- Diese ist getrennt von:
  - der `schemaVersion` des Projektformats
  - der projektweiten `version`
- Eine eigene Level-Version ist spaeter nuetzlich fuer:
  - Nachverfolgung gezielter Level-Aenderungen
  - moegliche isolierte Exporte
  - differenziertere Projektpflege in groesseren Spielprojekten

### Interne Level-Notizen

- Ein eigenes Feld fuer interne Level-Notizen oder Kommentare ist **nicht Teil von V1**.
- Solche Notizen koennen spaeter ergaenzt werden, wenn der Bedarf in der taeglichen Arbeit klar wird.
- Fuer V1 bleiben Planung und offene Punkte weiterhin in der externen Projektdokumentation.

### Level-Tags

- Levels duerfen in V1 eigene **Tags** besitzen.
- Diese Tags dienen der:
  - Organisation groesserer Projekte
  - Filterung im Editor
  - groben inhaltlichen Einordnung wie `tutorial`, `forest`, `boss` oder `draft`
- Level-Tags sind von Item-Tags getrennt und beschreiben das Level als Ganzes, nicht einzelne Library-Elemente.

### Level-Status

- Ein Level kann in V1 **aktiv oder inaktiv** sein, ohne geloescht zu werden.
- Das ist nuetzlich fuer:
  - Work-in-Progress-Levels
  - Test-Levels
  - spaeteres Ausblenden einzelner Kampagnen- oder Weltbausteine
- Der Aktivstatus eines Levels ist **getrennt** vom `startLevelId`.
- Ein inaktives Level bleibt Teil des Projekts, soll aber im normalen Projektfluss gezielt ausgeblendet oder uebersprungen werden koennen.
- Inaktive Levels sind in V1 standardmaessig **von direktem Playtest und Export ausgeschlossen**.

### Level-Duplikation

- Ein Level soll in V1 **komplett duplizierbar** sein.
- Beim Duplizieren werden Metadaten, Bounds, Layer und Entities als neue Levelkopie angelegt.
- Technische IDs des neuen Levels sowie seiner Layer und Entities muessen dabei neu erzeugt werden.
- Referenzen auf die projektweite Library bleiben erhalten, damit keine Asset-Duplikate innerhalb des Projekts entstehen.

### Level-Export

- Ein einzelnes Level soll in V1 **exportierbar** sein, ohne das komplette Projekt exportieren zu muessen.
- Das ist spaeter nuetzlich fuer:
  - isolierte Tests
  - Austausch einzelner Level
  - eine schrittweise Runtime- oder Build-Pipeline
- Auch beim Einzellevel-Export bleibt die Trennung zwischen:
  - Leveldaten
  - projektweiter Library
  - spaeterer Runtime-Aufbereitung
  wichtig.
- Beim Export eines einzelnen Levels sollen bevorzugt **nur die tatsaechlich von diesem Level verwendeten Library-Items** mitgenommen oder referenziert werden.
- Dadurch bleibt der Export schlanker und besser fuer Tests, Austausch und spaetere Build-Schritte geeignet als ein Vollverweis auf die komplette projektweite Library.
- Projektweite Defaults aus `projectSettings` sollen beim Einzellevel-Export bevorzugt bereits zu den **wirksamen finalen Levelwerten aufgeloest** werden.
- Dadurch wird ein exportiertes Einzel-Level robuster und unabhaengiger vom restlichen Projektkontext.

### Level-Playtest

- Ein einzelnes Level soll in V1 direkt aus dem Editor heraus **isoliert playtestbar** sein.
- Der taegliche Editor-Workflow soll also nicht voraussetzen, immer das komplette Projekt oder eine spaetere Vollkampagne zu starten.
- Der isolierte Playtest soll sich dabei bevorzugt auf:
  - das aktuell aktive Level
  - dessen wirksame Level-Settings
  - die dafuer benoetigten Library-Items
  stuetzen.
- Standardmaessig soll der Editor-Playtest **beim aktuell aktiven Level** starten, nicht beim projektweiten `startLevelId`.
- `startLevelId` bleibt damit weiter die Regel fuer Projektstart in spaeterer Runtime, nicht fuer den unmittelbaren Bearbeitungsfluss.
- Der direkte Editor-Playtest soll in V1 den **aktuellen ungespeicherten Arbeitsstand** des aktiven Levels verwenden.
- Ein Speichern vor jedem Playtest soll nicht erzwungen werden, damit der Iterationsfluss moeglichst schnell bleibt.
- Der Playtest soll den eigentlichen Projektzustand in V1 **nicht zurueckschreiben oder veraendern**.
- Editorzustand und Playtestzustand bleiben damit strikt getrennt, um versehentliche Projektmutationen zu vermeiden.
- Der direkte Playtest soll in V1 **am regulaeren Spawn des aktiven Levels** starten.
- Freie Testpositionen oder ad-hoc-Startpunkte sind bewusst nicht Teil von V1, damit der Playtest zunaechst reproduzierbar und nah am echten Spielfluss bleibt.
- Der direkte Playtest soll dabei **mit der Level-Startkamera** beginnen, nicht mit der zuletzt im Editor verwendeten Arbeitskamera.
- Checkpoints sollen im direkten Playtest bereits **funktional wirksam** sein.
- Nach dem Tod oder Reset soll also nicht zwangslaeufig immer nur der Start-Spawn gelten, sondern der zuletzt aktivierte Checkpoint, sofern vorhanden.
- Ein sauberer Rueckweg aus dem Playtest in den Editor ohne Neustart des gesamten Projekts oder Editors ist ebenfalls Teil des gewuenschten Grundverhaltens.
- Der direkte Playtest soll in V1 in einem **klar getrennten Playtest-Modus** laufen, nicht als unklare Mischform im normalen Editorzustand.
- Dadurch bleiben Editor-UI, Laufzeitlogik und temporaere Debug-Hilfen besser voneinander getrennt.
- Eine kleine obere Playtest-Leiste mit `Zurueck` und `Vollbild` reicht fuer V1 als sichtbarer Rahmen aus.
- Weitergehende sichtbare Playtest-Aktionen wie `Pause` oder `Debug` bleiben zunaechst ein spaeterer Ausbaupunkt.

### Level-Loeschen

- Levels sollen in V1 loeschbar sein.
- Falls ein zu loeschendes Level zugleich das aktuelle `startLevelId` ist, muss der Editor eine **Sicherheitsabfrage** anzeigen.
- Vor dem endgueltigen Loeschen muss dabei ein neues gueltiges Start-Level festgelegt oder bestaetigt werden.
- Ein automatisches stilles Umschalten des Start-Levels ohne Nutzerentscheidung soll vermieden werden.

### Level-Reihenfolge

- Levels sind in V1 **frei sortierbar**.
- Diese Reihenfolge dient der Organisation im Projekt und spaeter auch einer moeglichen Kampagnen- oder Weltstruktur.
- Die manuelle Reihenfolge bleibt **getrennt** vom `startLevelId`.
- Ein Projekt kann also ein beliebiges Start-Level besitzen, auch wenn dieses nicht an erster Stelle der Level-Liste steht.

### Level-Bounds

- Jedes Level besitzt explizite, bearbeitbare **rechteckige Bounds**.
- Diese Bounds dienen in V1 zunaechst nur als:
  - Editorrahmen
  - Kamerarahmen
- Sie sind in V1 noch **keine harte Laufzeitgrenze**.

### Level-Kamera

- Jedes Level besitzt eine eigene **Kamera-Startposition**.
- Damit kann der Editor oder spaeter die Runtime gezielt mit einem sinnvollen Einstiegsblick starten.

### Level-Hintergrund

- Jedes Level kann in V1 einen **eigenen einfachen Hintergrundwert** besitzen.
- Das ist zunaechst vor allem fuer:
  - visuelle Orientierung im Editor
  - unterschiedliche Stimmungen zwischen Levels
  - spaetere Runtime-Defaults
  gedacht.
- V1 braucht hier noch kein komplexes Material- oder Mehrschicht-System; ein einfacher Hintergrundwert pro Level reicht als Start.

### Level-Vorschau

- Jedes Level soll in V1 eine eigene **Vorschau/Thumbnail-Idee** besitzen.
- Bevorzugt ist dabei ein **automatisch erzeugtes Thumbnail**, damit die Level-Liste auch bei groesseren Projekten schnell lesbar bleibt.
- Diese Vorschau dient primaer:
  - der visuellen Orientierung im Editor
  - der schnelleren Unterscheidung aehnlicher Levels
  - spaeter moeglichen Auswahl- oder Uebersichtsansichten
- Ein manuell gepflegtes Vorschaubild ist fuer V1 nicht noetig.
- Die V1-Vorschau soll bevorzugt **um den Spawn- oder Startbereich zentriert** erzeugt werden.
- Falls ein sinnvoller Startbereich noch fehlt, darf der Editor auf einen neutralen Fallback wie die Level-Bounds oder den Kamerastart zurueckgreifen.
- Das Thumbnail soll in V1 bevorzugt **beim Speichern** des Projekts oder des Levels aktualisiert werden.
- Eine Live-Aktualisierung bei jeder kleinen Aenderung ist aus Performance-Sicht fuer V1 nicht vorgesehen.

### Level-Settings

- Jedes Level soll in V1 einen allgemeinen **`settings`-Block** besitzen.
- Dieser Block ist fuer globale Level-Eigenschaften gedacht, die **nicht** an einzelne Entities gebunden sind.
- Typische Beispiele dafuer sind spaeter:
  - Schwerkraft
  - Musik
  - Umgebungslicht
  - Kamera-Regeln
- V1 muss noch nicht alle diese Felder aktiv nutzen, aber die Struktur soll von Anfang an dafuer vorgesehen sein.

## Library-Registry in `project.json`

### Grundsatz

- `project.json` enthaelt eine **explizite Registry aller projektlokalen Library-Items**.
- Nicht nur verwendete Items, sondern **alle** Items des Projekts werden registriert.
- Das ist wichtig fuer:
  - Aufraeumen
  - Validierung
  - Weitergabe kompletter Projekte
  - spaetere Pack-Exporte

### Minimaler Registry-Eintrag

Ein Registry-Eintrag soll in V1 minimal enthalten:

- `id`
- `path`

Dabei gilt:

- `id`
  stabile technische Item-ID
- `path`
  relativer Pfad zum Item-Ordner

Beispiel:

```json
{
  "id": "baum-001",
  "path": "library/graphics/baum-001"
}
```

### Nutzungsstatus

- Ob ein Item **verwendet** oder **ungenutzt** ist, wird nicht in der Registry gespeichert.
- Der Editor berechnet diesen Status aus den Instanzen ueber alle Levels hinweg.
- Dadurch bleibt nur eine Wahrheit bestehen.

## Entity-Modell

### Grundsatz

- Entities teilen sich in V1 einen **gemeinsamen Kern**, auch wenn sie aus unterschiedlichen Quellen stammen.
- Es gibt dabei zwei gaengige Herkunftsarten:
  - library-basierte Instanzen von `graphic`- oder `sprite`-Items
  - geometry-first erzeugte primitive `logic`-Objekte direkt im Level
- Entities werden in V1 **innerhalb ihres jeweiligen Level-Blocks** gespeichert.
- Library-Definition und Instanz bleiben fuer library-basierte Inhalte strikt getrennt.
- Primitive `logic`-Objekte duerfen in V1 direkt auf Entity-Ebene leben und brauchen dafuer **kein vorgeschaltetes Library-Item**.

### Gemeinsamer Entity-Kern

Jede Entity besitzt in V1 einen gemeinsamen Kern:

- `id`
- `type`
- `name`
- `x`
- `y`
- `layerId`
- `visible`
- `locked`
- `order`
- `properties`
- optional `libraryItemId`

### Bedeutung

- `id`
  stabile technische Instanz-ID
- `type`
  grober Objektursprung wie `graphic`, `sprite` oder `logic`
- `name`
  frei bearbeitbarer sichtbarer Name der Instanz
- `x`, `y`
  Grundposition der Instanz
- `layerId`
  eindeutige Zuordnung zu genau einer Ebene
- `visible`
  Sichtbarkeit der einzelnen Instanz
- `locked`
  Sperre gegen versehentliches Bearbeiten
- `order`
  Reihenfolge innerhalb der Ebene
- `properties`
  typspezifische Zusatzdaten und Instanz-Overrides
- `libraryItemId`
  optionaler Verweis auf das zugrunde liegende Library-Item; fehlt bei geometry-first erzeugten primitiven `logic`-Objekten

### Instanz-Overrides

- Instanzen duerfen Werte des Library-Items **pro Instanz ueberschreiben**.
- Diese Abweichungen liegen in `properties`.
- Damit bleibt das Library-Item die Grunddefinition und die Entity speichert nur ihre instanzbezogenen Unterschiede.
- Primitive `logic`-Objekte speichern in `properties` dagegen vor allem:
  - ihren eigentlichen `logic`-Untertyp
  - ihre Form wie `rect`, `polygon` oder spaeter Marker-/Punktgeometrie
  - die konkrete Geometrie- oder Sonderdaten dieser Instanz

### Beispiele fuer `properties`

- Sprite gespiegelt oder nicht
- One-Way-Richtung
- Checkpoint-Respawn-Punkt
- `logicType`
- `shape`
- Rechteckgroesse
- Polygonpunkte
- spaetere weitere Instanz-Overrides

## Layer-Modell

### Grundsatz

- Layer und Entities bleiben logisch getrennt.
- Entities enthalten nur ein `layerId`, nicht die komplette Layerdefinition.
- Layer werden in V1 **innerhalb ihres jeweiligen Level-Blocks** gespeichert.

### Layer-Kern in V1

Ein Layer soll mindestens enthalten:

- `id`
- `name`
- `visible`
- `locked`
- `parallax`
- `order`

### Bedeutung

- `id`
  stabile technische Layer-ID
- `name`
  sichtbarer Name der Ebene
- `visible`
  Sichtbarkeit der Ebene
- `locked`
  Sperrstatus der Ebene
- `parallax`
  Parallax-Faktor
- `order`
  Reihenfolge der Ebene

## Persistierbarer Editorzustand

### Grundsatz

- V1 speichert **wichtigen**, aber nicht vollstaendig fluechtigen Editorzustand.
- Dinge wie Mausstatus, laufende Drag-Operationen oder Undo-History gehoeren nicht in `project.json`.

### Sinnvolle V1-Felder

Unter `editorState` oder einer vergleichbaren Struktur sollen in V1 mindestens diese Dinge abgelegt werden:

- `activeLevelId`
- `activeLayerId`
- `selectedEntityId`
- `selectedLibraryItemId`
- `camera`
- `openSections`

### Bedeutung

- `activeLevelId`
  aktuell aktives Level
- `activeLayerId`
  aktuell aktive Ebene im aktiven Level
- `selectedEntityId`
  aktuell ausgewaehlte Instanz im aktiven Level
- `selectedLibraryItemId`
  aktuell ausgewaehltes Library-Item
- `camera`
  Kameraposition und Zoom
- `openSections`
  offene oder geschlossene Bereiche im Inspector
- Der zuletzt aktive Editorzustand dient beim erneuten Oeffnen des Projekts als Arbeitskontext, ohne das projektweite `startLevelId` zu veraendern.

## Was V1 bewusst noch nicht speichert

- Undo- und Redo-History
- laufende Mausinteraktionen
- temporaere Validierungswarnungen
- berechneten Used/Unused-Status von Library-Items

## Arbeitsregel fuer spaetere Erweiterungen

Wenn neue Projektdaten dazukommen, sollte geprueft werden:

1. Gehoert die Information in `project.json` oder in ein Item-`manifest.json`?
2. Ist sie Grundzustand oder nur abgeleiteter/temporarer Zustand?
3. Erzeugt das neue Feld eine doppelte Wahrheit?
