# E3: Skills Claude ✅

**Status:** COMPLET (100%)
**Dernière mise à jour:** Janvier 2025

## Description

Créer des skills pour automatiser le workflow de développement et transformer EventStorming en code.

## Objectifs

- ✅ /eventstorming : Workflow interactif de modélisation
- ✅ /feature-prd : Génération PRD depuis EventStorming
- ✅ /gen-domain : Génération Aggregate + VOs + Events
- ✅ /gen-usecase : Génération UseCase + DTOs + DI
- ✅ /gen-tests : Génération tests pour atteindre 90%

## Skills Implémentés

| Skill | Command | Purpose | Status |
|-------|---------|---------|--------|
| EventStorming | `/eventstorming` | Modélisation domain interactive | ✅ |
| Feature PRD | `/feature-prd` | Génère PRD complet | ✅ |
| Gen Domain | `/gen-domain` | Génère fichiers domain | ✅ |
| Gen UseCase | `/gen-usecase` | Génère use case complet | ✅ |
| Gen Tests | `/gen-tests` | Génère tests manquants | ✅ |

## Implémentation Détaillée

### /eventstorming
**Fichier:** `.claude/skills/eventstorming.md`
**Fonctionnalités:**
- Workflow interactif de modélisation DDD
- Identification des Bounded Contexts
- Extraction des Commands, Events, Aggregates
- Génération output structuré dans `.claude/eventstorming/[feature].md`
- Format utilisable par `/feature-prd`

### /feature-prd
**Fichier:** `.claude/skills/feature-prd.md`
**Fonctionnalités:**
- Génère Epic + Stories depuis EventStorming
- Structure PRD compatible Ralph
- Liens entre stories automatiques
- Acceptance criteria générés
- Estimation complexity (T-shirt sizing)

### /gen-domain
**Fichier:** `.claude/skills/gen-domain.md`
**Génère:**
- Aggregate avec méthodes métier
- Value Objects avec validation Zod
- Domain Events typés
- Entity ID typé (extends UUID)
- Respecte conventions CLAUDE.md

### /gen-usecase
**Fichier:** `.claude/skills/gen-usecase.md`
**Génère:**
- UseCase implements UseCase<In, Out>
- DTOs avec schemas Zod
- Port interfaces si nécessaire
- Configuration DI module
- Controller/Action wiring

### /gen-tests
**Fichier:** `.claude/skills/gen-tests.md`
**Fonctionnalités:**
- Analyse coverage existante
- Génère tests BDD pour use cases
- Mock au niveau repository
- Tests Result/Option states
- Vise 90% coverage minimum

## Stories

| ID | Story | Priority | Status |
|----|-------|----------|--------|
| [SKL-001](../stories/SKL-001-eventstorming.md) | Skill /eventstorming | High | ✅ |
| [SKL-002](../stories/SKL-002-feature-prd.md) | Skill /feature-prd | High | ✅ |
| [SKL-003](../stories/SKL-003-gen-domain.md) | Skill /gen-domain | Medium | ✅ |
| [SKL-004](../stories/SKL-004-gen-usecase.md) | Skill /gen-usecase | Medium | ✅ |
| [SKL-005](../stories/SKL-005-gen-tests.md) | Skill /gen-tests | Medium | ✅ |
| [SKL-006](../stories/SKL-006-ai-auto-routing.md) | AI auto-routing hooks | High | ⏳ Optionnel |

## Structure fichiers

```
.claude/
├── skills/             # Skills (slash commands)
│   ├── eventstorming.md    ✅
│   ├── feature-prd.md      ✅
│   ├── gen-domain.md       ✅
│   ├── gen-usecase.md      ✅
│   └── gen-tests.md        ✅
└── eventstorming/      # Output EventStorming
    └── [feature].md
```

## Acceptance Criteria

- [x] 5 skills créés et fonctionnels
- [x] /eventstorming produit output structuré
- [x] /feature-prd génère PRD utilisable par Ralph
- [x] Generators respectent conventions CLAUDE.md
- [x] Documentés (skill description dans chaque fichier)
- [ ] AI auto-routing (optionnel, non prioritaire)

## Workflow Recommandé

```
1. /eventstorming "Feature X"
   └── Génère .claude/eventstorming/feature-x.md

2. /feature-prd
   └── Lit EventStorming → Génère Epic + Stories dans .claude/ralph/prd/

3. /gen-domain [Aggregate]
   └── Génère src/domain/[aggregate]/

4. /gen-usecase [UseCase]
   └── Génère src/application/use-cases/[feature]/

5. /gen-tests
   └── Génère tests pour atteindre 90% coverage
```
