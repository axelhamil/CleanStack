# REL-004: Issue & PR Templates

## Story

**As a** maintainer
**I want** issue and PR templates
**So that** contributions are consistent

## Acceptance Criteria

- [ ] Bug report template
- [ ] Feature request template
- [ ] PR template
- [ ] Templates are clear and helpful

## Technical Notes

### Bug Report Template

```markdown
<!-- .github/ISSUE_TEMPLATE/bug_report.md -->
---
name: Bug Report
about: Report a bug to help us improve
labels: bug
---

## Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: [e.g., macOS 14]
- Node: [e.g., 20.10]
- pnpm: [e.g., 8.x]

## Additional Context
Screenshots, logs, etc.
```

### Feature Request Template

```markdown
<!-- .github/ISSUE_TEMPLATE/feature_request.md -->
---
name: Feature Request
about: Suggest a feature for this project
labels: enhancement
---

## Problem
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other solutions you've considered.

## Additional Context
Any other context about the feature.
```

### PR Template

```markdown
<!-- .github/pull_request_template.md -->
## Summary
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Related Issues
Fixes #(issue)

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] `pnpm check:all` passes
- [ ] No new warnings

## Screenshots
If UI changes, add screenshots.
```

### Config

```yaml
# .github/ISSUE_TEMPLATE/config.yml
blank_issues_enabled: false
contact_links:
  - name: Documentation
    url: https://github.com/[org]/[repo]/blob/main/CLAUDE.md
    about: Check the documentation first
```

## Definition of Done

- [ ] Templates created
- [ ] Config file added
- [ ] Templates tested
