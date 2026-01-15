"use client";

import { BrutalistBadge } from "@packages/ui/components/brutalist-badge";
import { BrutalistButton } from "@packages/ui/components/brutalist-button";
import { GridBackground } from "@packages/ui/components/grid-background";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Bug,
  CheckCircle2,
  Code2,
  FileText,
  Github,
  Layers,
  Scale,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import Link from "next/link";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function ManifestSection({
  children,
  variant = "light",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "light" | "dark" | "accent";
  className?: string;
}) {
  const bgClasses = {
    light: "bg-white dark:bg-black",
    dark: "bg-black dark:bg-white text-white dark:text-black",
    accent: "bg-yellow-300 dark:bg-yellow-500",
  };

  return (
    <section
      className={`relative py-24 overflow-hidden ${bgClasses[variant]} ${className}`}
    >
      {variant === "dark" && <GridBackground animated size={50} />}
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {children}
      </div>
    </section>
  );
}

function FeaturePoint({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <motion.div variants={fadeIn} className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-12 h-12 border-3 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500 flex items-center justify-center">
        <Icon className="w-6 h-6" strokeWidth={2.5} />
      </div>
      <div>
        <h4 className="font-bold text-lg uppercase tracking-tight mb-1">
          {title}
        </h4>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function CodeFlow() {
  const steps = ["Controller", "Use Case", "Domain", "Repository"];
  return (
    <motion.div
      variants={fadeIn}
      className="flex items-center justify-center gap-2 my-8 flex-wrap"
    >
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <span className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-mono text-sm font-bold">
            {step}
          </span>
          {i < steps.length - 1 && (
            <ArrowRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      ))}
    </motion.div>
  );
}

export default function ManifestPage() {
  return (
    <main className="bg-white dark:bg-black text-black dark:text-white">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
        <GridBackground />

        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl py-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <BrutalistBadge icon={FileText}>Manifest</BrutalistBadge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[1.1]"
          >
            Our
            <br />
            <span className="inline-block bg-black dark:bg-white text-white dark:text-black px-5 py-1 mt-2">
              Approach
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto text-gray-700 dark:text-gray-300"
          >
            A Next.js 16 monorepo with Clean Architecture + DDD. Here&apos;s why
            we built it this way.
          </motion.p>
        </div>
      </section>

      {/* The Context */}
      <ManifestSection variant="dark">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-5xl font-black uppercase mb-8"
          >
            The Context
          </motion.h2>

          <motion.div
            variants={fadeIn}
            className="space-y-6 text-lg leading-relaxed"
          >
            <p>
              AI tools write code fast. Really fast. You describe what you want,
              and thousands of lines appear. It&apos;s impressive.
            </p>

            <p>
              But we noticed something: the code that&apos;s easy to generate
              isn&apos;t always easy to maintain. When AI hallucinates or
              introduces subtle bugs, you need to be able to step in and fix
              things.
            </p>

            <p>
              That&apos;s only possible if you can actually understand the code.
              And that&apos;s easier when there&apos;s a clear structure to
              follow.
            </p>
          </motion.div>
        </motion.div>
      </ManifestSection>

      {/* Why This Structure */}
      <ManifestSection variant="accent">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-black"
        >
          <motion.div
            variants={fadeIn}
            className="flex items-center gap-3 mb-6"
          >
            <Layers className="w-8 h-8" />
            <span className="font-bold uppercase tracking-wide text-sm">
              The Structure
            </span>
          </motion.div>

          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-5xl font-black uppercase mb-8"
          >
            Why Clean Architecture + DDD
          </motion.h2>

          <motion.p variants={fadeIn} className="text-lg mb-8">
            We picked these patterns because they work well with AI tools and
            make debugging straightforward.
          </motion.p>

          <motion.div variants={stagger} className="space-y-8">
            <FeaturePoint
              icon={Brain}
              title="AI Knows These Patterns"
              description="Clean Architecture and DDD are well-documented. When you ask for a 'SignInUseCase', AI tools know exactly what that means."
            />

            <FeaturePoint
              icon={Bug}
              title="Easy to Navigate"
              description="Domain logic in src/domain/. Use cases in src/application/. Each file does one thing. You can find what you're looking for quickly."
            />

            <FeaturePoint
              icon={Shield}
              title="Explicit Error Handling"
              description="Result<T> makes failures visible. No hidden exceptions to discover in production."
            />

            <FeaturePoint
              icon={Scale}
              title="Same Pattern, Any Scale"
              description="First feature or fiftieth, same structure. No rewrites needed as the project grows."
            />
          </motion.div>

          <motion.div variants={fadeIn} className="mt-12">
            <p className="font-bold text-lg mb-4">The flow is consistent:</p>
            <CodeFlow />
          </motion.div>
        </motion.div>
      </ManifestSection>

      {/* What's Included */}
      <ManifestSection variant="dark">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div
            variants={fadeIn}
            className="flex items-center gap-3 mb-6"
          >
            <Sparkles className="w-8 h-8 text-green-400" />
            <span className="font-bold uppercase tracking-wide text-sm text-green-400">
              What&apos;s Included
            </span>
          </motion.div>

          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-5xl font-black uppercase mb-8"
          >
            Out of the Box
          </motion.h2>

          <motion.div variants={stagger} className="space-y-6">
            <motion.div variants={fadeIn}>
              <ul className="space-y-3">
                {[
                  "Complete authentication (sign up, sign in, sessions, email verification)",
                  "Patterns documented in CLAUDE.md",
                  "Every layer with working examples",
                  "Type-safe from domain to API",
                  "AI skills for code generation (/gen-domain, /gen-usecase, /gen-tests)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </motion.div>
      </ManifestSection>

      {/* Not Over-Engineering */}
      <ManifestSection variant="light">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div
            variants={fadeIn}
            className="flex items-center gap-3 mb-6"
          >
            <Code2 className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <span className="font-bold uppercase tracking-wide text-sm text-orange-600 dark:text-orange-400">
              A Note
            </span>
          </motion.div>

          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-5xl font-black uppercase mb-8"
          >
            About Complexity
          </motion.h2>

          <motion.div
            variants={fadeIn}
            className="space-y-6 text-lg leading-relaxed"
          >
            <p>
              More files doesn&apos;t mean more work. You&apos;re writing the
              same code — it just lives in different places.
            </p>

            <p>Whether you use Clean Architecture or not, you still need to:</p>

            <ul className="space-y-2 my-6 pl-4">
              {[
                "Validate user input",
                "Execute business logic",
                "Save data to a database",
                "Handle errors",
                "Return a response",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-black dark:bg-white" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <motion.div
              variants={fadeIn}
              className="border-4 border-black dark:border-white p-6 my-8 bg-gray-50 dark:bg-gray-900"
            >
              <p className="text-xl font-bold">
                Same code. Different organization.
              </p>
            </motion.div>

            <p>
              The structure makes it easier to find things later. That&apos;s
              the tradeoff we chose.
            </p>
          </motion.div>
        </motion.div>
      </ManifestSection>

      {/* Quick Start */}
      <ManifestSection
        variant="dark"
        className="border-t-4 border-white dark:border-black"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeIn}
            className="text-3xl md:text-5xl font-black uppercase mb-8 text-center"
          >
            Get Started
          </motion.h2>

          <motion.div
            variants={fadeIn}
            className="bg-gray-900 dark:bg-gray-100 text-green-400 dark:text-green-600 p-6 font-mono text-sm mb-12 border-4 border-white dark:border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <pre className="overflow-x-auto">
              {`pnpm install && cp .env.example .env
pnpm db && pnpm db:push
pnpm dev`}
            </pre>
          </motion.div>

          <motion.div variants={fadeIn} className="mb-12">
            <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Documentation
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <Link
                  href="https://github.com/axelhamil/nextjs-clean-architecture-starter/blob/main/docs/01-quick-start.md"
                  className="hover:underline font-medium"
                >
                  Quick Start
                </Link>
                <span className="text-gray-400">— Installation and setup</span>
              </li>
              <li className="flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <Link
                  href="https://github.com/axelhamil/nextjs-clean-architecture-starter/blob/main/docs/02-architecture.md"
                  className="hover:underline font-medium"
                >
                  Architecture
                </Link>
                <span className="text-gray-400">
                  — Clean Architecture layers
                </span>
              </li>
              <li className="flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <Link
                  href="https://github.com/axelhamil/nextjs-clean-architecture-starter/blob/main/docs/03-tutorial-first-feature.md"
                  className="hover:underline font-medium"
                >
                  Tutorial
                </Link>
                <span className="text-gray-400">
                  — Build your first feature
                </span>
              </li>
              <li className="flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <Link
                  href="https://github.com/axelhamil/nextjs-clean-architecture-starter/blob/main/docs/04-ai-workflow.md"
                  className="hover:underline font-medium"
                >
                  AI Workflow
                </Link>
                <span className="text-gray-400">
                  — Claude skills and agents
                </span>
              </li>
              <li className="flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <Link
                  href="https://github.com/axelhamil/nextjs-clean-architecture-starter/blob/main/docs/08-core-concepts.md"
                  className="hover:underline font-medium"
                >
                  Core Concepts
                </Link>
                <span className="text-gray-400">
                  — Result, Option, Value Objects
                </span>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={fadeIn} className="mb-12">
            <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              AI Skills
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <code className="px-2 py-1 bg-white dark:bg-black text-black dark:text-white font-mono text-sm">
                  /feature-prd
                </code>
                <span className="text-gray-400">
                  Conversational PRD with EventStorming
                </span>
              </li>
              <li className="flex items-center gap-3">
                <code className="px-2 py-1 bg-white dark:bg-black text-black dark:text-white font-mono text-sm">
                  /gen-domain
                </code>
                <span className="text-gray-400">
                  Generate domain layer code
                </span>
              </li>
              <li className="flex items-center gap-3">
                <code className="px-2 py-1 bg-white dark:bg-black text-black dark:text-white font-mono text-sm">
                  /gen-usecase
                </code>
                <span className="text-gray-400">
                  Generate use case with DTOs
                </span>
              </li>
              <li className="flex items-center gap-3">
                <code className="px-2 py-1 bg-white dark:bg-black text-black dark:text-white font-mono text-sm">
                  /gen-tests
                </code>
                <span className="text-gray-400">Generate BDD tests</span>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={fadeIn} className="mb-12">
            <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js 16",
                "TypeScript 5.9",
                "Drizzle ORM",
                "PostgreSQL",
                "BetterAuth",
                "Turborepo",
                "Tailwind CSS 4",
                "shadcn/ui",
                "Biome",
                "Vitest",
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 border-2 border-white dark:border-black text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16"
          >
            <BrutalistButton size="lg" asChild>
              <Link href="https://github.com/axelhamil/nextjs-clean-architecture-starter">
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </Link>
            </BrutalistButton>
            <BrutalistButton size="lg" variant="outline" asChild>
              <Link href="/">← Back to Home</Link>
            </BrutalistButton>
          </motion.div>
        </motion.div>
      </ManifestSection>
    </main>
  );
}
