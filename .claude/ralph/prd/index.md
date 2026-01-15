# Product Requirements Document

## Vision

Créer le **boilerplate DDD ultime** pour le vibe coding avec Claude. Une DX niveau Lovable mais avec une qualité de code production-ready jamais atteinte.

**Workflow cible**: Clone → EventStorming → PRD auto-généré → Ralph → Feature parfaite

## Success Metrics

- 90% test coverage sur tout le projet
- Zero code dupliqué (jscpd < 3%)
- Zero code non utilisé (knip)
- Zero lint errors (biome)
- ddd-kit publié sur npm (auto via semantic-release)
- Skills et agents Claude fonctionnels (avec auto-routing)
- Starter features (Auth, Stripe, Pricing, Dashboard, Landing)
- Releases 100% automatisées (conventional commits → semantic-release)
- Deploy automatique Vercel (preview + production)
- Tutorial complet pour onboarding rapide

---

## Epics

| ID | Epic | Stories | Status |
|----|------|---------|--------|
| E0 | [Tooling & CI](./epics/E0-tooling.md) | TOOL-* | ✅ |
| E1 | [ddd-kit Tests & npm](./epics/E1-ddd-kit.md) | DDD-* | 🔴 |
| E2 | [Domain Events](./epics/E2-domain-events.md) | EVT-* | 🔴 |
| E3 | [Skills Claude](./epics/E3-skills.md) | SKL-* | 🔴 |
| E4 | [Agents Claude](./epics/E4-agents.md) | AGT-* | 🔴 |
| E5 | [CLAUDE.md](./epics/E5-claude-md.md) | DOC-* | 🔴 |
| E6 | [Documentation & Versioning](./epics/E6-docs.md) | REL-* | 🔴 |
| E7 | [Tests Coverage](./epics/E7-tests.md) | TST-* | 🔴 |
| E8 | [Starter Features](./epics/E8-starter.md) | FTR-* | 🔴 |
| E9 | [DX & Validation](./epics/E9-dx.md) | DX-* | 🔴 |
| E10 | [QA & Final Review](./epics/E10-qa.md) | QA-* | 🔴 |

---

## Story Prefixes

| Prefix | Epic | Description |
|--------|------|-------------|
| TOOL | E0 | Tooling, CI, pre-commit |
| DDD | E1 | ddd-kit tests et npm |
| EVT | E2 | Domain events pattern |
| SKL | E3 | Skills Claude |
| AGT | E4 | Agents Claude |
| DOC | E5 | CLAUDE.md et templates |
| REL | E6 | Release, versioning |
| TST | E7 | Test coverage global |
| FTR | E8 | Starter features |
| DX | E9 | Developer experience |
| QA | E10 | QA review et validation finale |

---

## Definition of Done (Global)

Chaque story doit respecter :

- [ ] Tests passent : `pnpm test`
- [ ] Types OK : `pnpm type-check`
- [ ] Lint OK : `pnpm check`
- [ ] Pas de duplication : `pnpm check:duplication`
- [ ] Pas de code mort : `pnpm check:unused`
- [ ] Coverage maintenu/amélioré
- [ ] PROGRESS.md mis à jour

---

## Acceptance Criteria - v1.0.0

### Code Quality
- [ ] 90% test coverage global
- [ ] Zero duplication (jscpd threshold)
- [ ] Zero code non utilisé (knip clean)
- [ ] Zero TypeScript errors
- [ ] Zero lint warnings

### DDD Compliance
- [ ] Clean Architecture respected
- [ ] Domain Events functional
- [ ] All layers properly separated

### AI Ecosystem
- [ ] 6 skills fonctionnels (+ auto-routing)
- [ ] 4 agents fonctionnels
- [ ] CLAUDE.md complet
- [ ] AI suggère le bon skill automatiquement

### Starter Features
- [ ] Auth complete
- [ ] Stripe integration
- [ ] Pricing + Dashboard + Landing

### Publication
- [ ] ddd-kit npm ready (auto-publish)
- [ ] v1.0.0 tagged (semantic-release)
- [ ] README professionnel
- [ ] Tutorial complet
- [ ] Vercel deploy fonctionnel

### Automation
- [ ] Conventional commits enforced (commitlint)
- [ ] semantic-release configure
- [ ] CHANGELOG auto-généré
- [ ] npm publish automatique
- [ ] GitHub releases automatiques
- [ ] Preview deploys sur PRs

---

## Out of Scope (v2+)

- Redis/message queue
- Event sourcing
- Saga pattern
- Multi-tenant
- GraphQL
