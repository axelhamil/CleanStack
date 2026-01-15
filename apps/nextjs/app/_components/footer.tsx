import { Github, Globe, Twitter } from "lucide-react";
import Link from "next/link";

const navigation = {
  product: [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Manifest", href: "/docs" },
  ],
  resources: [
    {
      name: "Quick Start",
      href: "https://github.com/axelhamil/nextjs-clean-architecture-starter/blob/main/docs/01-quick-start.md",
    },
    {
      name: "Architecture",
      href: "https://github.com/axelhamil/nextjs-clean-architecture-starter/blob/main/docs/02-architecture.md",
    },
    {
      name: "AI Workflow",
      href: "https://github.com/axelhamil/nextjs-clean-architecture-starter/blob/main/docs/04-ai-workflow.md",
    },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ],
  social: [
    {
      name: "GitHub",
      href: "https://github.com/axelhamil/nextjs-clean-architecture-starter",
      icon: Github,
    },
    {
      name: "Website",
      href: "https://axelhamilcaro.com",
      icon: Globe,
    },
    { name: "Twitter", href: "https://twitter.com", icon: Twitter },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-secondary/20">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">
              Connect
            </h3>
            <div className="flex gap-3">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-border/50 bg-card/50 text-muted-foreground hover:text-primary hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <item.icon className="h-5 w-5" strokeWidth={2} />
                  <span className="sr-only">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            CleanStack
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} All rights reserved. Built with Next.js
            & DDD.
          </p>
        </div>
      </div>
    </footer>
  );
}
