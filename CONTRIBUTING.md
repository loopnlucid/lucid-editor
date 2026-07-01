# Contributing to Lucid Editor

## Before You Start

Lucid Editor is documentation-driven.

Before making substantial changes, read:

1. `AGENTS.md`
2. `docs/AGENTS.md`
3. `docs/README.md`
4. `docs/IMPLEMENTATION-ROADMAP.md`
5. the relevant file under `docs/foundations/`

## Core Rule

The documentation is the source of truth.

- If implementation changes the intended behavior, update the matching documentation in the same change set.
- If implementation status changes, update `docs/IMPLEMENTATION-ROADMAP.md`.
- If a meaningful change happens, update `docs/CHANGELOG.md`.
- If the project meaningfully progresses, update `VERSION.json`.

## Scope

This repository currently contains only the active `Lucid Editor` product.

- Do not pull unrelated sandbox files into the repository.
- Do not assume tools outside this folder are part of the maintained product.

## Coding Direction

- Keep the editor browser-based in V1.
- Prefer small focused modules over monolith files.
- Keep canvas interaction custom where world coordinates, selection, geometry editing, and layer rules are involved.
- Prefer reusable UI building blocks and CSS variables over ad-hoc styling.

## Pull Request Intent

Even if collaboration is currently small, changes should be easy to review:

- keep changes focused
- explain why the change exists
- mention any documentation files updated alongside the code
