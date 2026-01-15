# FTR-006: Stripe Checkout Flow

## Story

**As a** user
**I want** to checkout and subscribe
**So that** I can access premium features

## Acceptance Criteria

- [ ] CreateCheckoutSessionUseCase
- [ ] Checkout API endpoint
- [ ] Redirect to Stripe Checkout
- [ ] Success/cancel handling
- [ ] User linked to Stripe customer

## Technical Notes

### Use Case

```typescript
// src/application/use-cases/billing/create-checkout-session.use-case.ts
export class CreateCheckoutSessionUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute(input: Input): Promise<Result<Output>> {
    // 1. Get user
    const userResult = await this.userRepo.findById(input.userId);
    if (userResult.isFailure) return Result.fail(userResult.getError());

    const userOption = userResult.getValue();
    if (userOption.isNone()) return Result.fail('User not found');

    const user = userOption.unwrap();

    // 2. Create checkout session
    const sessionResult = await this.paymentProvider.createCheckoutSession({
      customerEmail: user.email.value,
      priceId: input.priceId,
      successUrl: `${input.baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${input.baseUrl}/pricing`,
      metadata: { userId: user.id.value },
    });

    if (sessionResult.isFailure) return Result.fail(sessionResult.getError());

    return Result.ok({ url: sessionResult.getValue().url });
  }
}
```

### API Endpoint

```typescript
// app/api/checkout/route.ts
export async function POST(request: Request) {
  const session = await requireAuth();
  const { priceId } = await request.json();

  const useCase = getInjection('CreateCheckoutSessionUseCase');
  const result = await useCase.execute({
    userId: session.user.id,
    priceId,
    baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
  });

  if (result.isFailure) {
    return Response.json({ error: result.getError() }, { status: 400 });
  }

  return Response.json({ url: result.getValue().url });
}
```

### Client-Side

```typescript
// Pricing page button
async function handleCheckout(priceId: string) {
  setLoading(true);
  const response = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ priceId }),
  });
  const { url, error } = await response.json();

  if (error) {
    toast.error(error);
  } else {
    window.location.href = url;
  }
  setLoading(false);
}
```

### Success Page

```typescript
// app/(protected)/checkout/success/page.tsx
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string };
}) {
  // Optionally verify session
  return (
    <div className="text-center">
      <h1>Welcome to Pro!</h1>
      <p>Your subscription is now active.</p>
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
```

## Definition of Done

- [ ] UseCase implemented
- [ ] API endpoint working
- [ ] Checkout flow tested
- [ ] Success page created
