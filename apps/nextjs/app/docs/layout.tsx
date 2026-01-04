"use client";

import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Github, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

const navSections = [
  {
    title: "Introduction",
    items: [
      {
        href: "/docs",
        label: "Overview",
      },
      {
        href: "/docs/getting-started",
        label: "Getting Started",
      },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      {
        href: "/docs/core-concepts",
        label: "DDD Patterns",
      },
      {
        href: "/docs/core-concepts/result",
        label: "Result Pattern",
      },
      {
        href: "/docs/core-concepts/option",
        label: "Option Pattern",
      },
      {
        href: "/docs/core-concepts/value-objects",
        label: "Value Objects",
      },
      {
        href: "/docs/core-concepts/entities",
        label: "Entities & Aggregates",
      },
    ],
  },
  {
    title: "Architecture",
    items: [
      {
        href: "/docs/architecture",
        label: "Clean Architecture",
      },
      {
        href: "/docs/architecture/layers",
        label: "Layers",
      },
      {
        href: "/docs/architecture/dependency-rule",
        label: "Dependency Rule",
      },
    ],
  },
  {
    title: "AI Development",
    items: [
      {
        href: "/docs/ai",
        label: "AI-Friendly Development",
      },
      {
        href: "/docs/ai/claude-code",
        label: "Claude Code",
      },
      {
        href: "/docs/ai/cursor",
        label: "Cursor",
      },
      {
        href: "/docs/ai/prompts",
        label: "Prompts",
      },
    ],
  },
  {
    title: "Guides",
    items: [
      {
        href: "/docs/guides/authentication",
        label: "Authentication",
      },
      {
        href: "/docs/guides/first-use-case",
        label: "Your First Use Case",
      },
      {
        href: "/docs/guides/transactions",
        label: "Transactions",
      },
      {
        href: "/docs/guides/testing",
        label: "Testing",
      },
    ],
  },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-base hover:opacity-70 transition-opacity"
              >
                <BookOpen className="w-5 h-5" />
                <span className="hidden sm:inline">CleanStack</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Link
                  href="/docs"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Docs
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="https://github.com/axelhamil/nextjs-clean-architecture-starter"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </Link>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md transition-colors"
                aria-label="Toggle navigation"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 lg:gap-12 py-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-24 space-y-6">
              {navSections.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-2 px-2 text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`
															block px-2 py-1.5 text-sm rounded-md transition-colors
															${
                                isActive
                                  ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-medium"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white"
                              }
														`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="mb-2 px-2 text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  Resources
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>
                    <Link
                      href="https://github.com/axelhamil/nextjs-clean-architecture-starter"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-2 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://claude.ai/code"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-2 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <span className="text-base">🤖</span>
                      Claude Code
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </aside>

          {/* Mobile Sidebar */}
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 top-14 z-40 bg-black/20 dark:bg-black/40"
              onClick={() => setIsSidebarOpen(false)}
            >
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="w-64 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-6 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <nav className="space-y-6">
                  {navSections.map((section) => (
                    <div key={section.title}>
                      <h3 className="mb-2 px-2 text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        {section.title}
                      </h3>
                      <ul className="space-y-1">
                        {section.items.map((item) => {
                          const isActive = pathname === item.href;
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
																	block px-2 py-1.5 text-sm rounded-md transition-colors
																	${
                                    isActive
                                      ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-medium"
                                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white"
                                  }
																`}
                              >
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </nav>
              </motion.aside>
            </motion.div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 max-w-3xl">
            <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-headings:font-semibold prose-h1:text-3xl prose-h1:mb-6 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2 prose-p:text-[15px] prose-p:leading-7 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:font-normal prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 dark:prose-pre:bg-black prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:text-sm prose-ul:my-5 prose-ul:list-disc prose-ol:my-5 prose-ol:list-decimal prose-li:my-1.5 prose-li:text-gray-700 dark:prose-li:text-gray-300">
              {children}
            </article>

            {/* Navigation Footer */}
            <nav className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm">
              {(() => {
                const allItems = navSections.flatMap((s) => s.items);
                const currentIndex = allItems.findIndex(
                  (i) => i.href === pathname,
                );
                const prevItem =
                  currentIndex > 0 ? allItems[currentIndex - 1] : null;
                const nextItem =
                  currentIndex < allItems.length - 1
                    ? allItems[currentIndex + 1]
                    : null;

                return (
                  <>
                    {prevItem ? (
                      <Link
                        href={prevItem.href}
                        className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium group"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                        <span>{prevItem.label}</span>
                      </Link>
                    ) : (
                      <div />
                    )}

                    {nextItem ? (
                      <Link
                        href={nextItem.href}
                        className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium ml-auto group"
                      >
                        <span>{nextItem.label}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    ) : (
                      <div />
                    )}
                  </>
                );
              })()}
            </nav>
          </main>
        </div>
      </div>
    </div>
  );
}
