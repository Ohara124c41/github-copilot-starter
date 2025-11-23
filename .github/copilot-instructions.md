# Copilot Instructions (Best-Practice Guidance)

This file provides concise, actionable coding and style guidance for GitHub Copilot so generated suggestions match project standards. Keep entries short and prescriptive — avoid product-level prompts or step-by-step user instructions.

Principles
- Be idiomatic: prefer modern JS (ES2020+), `const`/`let`, arrow functions, modules, and clear naming.
- Keep logic testable and side-effect free where practical. Extract pure utilities from UI components.
- Prefer small, focused functions and reusable hooks for shared behavior.

Coding Standards
- Use `async/await` for async flows. Handle failures with `try/catch` and return meaningful errors.
- Validate inputs at boundaries; sanitize user-supplied data before use.
- Favor composition over inheritance. Use small components and lift state sensibly.

Styling & Theming
- Use CSS Modules or scoped styles for component styles. Centralize global tokens in `styles/globals.css` (colors, spacing, radii).
- Support `prefers-color-scheme` and a theme toggle that sets `document.documentElement.dataset.theme`.
- Prefer high-contrast, accessible color combinations and avoid changing layout on focus.

Accessibility
- Use semantic roles (`grid`, `gridcell`), `aria-*` attributes for dynamic regions, and `aria-live` for status messages.
- Ensure keyboard navigation for interactive elements and trap focus within modals.

Testing & Quality
- Add unit tests for core logic (e.g., `utils/sudoku.js`) and integration tests for key flows.
- Include linting and a pre-commit check (ESLint + Prettier) and keep commit messages clear and scoped.
