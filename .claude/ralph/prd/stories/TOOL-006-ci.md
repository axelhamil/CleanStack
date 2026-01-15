# TOOL-006: GitHub Actions CI + Semantic Release

## Story

**As a** maintainer
**I want** CI pipeline with automated releases
**So that** PRs are validated and releases are automatic

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` created
- [ ] `.github/workflows/release.yml` created
- [ ] Runs on: push to main, PRs
- [ ] Jobs: lint, type-check, test, build
- [ ] Checks: duplication, unused code
- [ ] Coverage report uploaded
- [ ] Automatic versioning on main
- [ ] Automatic CHANGELOG generation
- [ ] Automatic npm publish (ddd-kit)
- [ ] Automatic GitHub release
- [ ] Badge in README

## Technical Notes

### CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm jscpd
      - run: pnpm knip

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test:coverage

      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          token: ${{ secrets.CODECOV_TOKEN }}

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build
```

### Release Workflow (semantic-release)

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write
  packages: write
  issues: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

### Semantic Release Config

```javascript
// release.config.js
export default {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', {
      changelogFile: 'CHANGELOG.md',
    }],
    ['@semantic-release/npm', {
      pkgRoot: 'packages/ddd-kit',
    }],
    ['@semantic-release/git', {
      assets: ['CHANGELOG.md', 'package.json', 'packages/*/package.json'],
      message: 'chore(release): ${nextRelease.version} [skip ci]',
    }],
    '@semantic-release/github',
  ],
};
```

### Installation

```bash
pnpm add -D semantic-release @semantic-release/changelog @semantic-release/git
```

### Release Flow

```
1. Developer commits with conventional format
   feat(auth): add password reset

2. PR merged to main

3. semantic-release analyzes commits:
   - feat → minor version bump (1.0.0 → 1.1.0)
   - fix → patch version bump (1.0.0 → 1.0.1)
   - BREAKING CHANGE → major version bump (1.0.0 → 2.0.0)

4. Automatic actions:
   - Update CHANGELOG.md
   - Bump version in package.json
   - Create git tag
   - Publish to npm
   - Create GitHub release
```

### Required Secrets

```
NPM_TOKEN      - npm publish token (for ddd-kit)
CODECOV_TOKEN  - Coverage reporting
```

## Definition of Done

- [ ] CI workflow runs on PRs
- [ ] Release workflow runs on main
- [ ] CHANGELOG auto-generated
- [ ] npm auto-published
- [ ] GitHub releases created
- [ ] Coverage badge displays
