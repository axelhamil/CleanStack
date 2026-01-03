"use client";

import { motion } from "framer-motion";
import { Bot, Brain, FileCode2, Sparkles, Zap } from "lucide-react";

const aiFeatures = [
  {
    icon: Bot,
    title: "Claude Code Ready",
    description:
      "Complete CLAUDE.md with architecture context. AI understands your codebase instantly.",
  },
  {
    icon: Brain,
    title: "Explicit Patterns",
    description:
      "Result<T>, Option<T>, and DDD patterns documented for AI comprehension.",
  },
  {
    icon: FileCode2,
    title: ".cursorrules Included",
    description:
      "Architectural rules defined. AI follows Clean Architecture automatically.",
  },
  {
    icon: Sparkles,
    title: "AI-Optimized DX",
    description:
      "Type-safe patterns and helper scripts. Build faster with AI assistance.",
  },
];

export function AIFeaturesSection() {
  return (
    <section className="py-24 bg-white dark:bg-black">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 border-2 border-black dark:border-white bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50">
            <Zap className="w-4 h-4" />
            <span className="font-bold uppercase text-xs tracking-wide">
              AI-First Development
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black uppercase mb-6">
            Built for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              AI Assistants
            </span>
          </h2>

          <p className="text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            Every architectural decision is documented and optimized for AI
            comprehension.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-16">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-6 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-black dark:bg-white rounded-sm shrink-0">
                  <feature.icon className="w-5 h-5 text-white dark:text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="border-2 border-black dark:border-white bg-gray-900 dark:bg-gray-950 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-3 text-green-400 font-mono text-xs">
                CLAUDE.md
              </span>
            </div>
            <pre className="text-green-400 font-mono text-xs leading-relaxed overflow-x-auto">
              <code>{`# AI Development Guidelines

## Mandatory Rules

### Respect the Dependency Rule (CRITICAL)
- Domain MUST NOT import from Application
- All dependencies point INWARD

### Error Handling Pattern (MANDATORY)
**NEVER throw exceptions** in Domain/Application.
Use Result<T> pattern:

const result = Email.create(input.email)
if (result.isFailure) {
  return Result.fail(result.error)
}`}</code>
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
