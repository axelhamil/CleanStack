# FTR-012: Landing Page

## Story

**As a** visitor
**I want** a compelling landing page
**So that** I understand the product value

## Acceptance Criteria

- [ ] Hero section
- [ ] Features section
- [ ] Social proof (optional)
- [ ] CTA sections
- [ ] Footer
- [ ] Mobile responsive

## Implementation

### Page Structure

```typescript
// app/(marketing)/page.tsx
import { Hero } from "./_components/hero";
import { Features } from "./_components/features";
import { CTA } from "./_components/cta";
import { Footer } from "./_components/footer";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </>
  );
}
```

### Hero Section

```typescript
// app/(marketing)/_components/hero.tsx
export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Build faster with{" "}
            <span className="text-primary">Clean Architecture</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Production-ready Next.js starter with DDD, AI-powered development,
            and everything you need to ship fast.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs">Documentation</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Features Section

```typescript
// app/(marketing)/_components/features.tsx
const features = [
  {
    icon: Layers,
    title: "Clean Architecture",
    description: "Layered architecture with clear boundaries and dependencies.",
  },
  {
    icon: Code,
    title: "DDD Patterns",
    description: "Aggregates, Value Objects, Domain Events out of the box.",
  },
  {
    icon: Bot,
    title: "AI-First",
    description: "Skills and agents designed for Claude Code development.",
  },
  {
    icon: Zap,
    title: "Production Ready",
    description: "Auth, payments, and UI components included.",
  },
];

export function Features() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Everything You Need</h2>
          <p className="mt-4 text-muted-foreground">
            Start building your SaaS in minutes, not weeks.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### CTA Section

```typescript
// app/(marketing)/_components/cta.tsx
export function CTA() {
  return (
    <section className="py-20">
      <div className="container">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mt-4 max-w-lg opacity-90">
              Join developers who are building faster with Clean Architecture.
            </p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link href="/signup">Start Building Today</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
```

### Footer

```typescript
// app/(marketing)/_components/footer.tsx
export function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AppName. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
```

## Definition of Done

- [ ] All sections implemented
- [ ] Mobile responsive
- [ ] Links work
- [ ] Visually appealing
