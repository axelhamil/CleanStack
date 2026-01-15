# QA-007: App Documentation Review

## Story

En tant que développeur, je veux que la documentation dans `app/docs/` soit complète et à jour avec le code actuel.

## Priority

High

## Documentation Pages

```
app/docs/
├── page.mdx                           # Landing
├── getting-started/page.mdx           # Quick start
├── architecture/
│   ├── page.mdx                       # Overview
│   ├── layers/page.mdx                # Clean Architecture layers
│   └── dependency-rule/page.mdx       # Dependency inversion
├── core-concepts/
│   ├── page.mdx                       # Overview
│   ├── result/page.mdx                # Result<T>
│   ├── option/page.mdx                # Option<T>
│   ├── value-objects/page.mdx         # ValueObject pattern
│   └── entities/page.mdx              # Entity/Aggregate
├── guides/
│   ├── first-use-case/page.mdx        # Use case tutorial
│   ├── transactions/page.mdx          # DB transactions
│   ├── testing/page.mdx               # Testing strategy
│   └── authentication/page.mdx        # Auth implementation
└── ai/
    ├── page.mdx                       # AI overview
    ├── claude-code/page.mdx           # Claude Code setup
    ├── cursor/page.mdx                # Cursor setup
    └── prompts/page.mdx               # AI prompts
```

## Acceptance Criteria

- [x] Toutes les pages de doc compilent sans erreur
- [x] Les exemples de code sont à jour avec les imports actuels
- [x] Les patterns DDD documentés correspondent au code
- [x] La section AI mentionne les skills et agents
- [x] Les liens internes fonctionnent

## Validation

```bash
pnpm build    # Verify docs compile
```

## Review Checklist

### Core Concepts
- [x] Result<T> exemples à jour
- [x] Option<T> exemples à jour
- [x] ValueObject pattern correct
- [x] Entity/Aggregate pattern correct

### Guides
- [x] Auth guide correspond à l'implémentation
- [x] Testing guide avec exemples actuels
- [x] Use case guide avec patterns actuels

### AI Section
- [x] Mention des 5 skills
- [x] Mention des 4 agents
- [x] CLAUDE.md référencé

## Updates Applied

- `ai/claude-code/page.mdx`: Added skills table, agents table, example workflow
- `ai/page.mdx`: Added skills table with commands
- `ai/prompts/page.mdx`: Added tip to use skills instead

## Status: ✅ COMPLET
