# FTR-008: Customer Portal

## Story

**As a** user
**I want** to manage my subscription
**So that** I can update payment methods or cancel

## Acceptance Criteria

- [ ] CreatePortalSessionUseCase
- [ ] Portal API endpoint
- [ ] Link in settings/dashboard
- [ ] Redirect to Stripe portal

## Technical Notes

### Use Case

```typescript
// src/application/use-cases/billing/create-portal-session.use-case.ts
export class CreatePortalSessionUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute(input: Input): Promise<Result<Output>> {
    // 1. Get user's subscription
    const subResult = await this.subscriptionRepo.findByUserId(input.userId);
    if (subResult.isFailure) return Result.fail(subResult.getError());

    const subOption = subResult.getValue();
    if (subOption.isNone()) {
      return Result.fail('No subscription found');
    }

    const subscription = subOption.unwrap();

    // 2. Create portal session
    const portalResult = await this.paymentProvider.createCustomerPortalSession(
      subscription.stripeCustomerId
    );

    if (portalResult.isFailure) return Result.fail(portalResult.getError());

    return Result.ok({ url: portalResult.getValue().url });
  }
}
```

### API Endpoint

```typescript
// app/api/billing/portal/route.ts
export async function POST(request: Request) {
  const session = await requireAuth();

  const useCase = getInjection('CreatePortalSessionUseCase');
  const result = await useCase.execute({
    userId: session.user.id,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  if (result.isFailure) {
    return Response.json({ error: result.getError() }, { status: 400 });
  }

  return Response.json({ url: result.getValue().url });
}
```

### Stripe Provider Addition

```typescript
// In StripePaymentProvider
async createCustomerPortalSession(customerId: string): Promise<Result<PortalSession>> {
  try {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.NEXT_PUBLIC_APP_URL + '/settings/billing',
    });
    return Result.ok({ url: session.url });
  } catch (error) {
    return Result.fail(`Portal error: ${error.message}`);
  }
}
```

### UI Component

```typescript
// app/(protected)/settings/billing/_components/manage-subscription.tsx
export function ManageSubscription() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    const response = await fetch('/api/billing/portal', { method: 'POST' });
    const { url, error } = await response.json();

    if (error) {
      toast.error(error);
    } else {
      window.location.href = url;
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Manage your billing and subscription</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={openPortal} disabled={loading}>
          {loading ? <Spinner /> : null}
          Manage Subscription
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Stripe Portal Configuration

Configure at: https://dashboard.stripe.com/settings/billing/portal

Enable:
- Update payment methods
- View invoice history
- Cancel subscription
- Update billing information

## Definition of Done

- [ ] UseCase implemented
- [ ] API endpoint working
- [ ] Portal opens correctly
- [ ] Return URL configured
