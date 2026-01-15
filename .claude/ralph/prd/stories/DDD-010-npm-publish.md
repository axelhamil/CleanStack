# DDD-010: npm Package Publish

## Story

**As a** ddd-kit maintainer
**I want** to publish ddd-kit to npm
**So that** external projects can use these primitives

## Acceptance Criteria

- [ ] Package name: `@your-org/ddd-kit` or `ddd-kit`
- [ ] package.json configured for npm
- [ ] TypeScript declarations included
- [ ] ESM and CJS builds
- [ ] README with usage examples
- [ ] CHANGELOG maintained
- [ ] Version 1.0.0 published
- [ ] npm badge in README

## Technical Notes

### package.json Updates

```json
{
  "name": "ddd-kit",
  "version": "1.0.0",
  "description": "DDD primitives for TypeScript: Result, Option, Entity, Aggregate, ValueObject",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "README.md", "CHANGELOG.md"],
  "keywords": ["ddd", "domain-driven-design", "result", "option", "entity", "aggregate", "typescript"],
  "author": "",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/ddd-kit"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "prepublishOnly": "pnpm build && pnpm test"
  }
}
```

### Build Setup

```bash
pnpm add -D tsup
```

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

### README Structure

```markdown
# ddd-kit

> DDD primitives for TypeScript

## Installation

\`\`\`bash
npm install ddd-kit
# or
pnpm add ddd-kit
\`\`\`

## Features

- **Result<T, E>** - Railway-oriented programming
- **Option<T>** - Null-safe value handling
- **Entity<T>** - Identity-based domain objects
- **Aggregate<T>** - Aggregate roots with domain events
- **ValueObject<T>** - Immutable value types with validation
- **UUID** - Type-safe identifiers
- **WatchedList<T>** - Change-tracked collections

## Usage

[Examples for each primitive]

## License

MIT
```

### Publish Steps

```bash
# 1. Ensure tests pass
pnpm test

# 2. Build package
pnpm build

# 3. Login to npm
npm login

# 4. Publish
npm publish --access public
```

## Definition of Done

- [ ] Package builds successfully
- [ ] Tests pass
- [ ] Published to npm
- [ ] Can be installed in fresh project
