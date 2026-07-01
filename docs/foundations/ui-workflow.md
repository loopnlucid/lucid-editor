# UI and Workflow Foundation

## Status

Diese Datei sammelt die aktuell entstehende Planung fuer die Hauptansichten, Arbeitsmodi, Toolbars und den uebergreifenden Bedienfluss des Lucid Editors.

Der Lucid Editor ist dabei nicht mehr nur als einzelne Canvas-Ansicht zu denken, sondern als groesseres Authoring-Tool mit mehreren klar getrennten Arbeitsbereichen.

## Zielbild

- Der Editor soll mehrere spezialisierte Ansichten oder Workspaces besitzen.
- Jede Ansicht soll einen klaren Zweck haben und nicht alle Funktionen gleichzeitig in einen einzigen Bildschirm pressen.
- Wiederkehrende Bedienmuster wie Toolbars, Icon-Sprache, Panels, Suchfelder, Statusleisten und Kontextaktionen sollen uebergreifend konsistent bleiben.
- Schwere Bereiche wie spaetere Sprite-Bearbeitung, Asset-Management und Playtest sollen den klassischen Level-Editor nicht unnoetig ueberladen.

## Arbeitsannahmen

Zum jetzigen Stand gelten fuer die weitere Planung diese Grundannahmen:

- Ein einzelner monolithischer Editorbildschirm reicht langfristig nicht aus.
- Mindestens eine Projektansicht und eine klassische Level-Editoransicht werden benoetigt.
- Ein eigener Sprite-Editor ist spaeter wahrscheinlich sinnvoll, sollte aber nicht ungeplant in die Level-Ansicht hineingemischt werden.
- Der direkte Playtest bleibt ein klar getrennter Modus.
- Performance bleibt auch auf UI-Ebene ein Querschnittsthema:
  - nicht alle schweren Panels oder Asset-Vorschauen muessen immer gleichzeitig aktiv sein
  - Thumbnail-, Preview- und Suchsysteme sollen spaeter bewusst performant geplant werden

## V1-Hauptansichten

Fuer V1 werden aktuell diese Arbeitsbereiche als verbindliche Richtung festgehalten:

- `Project View`
  echte Hauptansicht fuer Projektuebersicht, Level-Verwaltung, Start-Level, Aktivstatus, Tags, Thumbnails und globale Projekt-Settings
- `Level Editor`
  echte Hauptansicht fuer die Bearbeitung eines einzelnen aktiven Levels

Zusaetzlich gilt:

- `Library`
  ist in V1 **keine eigene Hauptansicht**, sondern zunaechst ein Bereich oder Panel des Level-Editors
- `Sprite Editor`
  ist in V1 **noch kein aktiver Arbeitsbereich**, soll aber bereits als **sichtbarer Platzhalter** in Navigation oder UI-Struktur mitgedacht werden
- `Playtest`
  bleibt ein **klar getrennter Modus** und keine dritte normale Hauptansicht

## Konsequenzen fuer V1

- Die Anzahl der echten Hauptwechsel im Editor bleibt zunaechst klein.
- Die Library wird funktional frueh wichtig, soll aber den Workspace-Wechsel in V1 noch nicht aufblaehen.
- Der sichtbare Sprite-Editor-Platzhalter hilft, die Architektur frueh auf spaetere Erweiterung auszurichten, ohne den Bereich schon voll umzusetzen.
- Projektansicht und Level-Editor muessen dafuer jeweils klar genug geschnitten werden, damit nicht doch wieder ein verdeckter Monolith entsteht.

## Verantwortung von Project View und Level Editor

Fuer V1 wird die Trennung zwischen Projektuebersicht und eigentlicher Level-Bearbeitung bewusst geschaerft:

- `Project View`
  ist primaer fuer **projektweite und organisatorische Aufgaben** gedacht
- `Level Editor`
  ist primaer fuer **levelspezifische Bearbeitung und Eigenschaften** gedacht

### Was in die `Project View` gehoert

- Uebersicht aller Levels des Projekts
- Reihenfolge der Levels
- Aktiv/Inaktiv-Status von Levels
- Start-Level-Verwaltung
- Level-Thumbnails und grobe Level-Erkennung
- projektweite Aktionen wie:
  - Projekt speichern
  - Projekt laden
  - neues Level anlegen
  - Level duplizieren
  - Level loeschen
  - spaeter Projekt-Export
- projektweite Settings und Metadaten

### Was **nicht** primaer in die `Project View` gehoert

- tiefe Detailbearbeitung einzelner Level-Eigenschaften
- normale Bearbeitung von Layern, Entities oder Canvas-Inhalten
- kleinteilige Inspector-Arbeit an Spawn, Bounds, Hintergrund, Settings oder Entity-Auswahl

### Was in den `Level Editor` gehoert

- Canvas-Bearbeitung des aktiven Levels
- Layer-Management des aktiven Levels
- Platzierung und Auswahl von Instanzen
- Inspector fuer Level-Eigenschaften des aktiven Levels
- Inspector fuer Entity-Eigenschaften und spaetere Overrides
- Arbeit mit Library, Tools und editorbezogenen Level-Funktionen

## Rolle der Project View in V1

Die Projektansicht soll in V1 also eher wie eine **organisierende Uebersichts- und Startansicht** funktionieren und nicht wie ein zweiter vollwertiger Eigenschaftseditor.

Eine visuell staerkere Level-Uebersicht mit Kacheln und Thumbnails passt gut zu dieser Richtung, solange:

- die Projektansicht nicht mit zu vielen Detailfeldern ueberladen wird
- levelspezifische Eigenschaften weiterhin im Level-Editor gepflegt werden
- der Wechsel von der Uebersicht in die Level-Bearbeitung schnell und direkt bleibt

## Darstellung der Project View in V1

Fuer V1 ist aktuell diese Richtung festgelegt:

- Die `Project View` verwendet primaer eine **feste Kachelansicht mit Level-Thumbnails**.
- Die Level-Uebersicht ist also bewusst eher visuell als tabellarisch oder inspectorlastig.

### Ziele dieser Entscheidung

- schnellere Wiedererkennung einzelner Levels
- bessere Orientierung bei wachsender Levelzahl
- klarerer Unterschied zur technischen Bearbeitungsansicht des Level-Editors

### Erwartete Inhalte pro Level-Kachel

Die genaue Dichte kann spaeter noch feinjustiert werden, aber eine Level-Kachel sollte in V1 voraussichtlich mindestens zeigen:

- Level-Thumbnail
- sichtbaren Namen
- grobe Statushinweise wie:
  - aktiv oder inaktiv
  - Start-Level
- spaeter optional kurze Metainfos wie Tags oder Versionsstand

### Interaktion mit der Level-Reihenfolge

- Die Reihenfolge der Levels soll in V1 direkt in der Kachelansicht per **Drag and Drop** veraenderbar sein.
- Die visuelle Projektuebersicht dient damit nicht nur der Auswahl, sondern auch aktiv der Organisation der Level-Abfolge.

### Vorteile dieser Richtung

- natuerlicherer Umgang mit Levelreihenfolge
- klare Verbindung zwischen visueller Kachelansicht und Projektstruktur
- weniger Umwege ueber Menues oder rein technische Listenaktionen

## Auswahlverhalten in der Project View

Fuer V1 gilt aktuell:

- Ein **einfacher Klick** auf eine Level-Kachel soll das Level **nur auswaehlen**, nicht sofort in den `Level Editor` oeffnen.
- Die Projektansicht bleibt damit staerker eine Organisations- und Verwaltungsansicht und weniger ein direkter Sprungmodus bei jeder kleinen Interaktion.

### Ziel dieser Entscheidung

- versehentliche Bereichswechsel vermeiden
- mehrere Organisationsaktionen in der Projektansicht ermoeglichen, bevor ein Level bewusst geoeffnet wird
- die Kachelansicht besser fuer Auswahl, Sortierung und Statuspflege nutzbar machen

## Oeffnen eines Levels aus der Project View

Fuer V1 wird aktuell diese Interaktion festgehalten:

- Ein Level wird aus der `Project View` per **Doppelklick auf die Kachel** im `Level Editor` geoeffnet.

### Bedeutung fuer den Workflow

- einfacher Klick = Auswahl
- Doppelklick = bewusstes Oeffnen

Damit bleibt die Projektansicht naeher an klassischer Desktop-Software und verhindert unabsichtliche Wechsel bei rein organisatorischer Arbeit.

### Bewusste Abgrenzung

- Die Kachelansicht ist keine Detailmaske fuer tiefe Level-Eigenschaften.
- Sie dient primaer der Auswahl, Organisation und schnellen visuellen Orientierung.

## Kandidaten fuer grobe Arbeitsbereiche

Diese Bereiche sind noch nicht alle final entschieden, bilden aber das aktuelle Brainstorming-Feld fuer die UI-Architektur:

- `Project View`
  Uebersicht ueber Projekt, Level-Liste, Start-Level, Aktivstatus, Tags, Level-Thumbnails, Projekt-Settings und globale Aktionen.
