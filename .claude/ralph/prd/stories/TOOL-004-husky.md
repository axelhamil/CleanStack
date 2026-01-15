# TOOL-004: Setup Husky + lint-staged + Commitlint

## Story

**As a** developer
**I want** pre-commit hooks with Husky and Conventional Commits
**So that** code quality is enforced and releases are automated

## Acceptance Criteria

- [ ] Husky installed and initialized
- [ ] lint-staged installed
- [ ] commitlint configured for Conventional Commits
- [ ] Pre-commit hook runs: lint-staged
- [ ] Commit-msg hook validates commit message
- [ ] Pre-push hook runs: type-check + tests
- [ ] Commits blocked if checks fail
- [ ] Easy bypass with `--no-verify` (documented)

## Technical Notes

### Installation

```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
pnpm exec husky init
```

### Commitlint Config

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting
        'refactor', // Code restructuring
        'perf',     // Performance
        'test',     // Tests
        'chore',    // Maintenance
        'ci',       // CI changes
        'revert',   // Revert commit
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
  },
};
```

### Lint-staged Config

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["biome check --write", "biome format --write"],
    "*.{json,md}": ["biome format --write"]
  }
}
```

### Husky Hooks

```bash
# .husky/pre-commit
pnpm lint-staged

# .husky/commit-msg
pnpm commitlint --edit $1

# .husky/pre-push
pnpm type-check && pnpm test
```

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

Examples:
```bash
feat(auth): add google oauth provider
fix(billing): handle webhook timeout
docs(readme): update installation steps
refactor(domain): extract email validation to vo
test(auth): add sign-in use case tests
chore(deps): update dependencies
```

### Why Conventional Commits?

- **Automatic CHANGELOG** generation
- **Automatic version bumping** (semantic-release)
- **Clear commit history**
- **Triggers CI/CD based on commit type**

## Definition of Done

- [ ] Husky hooks installed
- [ ] Commitlint validates messages
- [ ] Pre-commit runs lint-staged
- [ ] Pre-push runs type-check + tests
- [ ] Team uses conventional commits
