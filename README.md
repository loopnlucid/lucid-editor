# Lucid Editor

Lucid Editor is a browser-based level editor for 2D jump-and-run games.  
It is being built as a focused game-tooling project with a modular editor shell, a documented project format, and an early playable workflow as a first-class goal.

## Project Status

Lucid Editor is currently in an early prototype stage.

The project already has:

- a browser-based editor shell
- a modular source structure
- canvas rendering with camera and zoom
- layer handling
- initial save/load support
- extensive product and workflow documentation

The next priority is not polish for its own sake, but a usable vertical slice:

- basic level editing
- technical geometry like rectangles and polygons
- a documented project model
- an early playable test slice with a simple character

## Goals

- Build a clean, documented 2D level editor with a desktop-tool feel
- Keep the V1 stack lightweight and understandable
- Reach a playable basic slice early
- Keep product rules, file formats, and workflow decisions documented from the start

## Tech Direction

Lucid Editor currently targets:

- HTML
- CSS
- Vanilla JavaScript
- Canvas 2D
- JSON-based project and manifest formats

Supporting libraries and tools currently planned:

- Lucide for icons
- Ajv for schema validation
- SortableJS for DOM-based reordering
- later Phaser integration as a dedicated playtest/runtime adapter

## Repository Structure

```text
Lucid Editor/
  assets/
  docs/
  src/
  AGENTS.md
  VERSION.json
  index.html
```

## Documentation

The project documentation is a core part of development, not an afterthought.

Start with:

1. `docs/README.md`
2. `docs/PLAN.md`
3. `docs/TECH-STACK.md`
4. `docs/IMPLEMENTATION-ROADMAP.md`

The detailed product rules live in `docs/foundations/`.

## Local Development

At the moment, Lucid Editor intentionally stays simple:

- open `index.html` in a modern browser for quick checks
- or serve the folder locally if stricter browser behavior becomes relevant

No mandatory bundler or large framework is required for the first working version.

## Versioning

- `VERSION.json` is the source of truth for editor and format versions
- `docs/CHANGELOG.md` records meaningful project changes
- Git history tracks implementation progress inside this repository

## License

Lucid Editor is licensed under the **MIT License**. See `LICENSE`.

The MIT license applies to the editor repository itself.
It does **not** automatically claim ownership over games, levels, or assets created with the editor.
If Lucid Editor later ships export templates, runtime code, or bundled assets, those parts may define additional terms for the material they provide.

## Contributing

This project is still being shaped, but contributions should follow the documented direction.

Please read:

- `AGENTS.md`
- `docs/AGENTS.md`
- `docs/README.md`

before making substantial changes.