- `Level Editor`
  Klassische Bearbeitungsansicht fuer ein einzelnes aktives Level mit Canvas, Layern, Library, Inspector und Werkzeugen.
- `Library and Asset View`
  Groessere Verwaltungsansicht fuer Library-Items, Suche, Tags, Vorschauen, ungenutzte Items, Import und spaetere Pack-Funktionen.
- `Sprite Editor`
  Spaeterer Spezialbereich fuer Sprite-Sheets, Animationen, States, Pivot, Hitbox und Preview.
- `Playtest Mode`
  Getrennter Modus fuer schnelles Testen des aktiven Levels mit ein- und ausblendbaren Debug-Overlays.
- `Validation and Problems`
  Moeglicher Bereich fuer Warnungen, fehlende Referenzen, ungueltige Spawn-Konfigurationen, Exportprobleme oder Runtime-relevante Inkonsistenzen.
- `Export and Build`
  Spaeterer Bereich fuer Level-Export, Projekt-Export, Runtime-Ziele und Steam-relevante Build-Pipeline-Schritte.

## Uebergreifende UI-Bausteine

Unabhaengig von der finalen Anzahl an Hauptansichten werden voraussichtlich diese wiederkehrenden Bausteine wichtig:

- obere Hauptnavigation oder Workspace-Wechsel
- kontextuelle Toolbar pro Ansicht
- linke oder rechte Panel-Spalten fuer Struktur und Eigenschaften
- zentrale Arbeitsflaeche
- Such- und Filtermechanismen
- Statusleiste fuer Modus, Zoom, Auswahl, Warnungen oder Hintergrundprozesse
- konsistente Icon-Sprache fuer Standardaktionen

## Uebergreifendes Sidebar-Prinzip

Fuer V1 wird die rechte Sidebar als bewusst wiederkehrendes Bedienmuster ueber mehrere Bereiche hinweg festgehalten.

### Grundidee

- Der `Level Editor` verwendet bereits ein rechtes Eigenschafts- und Kontextpanel.
- Dieselbe UI-Sprache soll moeglichst auch in anderen Hauptbereichen wiederkehren, statt fuer jede Ansicht ein voellig anderes Bedienmuster einzufuehren.
- Dadurch bleibt der Editor ueber das gesamte Projekt hinweg konsistenter und softwareartiger.

### Aktuelle Richtung

- Die **rechte Sidebar** ist das primaere Muster fuer:
  - kontextbezogene Eigenschaften
  - Organisationsaktionen
  - Statusinformationen
  - spaetere Validierungs- oder Exporthinweise
- Der **linke Rand** bleibt primaer fuer:
  - globale Hauptnavigation
  - spaeter eventuell strukturelle Listen oder Sekundaernavigation, wenn wirklich noetig

### Konsequenz fuer die Project View

- Auch die `Project View` soll in V1 eine **rechte Sidebar** besitzen.
- Die Mitte bleibt die visuelle Kacheluebersicht der Levels.
- Die rechte Sidebar zeigt dort jedoch **keine tiefe Level-Detailbearbeitung**, sondern:
  - projektweite Aktionen
  - projektweite Einstellungen
  - Organisationsaktionen fuer das aktuell ausgewaehlte Level
  - grobe Statusinformationen

### Bewusste Abgrenzung

- Levelspezifische Feinarbeit gehoert weiterhin in den `Level Editor`.
- Die Project-View-Sidebar ist also eher ein **Kontext- und Organisationspanel** als ein vollwertiger Ersatz fuer den Level-Inspector.

## Uebergreifendes Shell-Konzept

Fuer die weitere UI-Planung wird der Lucid Editor als wiederkehrende Grundschale gedacht:

- links eine globale Hauptnavigation
- in der Mitte die eigentliche Arbeitsflaeche des aktuellen Bereichs
- rechts eine kontextbezogene Sidebar
- oben eine bereichsbezogene Haupttoolbar
- unten eine kompakte Leiste fuer Status, Modus oder kontextuelle Zusatzinfos

### Bedeutung der Leisten

- Die **obere Toolbar** enthaelt pro Hauptbereich die wichtigsten direkten Aktionen und Werkzeuge.
- Die **untere Leiste** dient eher als Status-, Info- oder Modusleiste und nicht als zweite schwere Aktionssammlung.

### Nutzung der unteren Statusleiste in V1

- Die untere Leiste wird in V1 bewusst **schlank** gehalten.
- Sie dient primaer fuer:
  - kurze Statusmeldungen
  - kontextuelle Hinweise
  - Rueckmeldungen zu blockierten oder ungueltigen Aktionen
- Permanente technische Live-Werte wie Mausposition, Zoom oder Layerdaten stehen in V1 nicht im Vordergrund dieser Leiste.

### Kleine dauerhafte Zoom-Anzeige

- Trotz der schlanken Statusleiste darf der aktuelle Zoomwert in V1 als **kleine unaufdringliche Prozentanzeige** sichtbar sein.
- Die Zoom-Anzeige gehoert damit zu den wenigen permanenten Orientierungswerten, die fuer die Canvas-Arbeit direkt relevant bleiben.

### Beispiele

- `Project View`
  obere Toolbar fuer Dinge wie Projekt oeffnen, Projekt speichern, neues Level, Level duplizieren oder spaeter Projekt-Export
- `Level Editor`
  obere Toolbar fuer Editorwerkzeuge wie Auswaehlen, Verschieben, spaeter Rotieren, Zeichen- oder Platzierungsmodi
- alle Bereiche
  rechte Sidebar fuer Kontext und Eigenschaften des aktuell relevanten Objekts oder Bereichs

### Tooltips fuer iconbasierte Toolbars

- Da die oberen Toolbars in V1 bewusst iconbasiert gedacht sind, sollen die Icons bei Hover **kurze Text-Tooltips** zeigen.
- Das gilt insbesondere fuer den `Level Editor`, kann aber als allgemeines UI-Prinzip auch auf andere Hauptbereiche uebernommen werden.
- Ein Tooltip soll dabei nicht nur den Namen des Werkzeugs oder der Aktion zeigen, sondern zusaetzlich einen **kurzen Einzeiler zur Funktion** enthalten.
- Wenn fuer ein Werkzeug oder eine Aktion bereits ein Tastaturkuerzel existiert, soll dieses ebenfalls im Tooltip sichtbar sein.

### Ziel dieser Entscheidung

- bessere Verstaendlichkeit trotz kompakter Icon-Sprache
- geringere Einstiegshuerde bei weniger offensichtlichen Werkzeugen
- mehr Photoshop-/Desktop-Feeling ohne textlastige Werkzeugleisten

### Ziel dieser Richtung

- konsistentes Bediengefuehl ueber alle Bereiche hinweg
- klare Trennung zwischen:
  - globaler Navigation
  - direkter Werkzeugbedienung
  - inhaltlicher Arbeitsflaeche
  - Kontext und Eigenschaften
  - Status und Rueckmeldung

## Trennung von Level-Eigenschaften zwischen Project View und Level Editor

Die bisherige Entscheidung wird praezisiert, nicht aufgehoben.

Es gibt zwei sinnvolle Ebenen von Level-Eigenschaften:

- **organisatorische Level-Metadaten**
  - Name
  - Aktiv/Inaktiv
  - Start-Level-Status
  - Reihenfolge
  - Tags
  - eventuell kurze Beschreibung
- **tiefe editorische Level-Eigenschaften**
  - Bounds
  - Kamera-Start
  - Hintergrund
  - Level-Settings
  - spaeter gameplay-relevante Levelparameter

### Konsequenz

- Die `Project View` darf fuer das ausgewaehlte Level in der rechten Sidebar **organisatorische Eigenschaften** zeigen und bearbeiten.
- Die **tiefe Bearbeitung** des Levels bleibt weiterhin Aufgabe des `Level Editor`.

Damit widerspricht sich die Planung nicht:

- Projektansicht = Auswahl, Organisation, Projektfluss
- Level-Editor = eigentliche Level-Arbeit und tiefe Konfiguration

## Rechte Sidebar der Project View in V1

Die rechte Sidebar der `Project View` wird in V1 bewusst kompakt gehalten und in zwei aufklappbare Hauptbereiche geschnitten:

- `Project`
- `Selected Level`

### Bedeutung der beiden Bereiche

- `Project`
  enthaelt projektweite Informationen und Aktionen wie:
  - Projektname und grobe Projektmetadaten
  - Projekt speichern oder laden
  - spaeter projektweite Settings oder Exportbezug
- `Selected Level`
  enthaelt organisatorische Metadaten und Kontextinformationen des aktuell ausgewaehlten Levels, zum Beispiel:
  - Name
  - Aktiv/Inaktiv
  - Start-Level-Status
  - Tags
  - Reihenfolge oder grobe Statusanzeige

### Bewusste Grenzen

