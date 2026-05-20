# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build   # Transpile src/ → lib/ via Babel
npm test        # Build + run Jasmine tests with NYC coverage
```

There is no separate lint command in package.json; the project uses StandardJS style enforced by `standard` and `prettier-standard` (devDependencies). Run `npx standard src/` to lint manually.

To run a single test: Jasmine does not support per-test filtering via CLI in this setup — add a focused `fit(...)` or `fdescribe(...)` in the spec file temporarily.

## Architecture

The library is a single-file algorithm (`src/json2interface.js`) that converts a JSON string into TypeScript interface definitions.

**Entry point**: `generate(jsonData, rootInterfaceName?)` — parses JSON, creates a context object, calls `_processNode()`, and returns a multi-line string of `export interface` blocks.

**Context object**: `{ interfaces: [], seenShapes: Map }` — passed through all recursive calls instead of module-level mutable state. `interfaces` collects emitted interfaces; `seenShapes` maps shape fingerprints to interface names for deduplication.

**Type classification** (`PROPERTY_TYPE` constant):
- `Primitive` — booleans, strings, numbers (via `typeof`)
- `CustomObject` — plain objects with properties
- `Array` — iterates ALL elements for merging and union types
- `NullOrUndefined` — typed as `any` and marked optional (`?`)

**Core functions**:
- `_processNode(value, name, ctx)` — dispatches to type-specific handler, returns TS type string
- `_processObject(obj, name, ctx)` — builds properties, computes shape fingerprint, deduplicates, emits interface
- `_processArray(arr, name, ctx)` — iterates all elements; merges object shapes via `_mergeObjects`, builds union types for mixed arrays, handles empty arrays as `any[]`
- `_mergeObjects(objects, name, ctx, hasNull)` — collects all keys across objects, marks partial keys optional, recursively merges nested shapes
- `_mergeValues(values, name, ctx)` — determines merged type for one key's values across multiple objects

**Naming helpers**:
- `_sanitizeInterfaceName(text)` — converts any string to a valid PascalCase TS identifier (handles special chars, dots, underscores, spaces, numeric-leading names)
- `_toSafeKey(text)` — quotes property names that are empty, contain non-identifier chars, start with digits, or are TS reserved words
- `_resolveUniqueName(name, ctx)` — appends numeric suffixes (`Name2`, `Name3`, ...) to avoid interface name collisions

**Output format**: Each interface is an `export interface Name { ... }` block with 2-space-indented properties and semicolons. Properties are sorted alphabetically. Interfaces appear in dependency order (leaves first). Blocks are separated by blank lines.

**Build pipeline**: Babel transpiles `src/` (ES6 modules) → `lib/` (CommonJS). `index.js` re-exports from `lib/`. The `.babelrc` excludes `*.spec.js` files from transpilation. `lib/json2interface.d.ts` provides TypeScript typings.

**Tests** live in `src/json2interface.spec.js` (Jasmine), configured via `spec/support/jasmine.json`. 40 test cases organized by feature area: basic functionality, array merging, union types, empty arrays, null handling, property name safety, interface name sanitization, deduplication, nested arrays, sorted output, and edge cases.
