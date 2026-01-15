---
event: UserPromptSubmit
---

# Skill Auto-Suggestions

When the user submits a prompt, analyze the intent and suggest the appropriate skill if applicable.

## Detection Rules

### EventStorming Detection
If the prompt contains keywords about domain modeling:
- "eventstorm", "domain event", "aggregate", "model the domain", "discover the domain"
- → Suggest: `/eventstorming` for structured domain discovery

### Feature PRD Detection
If the prompt asks about feature requirements:
- "feature", "user story", "acceptance criteria", "prd", "specification", "requirements"
- → Suggest: `/feature-prd` to generate a structured PRD

### Domain Generation Detection
If the prompt asks to create domain entities:
- "create aggregate", "create entity", "generate domain", "new domain", "add aggregate"
- → Suggest: `/gen-domain [AggregateName]` for domain scaffolding

### UseCase Generation Detection
If the prompt asks to create use cases:
- "create use case", "generate use case", "new use case", "implement use case", "add use case"
- → Suggest: `/gen-usecase [UseCaseName]` for use case scaffolding

### Test Generation Detection
If the prompt asks for tests:
- "write test", "create test", "generate test", "add test", "test coverage"
- → Suggest: `/gen-tests [TargetName]` for BDD test scaffolding

## Workflow Suggestions

When completing a skill, suggest the next logical step:

1. After `/eventstorming` → Suggest `/feature-prd` with the output
2. After `/feature-prd` → Suggest `/gen-domain` for each aggregate
3. After `/gen-domain` → Suggest `/gen-usecase` for each command
4. After `/gen-usecase` → Suggest `/gen-tests` for the use case
5. After `/gen-tests` → Suggest running tests with `pnpm test`

## Suggestion Format

When suggesting a skill, use this format:

```
💡 **Tip**: For {task type}, use `/{skill-name}` to get structured {output type}.

Example: `/{skill-name} {example args}`
```

## Do Not Suggest

- When the user explicitly invokes a skill (starts with `/`)
- When the user is in the middle of a multi-step task
- When the prompt is a simple question or clarification
- When the user has disabled suggestions