- Es gibt in V1 keinen dritten schweren Sidebar-Block nur fuer Aktionen.
- Tiefe Level-Konfiguration bleibt weiterhin im `Level Editor`.
- Die Sidebar der `Project View` bleibt damit lesbar und konsistent mit dem kompakten Desktop-Charakter des Editors.

## Obere Toolbar der Project View in V1

Fuer V1 wird die obere Toolbar der `Project View` bewusst schlank gehalten.

### Grundrichtung

- Die obere Toolbar dient primaer **projektweiten Hauptaktionen**.
- Typische Inhalte sind:
  - neues Projekt
  - Projekt oeffnen
  - Projekt speichern
- Die obere Toolbar soll dabei bewusst **iconbasiert** und nicht als Reihe grosser Text-Schaltflaechen gedacht werden.
- Die Bildsprache soll naeher an klassischen Desktop-Tools und Bildbearbeitungsprogrammen liegen als an webtypischen Formularleisten.
- Tiefe Level-Organisation soll nicht vollstaendig in die obere Toolbar wandern.

### Konsequenz

- Level-spezifische Organisationsaktionen werden in V1 nicht nur ueber die obere Toolbar geloest.
- Die Projektansicht bleibt damit aufgeraeumt und vermeidet eine zu breite horizontale Aktionsleiste.

### Ableitung fuer das Gesamtsystem

- Auch spaetere Haupt-Toolbars anderer Bereiche sollen bevorzugt iconbasiert gedacht werden.
- Text bleibt wichtig fuer Tooltips, Statusinfos und Sidebar-Beschriftungen, aber nicht als primaere Form der Hauptwerkzeugleiste.

## Obere Toolbar des Level Editors in V1

Die obere Toolbar des `Level Editors` wird fuer V1 bewusst als **schlanke Kernwerkzeugleiste** geplant.

### Grundrichtung

- In V1 sollen dort nur die wichtigsten direkten Editorwerkzeuge liegen.
- Beispiele dafuer sind spaeter:
  - Auswaehlen
  - Pan
  - Verschieben
  - Zoom
  - Rechteck
  - Polygon
  - Playtest
- Zusaetzlich gehoeren in V1 auch **direkte `Undo`- und `Redo`-Schaltflaechen** in diese obere Werkzeugleiste.
- Erweiterte Ansichts-, Grid-, Snap-, Layer- oder Exportfunktionen sollen die obere Leiste in V1 noch nicht aufblasen.

### Ziel dieser Entscheidung

- ruhigerer Einstieg
- klarere Werkzeugidentitaet
- weniger visuelle Ueberladung
- bessere Erweiterbarkeit spaeter, wenn weitere Werkzeuge wirklich benoetigt werden

### Anordnung in der Leiste

- Die Kernwerkzeuge des `Level Editors` sollen in V1 als **kompakte Werkzeuggruppe links** in der oberen Toolbar angeordnet werden.
- Diese Richtung ist bewusst naeher an klassischer Desktop-Software und Bildbearbeitungsprogrammen als an verteilten Web-Headern.

### Vorteile

- klare visuelle Werkzeugheimat
- schnellerer Muskelgedaechtnis-Effekt
- mehr Ruhe im restlichen Toolbar-Bereich fuer spaetere Zusatzfunktionen oder Statusanzeigen

## Werkzeugbedeutung im Level Editor

Damit die Toolbar spaeter nicht semantisch unsauber wird, gelten fuer V1 aktuell diese Grundbedeutungen:

- `Markieren`
  dient der Auswahl von Entities, Shapes oder spaeter Mehrfachauswahlen
- `Pan`
  verschiebt die Ansicht oder Kamera des Editors und ist bewusst **nicht** dasselbe wie Objektbewegung
- `Move`
  bewegt die aktuell ausgewaehlten Objekte oder Geometrien auf der Canvas
- `Zoom`
  veraendert den Kameramassstab der Arbeitsansicht
- `Rectangle`
  erstellt rechteckige Geometrie fuer technische Volumen oder spaetere Formen
- `Polygon`
  erstellt polygonale Geometrie fuer technische Volumen oder spaetere freie Formen
- `Playtest`
  wechselt in den getrennten Playtest-Modus

## Naechster Vertiefungsblock

Nach dem Grundschnitt von Auswahl, Verschieben, Library und Layern wird als naechster UI-Block bewusst **`Pan` und Canvas-Navigation** vertieft.

### Grund fuer diese Reihenfolge

- die Canvas-Navigation haengt direkt mit dem Werkzeugset des Level-Editors zusammen
- der Arbeitsfluss auf grossen Levels wird davon stark beeinflusst
- Performance- und Bedienfragen treffen sich an dieser Stelle frueh

## Naechster Vertiefungsblock nach Canvas-Navigation

Nach der Vertiefung von `Pan`, `Zoom`, Grid, Bounds und technischer Canvas-Orientierung wird als naechster groesserer UI-Block bewusst die **`Playtest-UI`** weiter ausgearbeitet.

### Grund fuer diese Reihenfolge

- Der direkte Playtest ist bereits als getrennter Modus definiert, braucht aber noch einen klaren sichtbaren UI-Rahmen.
- Viele Grundentscheidungen zu Levelstart, Kamera, Checkpoints, Debug-Overlays und Rueckkehr in den Editor stehen bereits und koennen jetzt in eine konsistente Oberflaechenlogik ueberfuehrt werden.
- Der Editor ist funktional inzwischen weit genug, dass die Frage nicht mehr lautet, **ob** es einen Playtest gibt, sondern **wie** er sich sauber anfuehlt.

## Playtest-UI in V1

### Zweistufiges Playtest-Modell

- Der getrennte `Playtest` wird in V1 als **ein gemeinsamer Moduskern mit zwei Darstellungen** gedacht.
- Es gibt also **nicht** zwei voellig getrennte Testsysteme, sondern:
  - einen **In-Editor-Playtest**
  - und zusaetzlich einen **Vollbildmodus** auf derselben technischen Basis

### In-Editor-Playtest

- Das Spiel laeuft dabei weiterhin **im Editorfenster**, aber in einem klaren Playtest-Zustand statt im normalen Bearbeitungsmodus.
- Toolbars, Sidebars und sonstige normale Editor-Bereiche treten dabei weitgehend zurueck oder verschwinden.
- Waehlen, Bearbeiten und normale Editorinteraktion sind waehrend dieses Zustands nicht aktiv.
- Zulaessig bleiben nur klar abgegrenzte Playtest- und Inspektionsinteraktionen.
- Fuer V1 bleibt dabei eine **kleine eigene obere Playtest-Leiste** sichtbar.
- Diese Leiste enthaelt bewusst nur:
  - `Zurueck`
  - `Vollbild`
- Weitergehende sichtbare Playtest-Aktionen wie `Pause` oder `Debug` gehoeren in V1 noch nicht zu dieser Kernleiste.

### Vollbild-Playtest

- Zusaetzlich kann derselbe Playtest in einen **Vollbildmodus** wechseln.
- Dieser Vollbildmodus ist keine separate zweite Runtime, sondern nur eine staerker reduzierte Darstellung desselben Playtest-Zustands.
- Damit bleibt der Workflow konsistent, waehrend trotzdem ein saubereres intensiveres Testgefuehl moeglich wird.
- Der Vollbildmodus wird in V1 dabei **nicht** als eigener direkter Startpfad aus dem normalen Editor gedacht.
- Stattdessen beginnt der Ablauf bewusst mit dem **In-Editor-Playtest**.
- Erst aus diesem laufenden Playtest heraus darf dann in den Vollbildmodus umgeschaltet werden.

### Viewport-Verhalten waehrend des Playtests

- Waehrend des Playtests bleibt eine **mausbasierte Viewport-Inspektion** moeglich.
- `Pan` und `Zoom` dienen dort nicht als Editor-Bearbeitung, sondern als kontrollierte Betrachtungs- und Debug-Hilfe auf den laufenden Testzustand.
- Diese Inspektionsfunktionen bleiben in V1 bewusst **direkt verfuegbar** und brauchen keinen zusaetzlichen Umschaltmodus.
- `Zoom` darf dabei weiterhin direkt ueber die ueblichen Mauswege genutzt werden.
- `Pan` wird waehrend des Playtests bewusst an das **gedrueckte Mausrad** gebunden, damit die normale Spielinteraktion klar von der Viewport-Inspektion getrennt bleibt.
- Dadurch kann der Nutzer den Testlauf beobachten, ohne den eigentlichen Editor wieder zu oeffnen oder in den Bearbeitungsmodus zurueckkehren zu muessen.

### Standard-Shortcuts fuer Kernwerkzeuge

Fuer V1 werden fuer die wichtigsten Werkzeuge feste Standard-Shortcuts vorgesehen:

- `M`
  `Markieren`
- `V`
  `Verschieben`
- `H`
  `Pan`
- `R`
  `Rectangle`
- `P`
  `Polygon`
- `Ctrl+Enter`
  `Playtest`

### `Undo` und `Redo` als Kernfunktion

