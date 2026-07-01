# Lucid Editor Documentation Guide

## Purpose

- This file defines how the documentation inside `docs/` is structured and maintained.
- It is a **documentation-specific extension** of the root-level `AGENTS.md`.
- It does not replace the main project agent guide. It narrows it for documentation work.

## Scope

- Apply these rules when:
  - editing documentation files
  - adding new documentation files
  - deciding where new information belongs
  - synchronizing implementation changes back into the docs

## Documentation Principles

- The documentation is the **source of truth** for product rules, workflow decisions, and implementation direction.
- Do not allow multiple competing descriptions of the same rule in different places.
- Keep each document focused on its job instead of turning every file into a mixed notes dump.
- If a documented rule changes, update the authoritative file first, then update supporting files that reference it.

## Language Rules

- User-facing communication with the project owner remains in **German**.
- This `AGENTS.md` file may remain in English.
- The main project documentation content under `docs/` should remain aligned with the current project style, which is currently **German**.
- New documentation files should follow the existing style unless there is a specific reason not to.

## Document Roles

- `README.md`
  - entry point into the documentation
  - explains what each document is for
  - should be updated when new core documentation files are added or renamed

- `PLAN.md`
  - condensed strategic direction
  - high-level goals, architectural direction, and major cross-cutting requirements
  - not the place for fine-grained implementation status

- `IMPLEMENTATION-ROADMAP.md`
  - current implementation status
  - build order
  - next coding blocks
  - migration and replacement strategy for existing code

- `TECH-STACK.md`
  - active technical choices
  - libraries, runtime strategy, browser constraints, and tooling direction
  - update when the chosen implementation stack changes

- `CHANGELOG.md`
  - human-readable record of relevant changes
  - update after every meaningful product, architecture, workflow, or documentation change

- `BRAINSTORMING.md`
  - open questions
  - future directions
  - unresolved or intentionally deferred ideas
  - move items out once they become decisions

- `foundations/*.md`
  - authoritative product rules for a specific domain
  - update these when behavior, schema, workflow, or product rules change

- `../VERSION.json`
  - source of truth for editor and format version numbers
  - must be kept in sync with meaningful progress

## Where Information Belongs

- Put **decided product rules** into the matching file under `foundations/`.
- Put **implementation progress** into `IMPLEMENTATION-ROADMAP.md`.
- Put **stack and library choices** into `TECH-STACK.md`.
- Put **open or intentionally unresolved topics** into `BRAINSTORMING.md`.
- Put **historical record of what changed** into `CHANGELOG.md`.
- Put **version number updates** into `VERSION.json`.

## Required Sync Rules

- If implementation changes the intended product behavior, update the relevant `foundations/*.md` file in the same change set.
- If implementation progress changes what is already done or what comes next, update `IMPLEMENTATION-ROADMAP.md`.
- If a new important document is added, update `README.md`.
- If a meaningful change happens, update `CHANGELOG.md`.
- If the change represents real project progress, update `VERSION.json`.

## Documentation Hygiene

- Avoid duplicating long rule descriptions across multiple files.
- Prefer short references to the authoritative file over copied paragraphs.
- Remove or rewrite obsolete wording once a better authoritative version exists.
- Keep sections readable and scannable.
- Use explicit headings and short bullet lists where they help.

## When To Add A New Documentation File

- Add a new file only when:
  - a topic is large enough to deserve its own home
  - keeping it inside an existing file would reduce clarity
  - the new file has a stable long-term purpose

- Do **not** create new files for:
  - one-off notes that belong in `BRAINSTORMING.md`
  - tiny fragments that fit cleanly into an existing file
  - duplicate summaries of existing material

## When In Doubt

- First check `README.md` to see whether the right destination file already exists.
- If the information is already documented, extend the existing authoritative file instead of creating a parallel explanation.
- If the correct destination is still unclear, prefer the smallest clean update and ask the user before inventing a new documentation structure.
