# E4: Agents Claude ✅

**Status:** COMPLET (100%)
**Dernière mise à jour:** Janvier 2025

## Description

Créer des agents autonomes pour les tâches complexes nécessitant analyse et jugement.

## Objectifs

- ✅ feature-architect : Analyse et propose architecture
- ✅ code-reviewer : Review DDD compliance
- ✅ test-writer : Écrit tests manquants
- ✅ doc-writer : Maintient documentation

## Agents Implémentés

| Agent | Purpose | Trigger | Status |
|-------|---------|---------|--------|
| feature-architect | Architecture depuis EventStorming | Manuel ou /feature-prd | ✅ |
| code-reviewer | Review qualité + DDD | Manuel ou pre-commit | ✅ |
| test-writer | Génère tests pour 90% | Manuel ou CI | ✅ |
| doc-writer | Sync docs avec code | Manuel ou post-merge | ✅ |

## Implémentation Détaillée

### feature-architect
**Fichier:** `.claude/agents/feature-architect.md`
**Capacités:**
- Analyse EventStorming output
- Propose architecture Clean Architecture
- Identifie Bounded Contexts
- Suggère Aggregates, VOs, Events
- Génère diagrammes architecture
- Valide contre patterns existants

### code-reviewer
**Fichier:** `.claude/agents/code-reviewer.md`
**Capacités:**
- Review conformité DDD
- Détection violations Clean Architecture
- Vérification conventions CLAUDE.md
- Analyse Result/Option usage
- Check injection dépendances
- Suggestion refactoring

**Règles vérifiées:**
- Domain sans imports externes
- Pas de throw (utiliser Result)
- Pas de null (utiliser Option)
- VOs avec validation Zod
- Transactions dans controllers
- Nommage conventions

### test-writer
**Fichier:** `.claude/agents/test-writer.md`
**Capacités:**
- Analyse coverage existante
- Génère tests BDD
- Mock au niveau repository
- Tests états Result/Option
- Focus sur use cases
- Vise 90% minimum

**Output généré:**
- Tests Vitest
- Mocks repositories
- Setup/teardown DI
- Assertions Result/Option

### doc-writer
**Fichier:** `.claude/agents/doc-writer.md`
**Capacités:**
- Sync CLAUDE.md avec code
- Update documentation API
- Génère changelog
- Maintient README sections
- Documente patterns nouveaux

## Stories

| ID | Story | Priority | Status |
|----|-------|----------|--------|
| [AGT-001](../stories/AGT-001-feature-architect.md) | Agent feature-architect | High | ✅ |
| [AGT-002](../stories/AGT-002-code-reviewer.md) | Agent code-reviewer | High | ✅ |
| [AGT-003](../stories/AGT-003-test-writer.md) | Agent test-writer | Medium | ✅ |
| [AGT-004](../stories/AGT-004-doc-writer.md) | Agent doc-writer | Low | ✅ |

## Structure fichiers

```
.claude/
└── agents/
    ├── feature-architect.md    ✅
    ├── code-reviewer.md        ✅
    ├── test-writer.md          ✅
    └── doc-writer.md           ✅
```

## Acceptance Criteria

- [x] 4 agents créés
- [x] feature-architect analyse correctement
- [x] code-reviewer détecte violations DDD
- [x] test-writer améliore coverage
- [x] Documentés (description dans chaque fichier agent)

## Usage

### Via Task Tool
```
Task tool avec subagent_type:
- feature-dev:code-architect
- feature-dev:code-reviewer
- feature-dev:test-writer (via /gen-tests skill)
```

### Invocation Manuelle
```
"Utilise l'agent code-reviewer pour analyser src/domain/billing/"
"Lance feature-architect sur l'EventStorming de la feature X"
```

## Intégration Workflow

```
                    ┌─────────────────┐
                    │  EventStorming  │
                    └────────┬────────┘
                             ▼
              ┌──────────────────────────┐
              │   feature-architect      │
              │   (propose architecture) │
              └──────────────┬───────────┘
                             ▼
              ┌──────────────────────────┐
              │   Développement code     │
              └──────────────┬───────────┘
                             ▼
         ┌───────────────────┴───────────────────┐
         ▼                                       ▼
┌─────────────────┐                   ┌─────────────────┐
│  code-reviewer  │                   │   test-writer   │
│  (review PR)    │                   │  (coverage 90%) │
└─────────────────┘                   └─────────────────┘
                             ▼
              ┌──────────────────────────┐
              │      doc-writer          │
              │   (sync documentation)   │
              └──────────────────────────┘
```
