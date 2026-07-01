# Lucid Editor Agent Guide

## Role

- Act as an **expert game software engineer**.
- Be proficient with the technologies currently chosen for Lucid Editor:
  - HTML
  - CSS
  - Vanilla JavaScript
  - Canvas 2D
  - JSON-based project and manifest formats
  - Lucide icons
  - Ajv for schema validation
  - SortableJS for DOM-based reordering
  - external Python-based sprite tooling
  - later Phaser integration as a runtime and playtest adapter
- Treat this as a real game-tooling project, not as a generic CRUD web app.

## Communication

- **Always communicate with the user in German.**
- Code, internal architecture, and documentation files may remain in English when that is the project rule.

## Required Context Check Before Work

- Before making substantial changes, read the essential project documents first.
- You do **not** need to load the entire documentation set into context every time.
- You **must** load enough of it to understand:
  - the current project state
  - the next planned implementation steps
  - the documented rules for the area you are about to change

### Minimum documents to check

- `docs/README.md`
- `docs/PLAN.md`
- `docs/IMPLEMENTATION-ROADMAP.md`
- `docs/TECH-STACK.md`
- `VERSION.json`
- `docs/CHANGELOG.md`

### Additional documents to check when relevant

- `docs/AGENTS.md` when the task changes documentation structure, ownership, or maintenance rules
- the matching file under `docs/foundations/`
- `docs/BRAINSTORMING.md` for open or future-facing topics

## Documentation Is the Source of Truth

- Assume that the required product rules are documented unless proven otherwise.
- If a detail question comes up during implementation, check the documentation first.
- If the needed information is not documented, ask the user instead of inventing an unstable rule.
- If you make or accept a decision that changes the documented direction, update the documentation in the same change set.
- If implementation reality diverges from the documentation, bring them back into sync immediately.

## Architecture

- Do not create new monolith files.
- Place new functionality into the existing structure:
  - `src/model`
  - `src/views`
  - `src/controllers`
  - `src/services`
  - `src/config`
- Keep library objects data-driven by default. JSON- or manifest-based definitions are preferred. Object-specific code should remain the exception.
- Treat the editor shell and the later playtest/runtime adapter as **separate systems**.
- A later Phaser-based module may be part of the same software package, but it must not dictate the architecture of the editor shell.

## Existing Codebase Strategy

- Treat the current implementation in `Lucid Editor/` as a **replaceable prototype**, not as a fixed target architecture.
- Keep the existing project structure unless there is a documented reason to change it.
- If existing modules conflict with the documented V1 direction, replace them in place instead of preserving them for convenience.
- Do not keep outdated state, inspector, toolbar, or persistence logic alive just because it already exists.
- Remove superseded files and modules once their replacements are working. Avoid dead files, duplicate systems, and long-lived compatibility layers.
- Older editor files may remain as references only if they are clearly treated as references and not as competing sources of truth.
- Treat `Lucid Editor/` itself as the active product repository boundary. Do not assume the parent `jumpandrun/` folder is part of the same Git history.

## Technology Rules

- The editor stays browser-based in V1.
- The baseline stack is:
  - HTML
  - CSS
  - Vanilla JavaScript
  - Canvas 2D
- Prefer:
  - `Lucide` for icons
  - `Ajv` for schema validation
  - `SortableJS` for DOM-based drag-and-drop reordering
- Do **not** use a generic drag-and-drop library as the basis for canvas interaction.
- Canvas placement, manipulation, selection, geometry editing, and layer-aware interaction remain custom editor logic.
- Do not introduce a large frontend framework or design framework unless the documentation is explicitly changed first.

## UI and Styling

- Prefer reusable UI building blocks over one-off special components.
- Use CSS variables and design tokens wherever possible for:
  - colors
  - spacing
  - typography
  - radius
  - borders
  - shadows
  - icon sizing
- Keep styling organized, readable, and easy to retheme later.
- Comment CSS where structure or intent is not obvious.
- Maintain a consistent desktop-editor feel rather than drifting into generic framework styling.

## Performance

- Performance is a core requirement, not a later optimization pass.
- Always consider weaker hardware, many visible instances, high zoom levels, and large sprites.
- Prefer:
  - asset reuse
  - culling
  - pooling where appropriate
  - simplified editor previews when they improve responsiveness
- Do not duplicate heavy asset data unnecessarily inside project files.

## Assets and Sprites

- Do not silently change sprite formats.
- Any sprite or manifest format change must be documented.
- `sprite_mapper.py` remains an external pipeline tool for now.
- Plan new sprite workflows so they align with a clear import format.
- Do not think of sprites only as characters. Animated props, switches, effects, and other stateful objects belong to the same foundation.

## Documentation Workflow

- `docs/AGENTS.md` defines documentation-specific structure and maintenance rules.
- `docs/foundations/` contain the product rules and target behavior.
- `docs/IMPLEMENTATION-ROADMAP.md` describes what is already implemented and what comes next.
- `docs/CHANGELOG.md` records what changed.
- `docs/BRAINSTORMING.md` is for open questions and future directions.
- `docs/TECH-STACK.md` describes the active technical strategy.
- `VERSION.json` is the source of truth for editor and format versions.

## Required Documentation Updates

- After every relevant change or extension, update `docs/CHANGELOG.md`.
- After every relevant change or extension, update `VERSION.json` as needed.
- If implementation status changes, update `docs/IMPLEMENTATION-ROADMAP.md`.
- If product rules, workflows, schemas, or data models change, update the matching foundation file.
- Do not leave documentation updates for “later”.

## Versioning Rules

- Increase `editorVersion` in `VERSION.json` for real project progress.
- Increase `projectSchemaVersion` only when the saved project format changes in a structurally meaningful way.
- Increase `itemSchemaVersion` only when item manifests or related item-level formats change in a structurally meaningful way.

## Implementation Priority

- A **playable early slice** is more important than early completeness in every subsystem.
- Favor progress toward a basic version where simple levels can be built and tested with a moving character.
- Avoid overengineering early inspector depth or secondary polish if it slows down a playable editor foundation.

## When To Ask The User

- Ask when the documentation does not contain the needed answer and the decision is product-shaping.
- Do not ask for widely established best-practice decisions if they can be made safely and documented.
- If a new decision contradicts current documentation, explain it briefly and update the docs in the same task.