- `Undo` und `Redo` gehoeren in V1 **zum grundlegenden Editor-Workflow**.
- Der Editor wird also nicht als reine Einweg-Bearbeitungsoberflaeche gedacht, sondern muss zentrale Arbeitsschritte sicher rueckgaengig und wiederherstellbar machen.
- Das gilt als Voraussetzung fuer fluessige Canvas-Arbeit, selektive Korrekturen und den Verzicht auf uebermaessig viele Sicherheitsdialoge bei normalen Bearbeitungsschritten.
- `Undo` und `Redo` beziehen sich in V1 bewusst nur auf **echte Inhaltsaenderungen**.
- Dazu gehoeren z. B.:
  - Platzieren
  - Loeschen
  - Verschieben
  - Formaenderungen
  - Aenderungen an Eigenschaften
- Auch Aenderungen an den **`Level Settings`** gehoeren in V1 in diesen inhaltlichen Undo/Redo-Bereich.
- Reine UI-Zustaende wie Werkzeugwechsel, Auswahlwechsel oder aufgeklappte Panels gehoeren in V1 **nicht** in diesen Undo-Stack.
- Die Undo/Redo-History bleibt in V1 **level-lokal**.
- Jeder geoeffnete Level-Editor arbeitet also mit seiner eigenen Bearbeitungshistorie statt mit einer projektweiten gemeinsamen History ueber alle Levels hinweg.
- Auch der Wechsel in den getrennten `Playtest`-Modus veraendert diese History in V1 **nicht**.
- `Playtest` gilt dabei als separater Moduswechsel und nicht als inhaltliche Bearbeitungsaktion mit eigenem Undo-Schritt.

### Standard-Shortcuts fuer `Undo` und `Redo`

- Fuer V1 werden zusaetzlich die ueblichen Bearbeitungs-Shortcuts festgehalten:
  - `Ctrl+Z`
    `Undo`
  - `Ctrl+Y`
    `Redo`
- Dieselben beiden Aktionen sollen in V1 zusaetzlich als **zwei eigene Buttons in der oberen Toolbar des Level Editors** sichtbar sein.

### Allgemeiner Ruecksetz-Shortcut

- `Esc` dient in V1 als allgemeiner **Abbrechen-/Zurueck-zum-neutralen-Zustand-Shortcut**.
- Typische Anwendungsfaelle sind:
  - laufendes Zeichenwerkzeug abbrechen
  - temporaere Werkzeugzustaende verlassen
  - bestehende Auswahl aufheben
  - Modals oder kontextuelle Ueberlagerungen schliessen, sofern sinnvoll

### Konsequenz fuer auswahlgebundene Sidebar-Bereiche

- Wenn `Esc` eine bestehende Auswahl aufhebt, verschwinden die auswahlgebundenen Bereiche **`Info`** und **`Eigenschaften`** unmittelbar wieder.
- Damit bleibt der neutrale Editorzustand auch visuell konsistent.

### Ziel dieser Belegung

- kurze und gut merkbare Direktzugriffe
- naeher an klassischer Editor- und Desktop-Software
- konsistente Verbindung zwischen Toolbar, Tooltip und Tastaturfluss

### Bewusste Trennung von `Pan` und `Move`

- `Pan` und `Move` bleiben in V1 zwei getrennte Werkzeuge.
- `Pan` betrifft die Arbeitsansicht.
- `Move` betrifft Inhalte auf der Arbeitsflaeche.

### Ausloesung von `Pan`

Fuer V1 werden bewusst mehrere gleichwertige Wege unterstuetzt, um die Canvas-Navigation fluessig zu halten:

- ueber das aktive Werkzeug `Pan`
- temporaer ueber gedrueckte `Space`-Taste
- direkt ueber die Maus-Mitteltaste beziehungsweise das gedrueckte Mausrad

### Ziel dieser Kombination

- schneller Wechsel zwischen Navigation und Bearbeitung
- editor-typisches Verhalten auch fuer Nutzer mit unterschiedlicher Arbeitsweise
- weniger Reibung auf grossen Levels oder bei haeufigem Kamera-Verschieben

### Ausloesung von `Zoom`

Fuer V1 werden auch beim Zoom bewusst mehrere Wege kombiniert:

- ueber das Werkzeug `Zoom` mit **Lupen-Icon**
- ueber **`Ctrl` + Mausrad**
- ueber **`Ctrl` + `Plus`**
- ueber **`Ctrl` + `Minus`**

### Verhalten des Werkzeugs `Zoom`

- Wenn `Zoom` aktiv ist, kann auf der Canvas mit gedrueckter Maustaste horizontal gezogen werden.
- Bewegung **nach links** zoomt **hinein**.
- Bewegung **nach rechts** zoomt **hinaus**.
- Ein **Doppelklick auf das Lupen-/Zoom-Tool** setzt den Zoom in V1 wieder auf **`100%`** zurueck.

### Shortcut fuer `100%`

- Zusaetzlich setzt **`Ctrl` + `0`** den Zoom wieder auf **`100%`** zurueck.
- Eine separate Aktion **`Fit to Level`** wird in V1 vorerst bewusst **nicht** vorgesehen.

### Standard-Zoomzentrum

- Zoom ist in V1 standardmaessig auf die **aktuelle Mausposition** zentriert.
- Das gilt als Grundrichtung fuer die Canvas-Navigation, weil die Arbeit dadurch direkter und lokaler bleibt.

### Zoomcharakter in V1

- Der Zoom arbeitet in V1 **stufenlos** und nicht ueber feste Zoomstufen.
- Die Kamera soll sich damit moeglichst direkt und ohne sichtbare Spruenge anfuehlen.

### Verhalten der Editorkamera zu den Level-Bounds

- Die `Editorkamera` orientiert sich in V1 grundsaetzlich an den **Level-Bounds**.
- Sie ist dabei jedoch **nicht hart auf die Bounds begrenzt**.
- Stattdessen bleibt ein kleiner Arbeits- und Overscroll-Rand ausserhalb der Bounds erhalten.

### Wiedereinstieg in ein Level

- Beim Oeffnen oder Wiederaufrufen eines Levels springt die `Editorkamera` in V1 auf die **zuletzt genutzte Editoransicht dieses Levels**.
- Diese Arbeitsansicht bleibt bewusst getrennt von der **Level-Startkamera** fuer Playtest oder spaetere Runtime.

### Kamera auf Auswahl zentrieren

- Eine explizite Schnellaktion, die die `Editorkamera` direkt auf die aktuelle Auswahl zentriert, wird in V1 bewusst **noch nicht** vorausgesetzt.
- Diese Funktion bleibt ein spaeterer Ausbaupunkt fuer groessere Levels oder komplexere Navigationsworkflows.

### Sichtbare Orientierung zwischen Level und Aussenraum

- Die Canvas soll in V1 den eigentlichen Levelbereich und den kleinen Overscroll-Aussenraum **subtil unterscheidbar** machen.
- Die Abgrenzung soll bewusst vorhanden sein, aber visuell nicht zu laut oder technisch wirken.
- Zusaetzlich bleibt der eigentliche **Level-Bounds-Rahmen** in V1 als **subtile sichtbare Linie oder Einfassung** erkennbar.
- Dadurch ist der konkrete bearbeitbare Levelbereich nicht nur ueber Flaechenwirkung, sondern auch ueber einen klaren Rahmen lesbar.
- Der Bounds-Rahmen bleibt in V1 **statisch** und erhaelt noch **keine direkten Resize-Griffe** auf der Canvas.
- Aenderungen an den Bounds erfolgen damit weiterhin ueber die `Level Settings` und nicht ueber einen zusaetzlichen Canvas-Bearbeitungsmodus.

### Sichtbares Grid als Orientierungshilfe

- Die Canvas zeigt in V1 zusaetzlich ein **subtil sichtbares Grid** als permanente Orientierungshilfe.
- Das Grid dient in V1 **nur der visuellen Orientierung** und ist noch **nicht** automatisch mit Snapping oder Rasterzwang gekoppelt.
- Die Darstellung soll klar genug fuer raeumliche Einordnung sein, ohne die eigentlichen Levelinhalte visuell zu dominieren.
- Das Grid wird als **Haupt- und Nebenraster** aufgebaut:
  - feinere Linien fuer das normale Grundraster
  - deutlich, aber weiterhin subtil staerkere Linien in groesseren Abstaenden fuer die grobe Orientierung auf grossen Levels
- Die Farbgebung des Grids bleibt in V1 bewusst **neutral** und passt sich nicht dynamisch an unterschiedliche Level-Hintergruende an.
- Bei starkem Herauszoomen wird das Grid **adaptiv ausgeduennt**:
  - feinere Rasterlinien treten frueh zurueck
  - die groberen Hauptlinien bleiben laenger sichtbar
  - dadurch bleibt die Orientierung erhalten, ohne dass die Canvas im Fernblick zu dicht wirkt

### Ziel dieser Entscheidung

- bessere Orientierung am eigentlichen Levelrahmen
- trotzdem ausreichend Luft fuer Arbeit an Raendern und Uebergaengen
- geringere Gefahr, sich weit ausserhalb des eigentlichen Levels zu verlieren

