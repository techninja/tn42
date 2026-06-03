# Clearstack Project Rules

This is a Clearstack-spec project. These constraints apply to all code generation:

## File Size Limits
- **Code files (.js, .css): ≤150 lines** after formatting
- **Doc files (.md): ≤500 lines**
- When approaching 120 lines, add `// SPLIT CANDIDATE:` comments noting logical seams
- When over 150, split into multiple files — never compress to reduce count

## Decomposition Patterns (when files get large)
- **View templates too long?** → Extract render helpers as plain functions in `src/utils/`
- **Data loading logic?** → Extract to a loader/store module
- **Keyboard/event handlers?** → Extract to a utility module
- **CSS file too long?** → Split by section comments into multiple stylesheets
- **Repeated template fragments (headers, footers)?** → Use shared components

## Code Style
- ES modules, no build step, runs as-authored in browser
- JSDoc types (not TypeScript) — validate with `tsc --checkJs`
- Semicolons, 2-space indent, single quotes (Prettier enforces)
- `prefer-const`, `eqeqeq`, no unused imports

## Spec Check
- User may be running `npm run spec --watch` — assume violations are visible in real-time
- After completing a feature unit, mentally verify files are under limits
- Run `npm run spec all` before marking work complete

## Import Aliases
- `#store/`, `#utils/`, `#atoms/`, `#molecules/`, `#organisms/`, `#templates/`, `#pages/`, `#config/`

## Ignore Paths (not subject to spec)
- `node_modules/`, `src/vendor/`, `src/space/`, `dist/`, `scripts/`
