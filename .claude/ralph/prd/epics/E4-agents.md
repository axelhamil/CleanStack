# E4: Agents Claude

## Description

Créer des agents autonomes pour les tâches complexes nécessitant analyse et jugement.

## Objectifs

- feature-architect : Analyse et propose architecture
- code-reviewer : Review DDD compliance
- test-writer : Écrit tests manquants
- doc-writer : Maintient documentation

## Agents

| Agent | Purpose | Trigger |
|-------|---------|---------|
| feature-architect | Architecture depuis EventStorming | Manuel ou /feature-prd |
| code-reviewer | Review qualité + DDD | Manuel ou pre-commit |
| test-writer | Génère tests pour 90% | Manuel ou CI |
| doc-writer | Sync docs avec code | Manuel ou post-merge |

## Stories

| ID | Story | Priority |
|----|-------|----------|
| [AGT-001](../stories/AGT-001-feature-architect.md) | Agent feature-architect | High |
| [AGT-002](../stories/AGT-002-code-reviewer.md) | Agent code-reviewer | High |
| [AGT-003](../stories/AGT-003-test-writer.md) | Agent test-writer | Medium |
| [AGT-004](../stories/AGT-004-doc-writer.md) | Agent doc-writer | Low |

## Structure fichiers

```
.claude/
└── agents/
    ├── feature-architect.md
    ├── code-reviewer.md
    ├── test-writer.md
    └── doc-writer.md
```

## Acceptance Criteria

- [ ] 4 agents créés
- [ ] feature-architect analyse correctement
- [ ] code-reviewer détecte violations DDD
- [ ] test-writer améliore coverage
- [ ] Documentés dans CLAUDE.md
