# FTR-009: Pricing Components

## Story

**As a** developer
**I want** reusable pricing components
**So that** I can build a pricing page quickly

## Acceptance Criteria

- [ ] PricingCard component
- [ ] PricingToggle (monthly/yearly)
- [ ] FeatureList component
- [ ] PricingTable component
- [ ] Responsive design

## Components

### PricingCard

```typescript
// packages/ui/src/components/pricing-card.tsx
interface PricingCardProps {
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  highlighted?: boolean;
  ctaText: string;
  onSelect: () => void;
  loading?: boolean;
}

export function PricingCard({
  name,
  description,
  price,
  interval,
  features,
  highlighted,
  ctaText,
  onSelect,
  loading,
}: PricingCardProps) {
  return (
    <Card className={cn(
      "relative",
      highlighted && "border-primary shadow-lg"
    )}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge>Most Popular</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground">/{interval}</span>
        </div>
        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={highlighted ? "default" : "outline"}
          onClick={onSelect}
          disabled={loading}
        >
          {loading && <Spinner />}
          {ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### PricingToggle

```typescript
// packages/ui/src/components/pricing-toggle.tsx
interface PricingToggleProps {
  interval: 'month' | 'year';
  onChange: (interval: 'month' | 'year') => void;
  yearlyDiscount?: number;
}

export function PricingToggle({ interval, onChange, yearlyDiscount }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span className={cn(interval === 'month' && "font-semibold")}>Monthly</span>
      <Switch
        checked={interval === 'year'}
        onCheckedChange={(checked) => onChange(checked ? 'year' : 'month')}
      />
      <span className={cn(interval === 'year' && "font-semibold")}>
        Yearly
        {yearlyDiscount && (
          <Badge variant="secondary" className="ml-2">
            Save {yearlyDiscount}%
          </Badge>
        )}
      </span>
    </div>
  );
}
```

### PricingTable

```typescript
// packages/ui/src/components/pricing-table.tsx
interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted?: boolean;
  priceId: {
    monthly: string;
    yearly: string;
  };
}

interface PricingTableProps {
  plans: Plan[];
  onSelectPlan: (priceId: string) => void;
  loading?: string; // priceId being loaded
}

export function PricingTable({ plans, onSelectPlan, loading }: PricingTableProps) {
  const [interval, setInterval] = useState<'month' | 'year'>('month');

  return (
    <div className="space-y-8">
      <PricingToggle
        interval={interval}
        onChange={setInterval}
        yearlyDiscount={20}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            name={plan.name}
            description={plan.description}
            price={interval === 'month' ? plan.monthlyPrice : plan.yearlyPrice}
            interval={interval}
            features={plan.features}
            highlighted={plan.highlighted}
            ctaText={plan.monthlyPrice === 0 ? "Get Started" : "Subscribe"}
            onSelect={() => onSelectPlan(plan.priceId[interval === 'month' ? 'monthly' : 'yearly'])}
            loading={loading === plan.priceId[interval === 'month' ? 'monthly' : 'yearly']}
          />
        ))}
      </div>
    </div>
  );
}
```

## Definition of Done

- [ ] Components created
- [ ] Storybook stories (optional)
- [ ] Responsive design
- [ ] Accessible