### Sichtbarkeit von Spawn und Checkpoints

- `Spawn` und `Checkpoint`-Objekte bleiben in V1 auf der Canvas zusaetzlich ueber **klare kleine Editor-Marker** sichtbar.
- Das gilt auch dann, wenn sie technisch dem `logic`-Bereich zugeordnet sind.
- Ziel ist, dass zentrale Gameplay-Punkte beim normalen Editieren schnell erkennbar bleiben und nicht erst ueber Auswahl oder Playtest-Overlays sichtbar werden.
- Die Marker bleiben dabei nicht nur symbolisch, sondern tragen zusaetzlich **kurze lesbare Labels**.
- Beispiele waeren:
  - `Spawn`
  - `CP1`
- `CP2`
- Dadurch bleiben mehrere Checkpoints auch bei groesseren Levels schneller unterscheidbar.

### Sichtbarkeit technischer Zonen

- Technische Zonen wie `solid`, `hazard`, `ladder` und `one-way` bleiben in V1 auf der Canvas **dauerhaft leicht eingefaerbt** sichtbar.
- Die Einfaerbung dient primaer der schnellen Lesbarkeit waehrend des Levelbaus und nicht als finaler Runtime-Look.
- Damit werden technische Flaechen sofort als solche erkennbar und muessen nicht erst selektiert oder ueber ein Sonder-Overlay eingeblendet werden.
- Die visuelle Staerke dieser Einfaerbung wird in V1 als **mittelstark transparent** gedacht:
  - klar genug fuer schnelle Orientierung
  - aber nicht so dominant, dass Sprites, Graphics oder der eigentliche Levelaufbau visuell untergehen

### Bearbeitung gezeichneter Geometrie

- Bereits gezeichnete `Rectangle`- und `Polygon`-Zonen bleiben in V1 **direkt auf der Canvas bearbeitbar**.
- Rechtecke sollen dabei ueber ihre Kanten oder Ecken anpassbar sein.
- Polygone sollen ueber ihre einzelnen Punkte weiter bearbeitet werden koennen.
- Die Formbearbeitung bleibt damit dort, wo sie visuell am klarsten ist, statt in umstaendliche rein numerische Nebenwege verschoben zu werden.
- Der Wechsel in diese aktive Formbearbeitung erfolgt in V1 **direkt ueber die normale Auswahl**:
  - Form auswaehlen
  - Bearbeitungsgriffe erscheinen unmittelbar
- Ein zusaetzliches eigenes Bearbeiten-Werkzeug oder ein gesonderter Doppelklick-Modus wird dafuer in V1 nicht vorausgesetzt.
- Bei Polygonen bleibt V1 in der Punktbearbeitung bewusst noch schlank:
  - bestehende Punkte duerfen verschoben werden
  - neue Punkte werden noch nicht hinzugefuegt
  - bestehende Punkte werden noch nicht geloescht
- Im Werkzeug `Markieren` bleibt die Trennung zur Bewegung bewusst streng:
  - Klicks in die Flaeche einer ausgewaehlten Form bewegen sie noch nicht
  - ganze Formen werden nur ueber das Werkzeug `Verschieben` als Ganzes bewegt
  - `Markieren` dient damit weiter Auswahl und Griffbearbeitung, nicht dem impliziten Drag-Move

### Ziel dieser Zoom-Regeln

- unterschiedliche Arbeitsweisen werden direkt unterstuetzt
- Maus, Tastatur und Werkzeugleiste greifen konsistent ineinander
- die Canvas-Navigation bleibt auch bei grossen Levels fluessig

### Bewusste Trennung von `Markieren` und `Verschieben`

- `Markieren` dient in V1 primaer der Auswahl.
- `Verschieben` dient in V1 primaer der bewussten Bewegung bereits ausgewaehlter Inhalte.
- Die beiden Werkzeuge bleiben damit funktional klar getrennt und werden nicht zu einem impliziten Mischmodus zusammengezogen.

### Grundverhalten von `Verschieben`

- Das Werkzeug `Verschieben` arbeitet in V1 primaer ueber **direktes Draggen auf der Canvas**.
- Die Bewegung soll sich damit natuerlich und editorisch unmittelbar anfuehlen.
- Die Bewegung erfolgt in V1 dabei zunaechst **frei ohne Grid- oder Snap-Zwang**.
- Bei Mehrfachauswahl darf `Verschieben` in V1 **alle aktuell ausgewaehlten Objekte gemeinsam** bewegen.
- Das gilt als grundlegender Editor-Workflow und wird nicht auf Einzelobjekte oder bestimmte Typkombinationen eingeschraenkt.
- Gesperrte Objekte sollen dabei gar nicht erst Teil einer Mehrfachauswahl werden.
- Dadurch braucht `Verschieben` in V1 keine Sonderbehandlung fuer gemischte Auswahlen aus gesperrten und ungesperrten Objekten.

### Kein direktes Duplizieren auf der Canvas in V1

- Ein unmittelbares Duplizieren bereits ausgewaehlter Objekte direkt auf der Canvas gehoert in V1 **noch nicht** zum Kernworkflow.
- Vervielfaeltigung von Inhalten soll fuer diesen ersten Stand nicht ueber zusaetzliche Dupliziergesten oder spezialisierte Schnellaktionen im Editor erfolgen.
- Damit bleibt der Objekt-Workflow in V1 bewusst etwas schlanker und vermeidet fruehe Zusatzlogik rund um Kopien, Versatz und Mehrfachinstanzen aus bestehender Auswahl.

### Direktes Loeschen ausgewaehlter Objekte

- Das direkte Loeschen bereits ausgewaehlter Objekte oder Formen gehoert in V1 **zum normalen Canvas-Workflow**.
- Fuer das Entfernen von Inhalten soll also kein Umweg ueber ausschliesslich rechte Sidebar oder Spezialmenues noetig sein.
- Dadurch bleibt die Bearbeitung auf der Canvas fuer normale Korrekturen und Aufraeumarbeiten ausreichend direkt.
- Eine zusaetzliche Sicherheitsabfrage wird fuer dieses normale Objektloeschen in V1 **nicht** vorausgesetzt.
- Das Loeschen soll sich damit wie eine typische direkte Editoraktion anfuehlen und nicht bei jedem kleinen Bereinigungsschritt bremsen.

### Trefferverhalten von `Markieren`

- Wenn sich mehrere Objekte unter dem Mauszeiger ueberlagern, gilt in V1 zunaechst die einfache Regel:
  - **das oberste getroffene Objekt gewinnt**
- Ein zyklisches Durchschalten verdeckter Treffer wird fuer V1 noch nicht vorausgesetzt.

### Kein eigenes `Place`-Werkzeug in V1

- Ein separates `Place`-Werkzeug wird fuer V1 **nicht** als primaeres Kernwerkzeug festgehalten.
- Der Hauptweg fuer Platzierung ist:
  - Library-Item auswaehlen oder ziehen
  - auf die Canvas ziehen oder dort platzieren
- Dadurch wird kein zusaetzlicher Werkzeugmodus nur fuer etwas benoetigt, das bereits stark an die Library gekoppelt ist.

### Bedeutung von `Rectangle` und `Polygon`

- `Rectangle` und `Polygon` definieren in V1 zuerst nur die **Geometrie**.
- Ob daraus ein:
  - `solid`
  - `hazard`
  - `checkpoint`
  - `ladder`
  oder ein anderer technischer Typ wird, entscheidet sich **erst nach dem Zeichnen**.

### Darstellung in der Toolbar

- `Rectangle` und `Polygon` erscheinen in V1 als **zwei getrennte direkte Icons** in der Kernwerkzeugleiste.
- Sie werden also nicht hinter einem einzigen Sammelwerkzeug oder Untermenue versteckt.

### Vorteil dieser Richtung

- klarer fuer Einsteiger
- schneller erreichbar
- besser passend zum geometry-first-Workflow fuer technische Levelobjekte

## Seitenaufteilung des Level Editors in V1

Fuer V1 wird der `Level Editor` bewusst asymmetrisch geschnitten:

- **links**
  - `Layers`
- **mitte**
  - Canvas und eigentliche Bearbeitungsflaeche
- **rechts**
  - gemeinsame Sidebar mit:
    - `Info`
    - `Eigenschaften`
    - `Library`
    - `Level Settings`
    - `Info`

### Begruendung

- `Layers` sollen beim Platzieren und Bearbeiten immer sichtbar bleiben.
- Die `Library` soll nicht denselben Platz wie `Layers` teilen, damit beim Ziehen aus der Library die aktive Ebenenstruktur gleichzeitig sichtbar bleibt.
- Ein eigener `Scene`-Baum wird fuer V1 bewusst noch nicht als fester Sidebar-Bereich vorausgesetzt.

### Schnellaktionen im Bereich `Layers`

Der linke Bereich `Layers` soll in V1 nicht nur die Layerliste zeigen, sondern auch kleine direkte Schnellaktionen bereitstellen.

