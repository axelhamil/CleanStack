import { Github, Twitter } from "lucide-react";
import Link from "next/link";

const navigation = {
  product: [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Documentation", href: "/docs" },
  ],
  resources: [
    { name: "Getting Started", href: "/docs/getting-started" },
    { name: "Architecture", href: "/docs/architecture" },
    { name: "Examples", href: "/docs/examples" },
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
    { name: "Twitter", href: "https://twitter.com", icon: Twitter },
  ],
};

export function Footer() {
  return (
    <footer className="border-t-3 border-black dark:border-white bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-black uppercase text-sm tracking-wide mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-medium"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-black uppercase text-sm tracking-wide mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-medium"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-black uppercase text-sm tracking-wide mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-medium"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-black uppercase text-sm tracking-wide mb-4">
              Connect
            </h3>
            <div className="flex gap-4">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                >
                  <item.icon className="h-5 w-5" strokeWidth={2.5} />
                  <span className="sr-only">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t-2 border-black/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="font-black text-xl uppercase tracking-tight"
          >
            Clean Architecture Starter
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} All rights reserved. Built with Next.js
            & DDD.
          </p>
        </div>
      </div>
    </footer>
  );
}
