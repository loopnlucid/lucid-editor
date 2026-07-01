# Lucid Editor Documentation

Diese Doku ist bewusst aufgeteilt. `BRAINSTORMING.md` bleibt die offene Arbeitsnotiz, `PLAN.md` haelt die verdichtete Richtung fest, und die Dateien unter `docs/foundations/` sammeln die aktuell entschiedenen Grundpfeiler.

## Dokumente

- `AGENTS.md`
  Dokuspezifische Regeln fuer Struktur, Pflege und Zustaendigkeiten innerhalb von `docs/`.
- `IMPLEMENTATION-ROADMAP.md`
  Umsetzungsstatus, Bau-Reihenfolge und naechste Coding-Bloecke.
- `TECH-STACK.md`
  Technologierichtung, Browser-Dateizugriff, externe Tools und Bibliotheksstrategie.
- `BRAINSTORMING.md`
  Offene Ideen, Richtungen, spaetere Erweiterungen und noch nicht entschiedene Themen.
- `PLAN.md`
  Kompakter Projektplan mit Zielen, Architekturgrundsaetzen und Querschnittsanforderungen.
- `CHANGELOG.md`
  Laufende Dokumentation relevanter sichtbarer oder struktureller Aenderungen.

## Projektweite Zusatzdateien

- `../README.md`
  Oeffentliche Projektbeschreibung des Editor-Repositories.
- `../CONTRIBUTING.md`
  Beitragshinweise und Doku-Pflicht fuer Mitwirkende.
- `../LICENSE`
  Rechtliche Open-Source-Lizenz des Editor-Repositories.
- `../VERSION.json`
  Aktuelle Editorversion und laufende Formatversionen.

## Foundations

- `foundations/library.md`
  Library-Modell, Typen, Importgrundsaetze und Ablage im Projekt.
- `foundations/graphics.md`
  V1-Regeln fuer `graphic`-Items.
- `foundations/sprites.md`
  V1-Regeln fuer `sprite`-Items und das Lucid-Sprite-Format.
- `foundations/logic.md`
  V1-Regeln fuer `logic`-Items wie Spawn, Checkpoint, Solid, Ladder und Hazard.
- `foundations/storage.md`
  Hybrid-Speicherung, Manifest-Regeln und Rollenverteilung zwischen `project.json` und Item-Ordnern.
- `foundations/project-format.md`
  V1-Regeln fuer `project.json`, Layer, Entity-Instanzen und Editorzustand.
- `foundations/ui-workflow.md`
  Planung fuer Hauptansichten, Workspaces, Toolbars und den uebergreifenden Bedienfluss.

## Lesereihenfolge

1. `PLAN.md`
2. `AGENTS.md`
3. `TECH-STACK.md`
4. `IMPLEMENTATION-ROADMAP.md`
5. `foundations/library.md`
6. `foundations/graphics.md`
7. `foundations/sprites.md`
8. `foundations/logic.md`
9. `foundations/storage.md`
10. `foundations/project-format.md`
11. `foundations/ui-workflow.md`
12. `BRAINSTORMING.md` fuer offene oder spaetere Themen
