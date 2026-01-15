# REL-003: GitHub Repository Setup

## Story

**As a** maintainer
**I want** proper GitHub repo configuration
**So that** the project is professional and maintainable

## Acceptance Criteria

- [ ] Repository description set
- [ ] Topics/tags added
- [ ] Branch protection on main
- [ ] License file (MIT)
- [ ] .gitignore complete
- [ ] .github folder structure

## Technical Notes

### Repository Settings

**Description:**
```
🏗️ Production-ready Next.js starter with Clean Architecture, DDD, and AI-powered development
```

**Topics:**
```
nextjs, typescript, clean-architecture, ddd, domain-driven-design,
starter-template, boilerplate, ai-development, claude, turborepo
```

**Branch Protection (main):**
- Require PR reviews
- Require status checks (CI)
- No force push
- No deletions

### Files

#### LICENSE
```
MIT License

Copyright (c) [year] [org]

Permission is hereby granted, free of charge, to any person obtaining a copy
...
```

#### .gitignore additions
```gitignore
# Environment
.env
.env.local
.env*.local

# Dependencies
node_modules/
.pnpm-store/

# Build
dist/
.next/
.turbo/

# Testing
coverage/

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Local files
*.local.md
```

#### .github/CODEOWNERS
```
# Default owners
* @[org]/maintainers

# Packages
/packages/ddd-kit/ @[org]/core
/packages/ui/ @[org]/frontend
```

## Definition of Done

- [ ] Repo settings configured
- [ ] LICENSE added
- [ ] .gitignore complete
- [ ] CODEOWNERS added