#### Oberhalb oder im Kopf des Layer-Bereichs

- iconbasierte Aktion `Neu`
- iconbasierte Aktion `Loeschen`

#### Direkt am einzelnen Layer-Eintrag

- Icon fuer `sichtbar`
- Icon fuer `gesperrt`

### Ziel dieser Entscheidung

- die Layerliste bleibt kompakt, aber handlungsfaehig
- haeufige Organisationsschritte benoetigen keine zusaetzlichen Menues
- Sichtbarkeit und Sperrstatus bleiben direkt dort, wo man sie beim Arbeiten erwartet

### Reihenfolge der Layer

- Die Reihenfolge der Layer wird in V1 direkt per **Drag and Drop innerhalb der Layerliste** veraendert.
- Die Layerliste dient damit nicht nur der Sichtbarkeit und Auswahl, sondern auch aktiv der Z-Organisation des aktiven Levels.

### Klickverhalten in der Layerliste

- Ein einfacher Klick auf einen Layer setzt in V1 **nur den aktiven Layer**.
- Der Klick waehlt dabei nicht automatisch alle Objekte dieser Ebene aus.

### Ziel dieser Entscheidung

- weniger versehentliche Massenselektionen
- klarere Trennung zwischen Ebenenkontext und Objektselektion
- besser passend zum Library- und Platzierungsworkflow

### Darstellung des aktiven Layers

- Der aktive Layer wird in V1 **direkt in der Layerliste visuell hervorgehoben**.
- Ein zusaetzlicher separater Hinweis oberhalb der Liste ist dafuer nicht vorgesehen.

### Einfuegen neuer Layer

- Ein neuer Layer wird in V1 standardmaessig **am Ende der bestehenden Layerliste** angelegt.
- Das Verhalten bleibt damit einfach, vorhersehbar und ohne implizite Sonderlogik bezogen auf den aktuell aktiven Layer.

### Loeschen von Layern

- Das Loeschen eines Layers erfolgt in V1 **nur mit Sicherheitsabfrage**.
- Damit soll verhindert werden, dass Ebenen und ihre zugeordneten Inhalte versehentlich verloren gehen.

### Verhalten von `sichtbar` und `gesperrt`

- Das Umschalten von `sichtbar` und `gesperrt` wirkt in V1 **sofort**.
- Fuer diese haeufigen Editoraktionen ist keine zusaetzliche Bestaetigung vorgesehen.

### Gesperrte Layer als Arbeitsebene

- Ein gesperrter Layer darf in V1 **trotzdem als aktuelle Arbeitsebene ausgewaehlt** werden.
- Seine Inhalte bleiben dabei gesperrt, **nicht bearbeitbar** und **nicht auswaehlbar**.

### Bedeutung dieser Entscheidung

- die Ebenenstruktur bleibt auch im gesperrten Zustand klar adressierbar
- der Nutzer verliert nicht den Bezug dazu, wohin neue Inhalte oder Kontextaktionen zeigen
- Sperren verhindert Bearbeitung, aber nicht Orientierung oder Kontextwahl

### Ausgeblendete Layer als Arbeitsebene

- Ein ausgeblendeter Layer kann in V1 **nicht** als aktuelle Arbeitsebene dienen.
- Damit wird vermieden, dass auf Inhalte gearbeitet wird, die gleichzeitig unsichtbar sind.

### Verhalten beim Ausblenden des aktiven Layers

- Wird der aktuell aktive Layer ausgeblendet, erfolgt in V1 **kein automatischer Wechsel** auf einen anderen Layer.
- Stattdessen muss der Nutzer bewusst einen neuen sichtbaren Layer als Arbeitsebene auswaehlen.

### Bedeutung dieser Entscheidung

- kein implizites oder ueberraschendes Umschalten des Arbeitskontexts
- klarere Kontrolle ueber Ebenenwechsel
- kurzfristig kann damit ein Zustand ohne aktive sichtbare Arbeitsebene entstehen, bis bewusst ein neuer Layer gewaehlt wird

### Voraussetzungen fuer neue Platzierungen

- Neue Objekte oder neue Geometrie duerfen in V1 **nur** auf einen Layer eingefuegt werden, der:
  - sichtbar ist
  - nicht gesperrt ist
- Ein gesperrter Layer kann zwar aktuelle Arbeitsebene sein, ist aber **kein gueltiges Ziel fuer neue Platzierungen**.
- Ein ausgeblendeter Layer ist ebenfalls **kein gueltiges Ziel fuer neue Platzierungen**.

### Verhalten bei blockierter Platzierung

Wenn kein gueltiges Platzierungsziel vorhanden ist, wird die Platzierung in V1 blockiert. Das gilt einheitlich fuer mehrere Einfuegewege.

#### Drag and Drop aus der `Library`

- Der Mauszeiger soll beim Ueberfahren der Canvas mit blockierter Platzierung in ein **Verbots-Symbol** wechseln.
- Das signalisiert direkt, dass auf den aktuellen Layer nichts abgelegt werden kann.

#### Doppelklick auf ein `Library`-Item

- Doppelklick auf ein Library-Item darf in diesem Fall **nicht** still scheitern.
- Stattdessen erscheint eine **Modal-Nachricht**, dass auf die aktuelle Ebene nichts platziert werden kann.
- Dasselbe Verhalten gilt sowohl fuer:
  - ausgeblendete Layer
  - gesperrte Layer

#### `Rectangle` und `Polygon` aus der Toolbar

- Auch beim Start eines Rechteck- oder Polygon-Werkzeugs wird die Erstellung blockiert, wenn der aktuelle Layer kein gueltiges Ziel ist.
- Der Mauszeiger soll dabei ebenfalls das **Verbots-Symbol** zeigen.

#### Zusaetzlicher Statushinweis

- Ergaenzend zum Verbots-Symbol soll in V1 ein **kurzer Statushinweis** erscheinen, warum die Platzierung blockiert ist.
- Dieser Hinweis gehoert bevorzugt in die untere Statusleiste, zum Beispiel:
  - `Aktiver Layer ist gesperrt`
  - `Kein sichtbarer Ziel-Layer`

### Ziel dieser Entscheidung

- einheitliches Verhalten ueber Library- und Werkzeug-Workflows hinweg
- fruehes visuelles Feedback statt stiller Fehler
- klare Regel: Platzierung braucht immer einen sichtbaren und entsperrten Ziel-Layer

### Rolle des Bereichs `Info`

- `Info` ist ein zusaetzlicher, eher lesender Kontextbereich fuer die aktuelle Auswahl.
- Dort stehen Informationen ueber das ausgewaehlte Objekt, ohne dass alles sofort als editierbares Feld im Bereich `Eigenschaften` landen muss.
- Typische Inhalte koennen spaeter sein:
  - Typ des Objekts
  - technische ID
  - Herkunft oder Bezug
  - kurze Hilfetexte oder Hinweise
  - kontextuelle Statusinformationen

### Trennung von `Eigenschaften` und `Info`

- `Eigenschaften` ist fuer **bearbeitbare Werte** gedacht.
- `Info` ist fuer **einordnende und beschreibende Informationen** gedacht.
- Diese Trennung soll verhindern, dass der Inspector zu einem einzigen unruhigen Mischblock aus Editierfeldern und Metadaten wird.

### Darstellungsprinzip der rechten Sidebar

- Die Bereiche `Info`, `Eigenschaften`, `Library` und `Level Settings` werden in V1 als **klappbare Sektionen** innerhalb derselben rechten Sidebar dargestellt.
- Es wird dafuer in V1 bewusst **kein Tab-System** verwendet.

### Reihenfolge der Sektionen

Fuer V1 wird aktuell diese Reihenfolge festgehalten:

- `Info`
- `Eigenschaften`
- `Library`
- `Level Settings`

### Sichtbarkeitsregeln

- `Info` und `Eigenschaften` werden **nur angezeigt**, wenn sie fuer die aktuelle Auswahl wirklich gebraucht werden.
- `Library` und `Level Settings` sind dagegen **permanente Bereiche** der rechten Sidebar.

Das bedeutet zum Beispiel:

- bei leerer Auswahl:
  - `Library` sichtbar
  - `Level Settings` sichtbar
  - `Info` ausgeblendet
  - `Eigenschaften` ausgeblendet
- bei ausgewaehltem Objekt:
  - `Info` sichtbar
  - `Eigenschaften` sichtbar
  - `Library` weiter sichtbar
  - `Level Settings` weiter sichtbar

### Startzustand der Sektionen

- In V1 starten die sichtbaren rechten Sidebar-Sektionen des `Level Editors` standardmaessig **alle eingeklappt**.
- Das gilt auch fuer die permanenten Bereiche `Library` und `Level Settings`.

### Bedeutung dieser Entscheidung

- der Editor startet ruhiger und kompakter
- Nutzer oeffnen gezielt nur die Bereiche, die sie fuer den aktuellen Arbeitsschritt brauchen
- die rechte Sidebar behaelt auch bei kleineren Aufloesungen mehr Luft

