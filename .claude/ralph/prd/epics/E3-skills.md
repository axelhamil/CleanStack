# E3: Skills Claude

## Description

Créer des skills pour automatiser le workflow de développement et transformer EventStorming en code.

## Objectifs

- /eventstorming : Workflow interactif de modélisation
- /feature-prd : Génération PRD depuis EventStorming
- /gen-domain : Génération Aggregate + VOs + Events
- /gen-usecase : Génération UseCase + DTOs + DI
- /gen-tests : Génération tests pour atteindre 90%

## Skills

| Skill | Command | Purpose |
|-------|---------|---------|
| EventStorming | `/eventstorming` | Modélisation domain interactive |
| Feature PRD | `/feature-prd` | Génère PRD complet |
| Gen Domain | `/gen-domain` | Génère fichiers domain |
| Gen UseCase | `/gen-usecase` | Génère use case complet |
| Gen Tests | `/gen-tests` | Génère tests manquants |

## Stories

| ID | Story | Priority |
|----|-------|----------|
| [SKL-001](../stories/SKL-001-eventstorming.md) | Skill /eventstorming | High |
| [SKL-002](../stories/SKL-002-feature-prd.md) | Skill /feature-prd | High |
| [SKL-003](../stories/SKL-003-gen-domain.md) | Skill /gen-domain | Medium |
| [SKL-004](../stories/SKL-004-gen-usecase.md) | Skill /gen-usecase | Medium |
| [SKL-005](../stories/SKL-005-gen-tests.md) | Skill /gen-tests | Medium |
| [SKL-006](../stories/SKL-006-ai-auto-routing.md) | AI auto-routing hooks | High |

## Structure fichiers

```
.claude/
├── commands/           # Skills (slash commands)
│   ├── eventstorming.md
│   ├── feature-prd.md
│   ├── gen-domain.md
│   ├── gen-usecase.md
│   └── gen-tests.md
└── eventstorming/      # Output EventStorming
    └── [feature].md
```

## Acceptance Criteria

- [ ] 6 skills créés et fonctionnels
- [ ] /eventstorming produit output structuré
- [ ] /feature-prd génère PRD utilisable par Ralph
- [ ] Generators respectent conventions CLAUDE.md
- [ ] Documentés dans CLAUDE.md
- [ ] AI auto-routing suggère le bon skill automatiquement
