# E8: Starter Features

## Description

Features production-ready out-of-the-box pour rivaliser avec Shipfast/Nowts.

## Objectifs

- Auth complet
- Stripe integration
- Pricing components
- Dashboard layout
- Landing page
- Settings pages
- Email templates

## Features

| Feature | Status | Stories |
|---------|--------|---------|
| Auth | Partial ✅ | FTR-001 à 003 |
| Stripe | 🔴 | FTR-004 à 008 |
| Pricing UI | 🔴 | FTR-009 à 011 |
| Dashboard | 🔴 | FTR-012 à 014 |
| Landing | 🔴 | FTR-015 à 017 |
| Settings | 🔴 | FTR-018 à 020 |
| Emails | 🔴 | FTR-021 à 023 |

## Stories

### Auth
| ID | Story | Priority |
|----|-------|----------|
| [FTR-001](../stories/FTR-001-auth-verify.md) | Vérifier auth existant | High |
| [FTR-002](../stories/FTR-002-auth-oauth.md) | OAuth providers | Medium |
| [FTR-003](../stories/FTR-003-auth-ui.md) | Auth UI polish | Medium |

### Stripe
| ID | Story | Priority |
|----|-------|----------|
| [FTR-004](../stories/FTR-004-billing-domain.md) | Domain Billing | High |
| [FTR-005](../stories/FTR-005-stripe-provider.md) | StripePaymentProvider | High |
| [FTR-006](../stories/FTR-006-stripe-checkout.md) | Checkout flow | High |
| [FTR-007](../stories/FTR-007-stripe-webhooks.md) | Webhooks handling | High |
| [FTR-008](../stories/FTR-008-stripe-portal.md) | Customer portal | Medium |

### UI
| ID | Story | Priority |
|----|-------|----------|
| [FTR-009](../stories/FTR-009-pricing-components.md) | Pricing components | High |
| [FTR-010](../stories/FTR-010-pricing-page.md) | Pricing page | High |
| [FTR-011](../stories/FTR-011-dashboard-layout.md) | Dashboard layout | High |
| [FTR-012](../stories/FTR-012-landing-page.md) | Landing page | Medium |
| [FTR-013](../stories/FTR-013-settings-pages.md) | Settings pages | Medium |

### Emails
| ID | Story | Priority |
|----|-------|----------|
| [FTR-014](../stories/FTR-014-email-setup.md) | Email provider (Resend) | Medium |
| [FTR-015](../stories/FTR-015-email-templates.md) | Email templates | Medium |

### Infrastructure
| ID | Story | Priority |
|----|-------|----------|
| [FTR-016](../stories/FTR-016-vercel-deployment.md) | Vercel deployment | High |
| [FTR-017](../stories/FTR-017-sentry-monitoring.md) | Sentry monitoring (optional) | Low |

## Acceptance Criteria

- [ ] Auth flow complet
- [ ] Stripe checkout → webhook → subscription
- [ ] Pricing page responsive
- [ ] Dashboard fonctionnel
- [ ] Landing page compelling
- [ ] Settings fonctionnels
- [ ] 90% coverage sur billing