### Verhalten der `Library` beim Platzieren

- Wenn im `Level Editor` aus der `Library` Objekte platziert werden, soll die Sektion in V1 **offen bleiben**.
- Das gilt bewusst auch dann, wenn mehrere Instanzen desselben oder unterschiedlicher Library-Items nacheinander gesetzt werden.

### Ziel dieser Entscheidung

- fluessigerer Platzierungs-Workflow
- weniger wiederholtes Auf- und Zuklappen
- besser fuer typische Serienarbeit wie mehrere Baeume, Kisten oder Dekoelemente nacheinander

### Interaktionsmodell der `Library`

Fuer V1 wird der Umgang mit Library-Items im `Level Editor` aktuell so geschnitten:

- **Drag and Drop**
  - zieht ein Library-Item direkt auf die Canvas und platziert es dort
- **Einfachklick**
  - waehlt das Library-Item aus
  - oeffnet zusaetzlichen Bearbeitungskontext fuer dieses Item
- **Doppelklick**
  - platziert das Library-Item direkt auf der Canvas
  - Zielposition ist zunaechst die Mitte des aktuell sichtbaren Kameraausschnitts

### Ziel dieser Entscheidung

- Drag and Drop bleibt der natuerliche direkte Platzierungsweg
- Einfachklick kann fuer Sichtung und Bearbeitung des Library-Items genutzt werden
- Doppelklick bietet eine schnelle platzierungsorientierte Alternative ohne Ziehen

### Darstellung innerhalb der `Library`-Sektion

- Die `Library` zeigt in V1 zunaechst eine **kompakte Liste von Items**.
- Jeder Eintrag soll bewusst dicht und uebersichtlich bleiben.
- Typische sichtbare Informationen pro Eintrag sind:
  - kleine Vorschau
  - Bezeichnung
  - optionale kleine Zusatzinfo wie Typ oder aehnlicher Kurzkontext

### Groesse und Scrollverhalten der `Library`

- Die `Library`-Sektion darf in V1 die Sidebar nicht unkontrolliert in die Hoehe treiben.
- Sie soll daher nur einen **begrenzten Anteil der Viewport-Hoehe** einnehmen und innerhalb dieses Bereichs **eigenstaendig scrollen**.
- Als Arbeitswert wird fuer V1 eine maximale Hoehe von **etwa `50vh`** festgehalten.
- Es soll sich dabei bewusst **nicht** die gesamte rechte Sidebar wegen langer Library-Inhalte bewegen muessen.

### Suche in der `Library`

- Das Suchfeld der `Library` soll innerhalb der `Library`-Sektion **immer oben sichtbar** bleiben.
- Die Suche ist damit waehrend des Scrollens der Library-Liste permanent praesent.
- Suchfeld und Listeninhalt gehoeren also zum selben Section-Block, aber nur die eigentliche Item-Liste scrollt darunter weiter.

### Aufklappverhalten einzelner Library-Items

- Ein **Einfachklick** auf ein Library-Item klappt genau diesen Eintrag innerhalb der `Library`-Sektion auf.
- Die anderen Items werden dadurch nach unten geschoben.
- Das geoeffnete Item kann auch wieder eingeklappt werden.
- In V1 darf dabei **immer nur ein Library-Item gleichzeitig** aufgeklappt sein.

### Bearbeitung direkt im Item-Eintrag

- Die editierbaren Eigenschaften eines Library-Items sollen in V1 **direkt innerhalb des aufgeklappten Library-Eintrags** erscheinen.
- Dafuer wird **keine eigene zusaetzliche Sidebar-Sektion** benoetigt.

### Vorteil dieser Richtung

- Library-Kontext bleibt kompakt zusammen an einem Ort
- kein Springen zwischen Listenbereich und separatem Item-Inspector
- klarere Trennung zwischen:
  - Bearbeitung von Library-Definitionen in der `Library`
  - Bearbeitung von platzierten Objekten im Bereich `Eigenschaften`

### Warum diese Richtung

- naeher am bisherigen Editorverhalten
- mehrere relevante Bereiche koennen gleichzeitig sichtbar bleiben
- weniger Kontextwechsel als bei umschaltenden Tabs
- gut anschlussfaehig an den kompakten Desktop-Charakter des Editors

## Rechte Sidebar des Level Editors

Die rechte Sidebar des `Level Editors` soll in V1 nicht in viele objektspezifische Sonderbloecke zerfallen, sondern einem generischen Eigenschaften-Prinzip folgen.

### Grundrichtung

- Der zentrale Kontextbereich der rechten Sidebar heisst **`Eigenschaften`**.
- Dieser Bereich zeigt immer die Eigenschaften der **aktuellen Auswahl**.
- Er soll nicht nur fuer Shapes gelten, sondern fuer alle spaeteren Auswahlarten:
  - normale Entities
  - technische Geometrieobjekte
  - spaeter Sprites, Trigger oder andere Spezialobjekte

### Inhalt des Bereichs `Eigenschaften`

Der Bereich `Eigenschaften` soll in V1 moeglichst einheitlich arbeiten:

- gemeinsame Grundinformationen des ausgewaehlten Objekts
- sichtbare Identitaet oder Benennung, falls vorhanden
- relevante Geometrie- oder Positionswerte
- typspezifische Eigenschaften
- spaeter weitere objektbezogene Sonderwerte

### Grobschnitt fuer V1

- Fuer V1 wird `Eigenschaften` bewusst nicht als voellig eigener Sonderinspector pro Objekttyp aufgebaut.
- Stattdessen gilt ein gemeinsamer Grundblock mit anschliessenden typspezifischen Zusatzgruppen als Standardmuster.
- Die genaue Feldtiefe einzelner Typen darf beim Implementieren noch pragmatisch geschliffen werden, solange dieses Grundprinzip erhalten bleibt.

### Verhalten nach dem Zeichnen von Geometrie

- Nach dem Erzeugen eines neuen `Rectangle`- oder `Polygon`-Objekts soll die rechte Sidebar automatisch den Bereich **`Eigenschaften`** oeffnen oder fokussieren.
- Der Nutzer wird damit direkt zur inhaltlichen Zuweisung und Nachbearbeitung des neuen Objekts gefuehrt.

### Standardwert fuer neue technische Geometrie

- Ein neu gezeichnetes technisches Geometrieobjekt startet in V1 mit **`solid`** als vorausgewaehltem Standardtyp.
- Dieser Wert ist direkt im Bereich `Eigenschaften` sichtbar und aenderbar.

### Bedeutung dieser Entscheidung

- Der Workflow bleibt schnell, weil nach dem Zeichnen nicht erst ein zusaetzlicher Dialog noetig ist.
- Die Sidebar bleibt allgemein und wiederverwendbar, statt fuer jede Objektart einen eigenen Spezialblock zu benoetigen.
- Neue Objekttypen koennen spaeter leichter in dieselbe UI-Sprache eingegliedert werden.

### Verhalten bei leerer Auswahl

- Wenn im `Level Editor` nichts ausgewaehlt ist, soll `Eigenschaften` **nicht** automatisch auf Level-Eigenschaften umspringen.
- Stattdessen gibt es den separaten permanenten Bereich **`Level Settings`** in der rechten Sidebar.
- Damit bleibt die Bedeutung der Bereiche klar:
  - `Level Settings` fuer Level-bezogene Konfiguration
  - `Eigenschaften` fuer die aktuell ausgewaehlte Entity oder Geometrie
  - `Info` fuer lesenden Objektkontext, wenn eine Auswahl existiert

### Vorteil dieser Trennung

- weniger Bedeutungswechsel innerhalb desselben Panels
- klarere mentale Zuordnung fuer Nutzer
- bessere Erweiterbarkeit, wenn spaeter weitere Auswahlarten hinzukommen

### Bearbeitungstiefe von `Level Settings`

Fuer V1 wird `Level Settings` bewusst **direkt und voll editierbar** geplant und nicht nur als kompakte Zusammenfassung.

Das bedeutet:

- wichtige Level-Metadaten koennen direkt dort gepflegt werden
- Bounds und Kamera-bezogene Werte koennen direkt dort bearbeitet werden
- Hintergrund- und zentrale Level-Settings sollen direkt dort liegen
- die rechte Sidebar bleibt damit trotz ihrer kompakten Form eine echte Arbeitsflaeche fuer die Levelkonfiguration

### Konsequenz fuer die UI

- `Level Settings` darf in V1 inhaltlich groesser werden als eine reine Kurzansicht
- die Sektion muss deshalb sauber gruppiert und scrollbar gedacht werden
- ein zusaetzliches Modal oder eine getrennte Unteransicht fuer normale Level-Einstellungen ist in V1 nicht vorgesehen

### Innere Gliederung von `Level Settings`

Fuer V1 wird `Level Settings` selbst noch einmal in **klappbare Untergruppen** gegliedert.

Diese Untergruppen koennen zum Beispiel abdecken:

- `Meta`
- `Bounds`
- `Camera`
- `Background`
- `Settings`

### Ziel dieser Gliederung

- die Levelkonfiguration bleibt trotz voller Editierbarkeit scanbar
- haeufig genutzte Gruppen koennen offen bleiben, seltene Bereiche eingeklappt
- neue Level-Eigenschaften lassen sich spaeter leichter in bestehende Gruppen einsortieren

### Standardzustand der Untergruppen

Fuer V1 startet innerhalb von `Level Settings` standardmaessig:

- `Meta` aufgeklappt
- alle weiteren Untergruppen eingeklappt

Damit bleibt die Sektion kompakt, ohne die grundlegende Level-Bearbeitung zu verstecken.

## Verhalten bei Mehrfachauswahl

Fuer V1 wird Mehrfachauswahl in der rechten Sidebar bewusst schlicht behandelt.

### Entstehung von Mehrfachauswahl

- In V1 entsteht Mehrfachauswahl bewusst zunaechst nur ueber **`Shift`-Klick auf weitere Objekte**.
- Ein separater Auswahlrahmen auf der Canvas wird fuer diesen ersten Stand noch nicht vorausgesetzt.
- `Shift`-Klick arbeitet dabei als **Toggle**:
  - noch nicht ausgewaehltes Objekt wird hinzugefuegt
  - bereits ausgewaehltes Objekt wird wieder aus der Mehrfachauswahl entfernt
- Unsichtbare Objekte duerfen in V1 **nicht** normal selektiert werden.
- Einzelne gesperrte Objekte duerfen in V1 bereits **gar nicht normal selektiert** werden.
- Gesperrte Objekte duerfen in V1 **nicht** in eine Mehrfachauswahl aufgenommen werden.
- Ein normaler Klick auf ein Objekt setzt eine bestehende Mehrfachauswahl wieder auf **genau dieses eine Objekt** zurueck.

### `Info` bei Mehrfachauswahl

- Bei Mehrfachauswahl zeigt `Info` **keine Detaileigenschaften einzelner Objekte**.
- Stattdessen erscheint eine kompakte Sammelinfo, zum Beispiel:
  - `15 Elemente markiert`
- `Info` bleibt dabei rein lesend und enthaelt keine editierbaren Felder.

### `Eigenschaften` bei Mehrfachauswahl

- In V1 werden bei Mehrfachauswahl **keine tiefen objektspezifischen Einzelfelder** dargestellt.
- Die Sidebar soll damit nicht versuchen, widerspruechliche Detailzustande mehrerer Objekte gleichzeitig abzubilden.
- Stattdessen zeigt `Eigenschaften` einen knappen Hinweis, dass Mehrfachauswahl in V1 dort noch nicht bearbeitet wird.
- Spaetere Bulk-Edit-Funktionen koennen optional nachgeruestet werden, sind aber nicht Teil dieses V1-Verhaltens.

### Ziel dieser Entscheidung

- klare Trennung zwischen lesendem Kontext und eigentlicher Bearbeitung
- weniger verwirrende Mischdarstellungen bei heterogener Auswahl
- schneller und ruhiger UI-Flow fuer den ersten Editorstand

## Aufbau von `Info` bei Einzelauswahl

Fuer V1 wird `Info` bei Einzelauswahl **kompakt, aber hilfreich** gehalten.

### Inhalt von `Info`

Die Sektion soll bei einem einzelnen ausgewaehlten Objekt typischerweise anzeigen:

- Typ
- technische ID
- zugeordnete Ebene
- Position
- Groesse oder Bounds, wenn sinnvoll
- knappe Verwendungs- oder Kontextinfo, falls vorhanden

### Visuelle Zusatzsignale

- `Info` bleibt in V1 primaer textuell lesbar, darf aber durch **kleine Status-Badges** ergaenzt werden.
- Sinnvolle Beispiele sind:
  - `locked`
  - `hidden`
  - `graphic`
  - `sprite`
  - `logic`

Die Badges sollen nur schnelle Scanbarkeit verbessern und die Sektion nicht in eine laute Icon-Leiste verwandeln.

### Ziel dieser Entscheidung

- wichtige Objektkontexte sind schnell lesbar
- die Sektion bleibt deutlich schlanker als `Eigenschaften`
- technische Orientierung ist vorhanden, ohne in Debug-Details zu kippen

### Zuweisung des eigentlichen Typs

Fuer V1 wird aktuell diese Richtung festgehalten:

- Primitive technische Zonen werden zuerst gezeichnet.
- Danach wird ihr eigentlicher Typ im Inspector oder in der rechten Sidebar zugewiesen.
- Beispiel:
  - `Rectangle` oder `Polygon` benutzen
  - Geometrie abschliessen
  - rechts `hazard`, `solid`, `checkpoint` oder `ladder` zuweisen

### Beziehung zur Library

- Primitive technische Zonen muessen in V1 **nicht** zuerst aus der Library stammen.
- Spaeter kann ein bereits gezeichnetes technisches Objekt oder Setup optional als wiederverwendbares Preset in die Library uebernommen werden.

### Warum diese Richtung sinnvoll ist

- weniger Mehrdeutigkeit beim Zeichnen
- natuerlicher fuer editorische Geometriearbeit
- besser anschlussfaehig an spaetere Trigger-, Collision- und Sprite-Workflows

## Level-Kacheln in der Project View

Die Level-Kachelansicht wird in V1 um direkte Organisationsaktionen erweitert.

### Neue-Level-Kachel

- Die erste Kachel der Projektansicht ist eine eigene **`Neues Level`-Kachel**.
- Diese Kachel steht bewusst vor den eigentlichen Level-Kacheln und signalisiert den Einstieg in die Level-Erstellung direkt aus der Uebersicht.

### Verhalten der Neue-Level-Kachel

- Beim Aktivieren der `Neues Level`-Kachel erscheint ein **Modalfenster**.
- Dieses Modal fragt in V1 mindestens:
  - leeres Level anlegen
  - neues Level aus bestehendem Level duplizieren

### Schnelle Kachelaktionen fuer vorhandene Levels

Bestimmte organisatorische Aktionen sollen direkt an der Level-Kachel verfuegbar sein, zusaetzlich zur rechten Sidebar:

- Level loeschen
- als Start-Level setzen

### Sichtbarkeit der Kachelaktionen

- Diese Kachelaktionen sollen in V1 **nur bei Hover oder wenn die Kachel ausgewaehlt ist** sichtbar werden.
- Dadurch bleibt die Uebersicht ruhiger, ohne den Direktzugriff auf wichtige Organisationsaktionen zu verlieren.

### Rolle der rechten Sidebar dabei

- Dieselben Aktionen bleiben zusaetzlich auch in der rechten Sidebar verfuegbar.
- Dadurch entsteht:
  - schneller Direktzugriff in der Kachelansicht
  - zusaetzlich ein klarer, sichtbarer Ort fuer bewusstere Verwaltungsschritte

### Einordnung dieser Entscheidung

- Diese Direktaktionen sind in der `Project View` sinnvoll, weil sie organisatorisch und projektbezogen sind.
- Sie widersprechen nicht der frueheren Trennung, solange tiefe Level-Eigenschaften weiterhin im `Level Editor` bleiben.

## Globale Navigation in V1

Fuer V1 ist aktuell diese Richtung festgelegt:

- Die Hauptbereiche des Editors werden ueber eine **linke vertikale Hauptnavigation** gewechselt.
- Diese Navigation verwendet **Icons plus Labels**, damit sie auch bei wachsender Funktionszahl lesbar bleibt.
- Die Navigation muss **einklappbar** sein, damit der Editor je nach Arbeitsmodus mehr Raum fuer Canvas oder Inhaltsflaechen freigeben kann.

### Ziele dieser Entscheidung

- bessere Skalierbarkeit bei spaeteren Bereichen wie Sprite-Editor, Validation oder Export
- klarere Trennung zwischen globalem Workspace-Wechsel und lokalen Editor-Panels
- kompakterer Arbeitsmodus moeglich, wenn die Navigation nur als Icon-Spalte sichtbar ist

### Konsequenzen fuer spaetere Bereiche

- Der Sprite-Editor-Platzhalter passt sichtbar in dieselbe Navigationsstruktur.
- Projektansicht und Level-Editor koennen beide eigene lokale Toolbars besitzen, ohne den globalen Bereichswechsel zu vermischen.
- Die Navigationsstruktur sollte frueh mit Zustandswechseln wie:
  - erweitert
  - eingeklappt
  - aktiver Bereich
  konsistent geplant werden.

## Noch offene Leitfragen

Die naechsten Entscheidungen sollen unter anderem klaeren:

- Welche Hauptansichten V1 wirklich schon braucht
- Ob Library-Management als eigener Workspace oder nur als Panel des Level-Editors startet
- Wie stark Projektansicht und Level-Editor getrennt werden
- Welche globale Navigation sinnvoll ist
- Welche Toolbars global und welche kontextbezogen sein sollen
- Welche Bereiche in V1 bewusst nur vorbereitet, aber noch nicht voll ausgebaut werden
