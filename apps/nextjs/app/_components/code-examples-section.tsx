"use client";

import {
  BrutalistTabContent,
  BrutalistTabs,
} from "@packages/ui/components/brutalist-tabs";
import { FloatingSymbol } from "@packages/ui/components/decorative-shape";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

const examples = {
  value_object: `export class Email extends ValueObject<EmailProps> {
  protected validate(props: EmailProps): Result<EmailProps> {
    if (!emailRegex.test(props.value)) {
      return Result.fail("Invalid email");
    }
    return Result.ok(props);
  }

  get value(): string {
    return this.props.value;
  }
}`,
  use_case: `export class CreateUserUseCase {
  constructor(
    private userRepo: IUserRepository
  ) {}

  async execute(input: CreateUserInput): Promise<Result<User>> {
    const emailOrError = Email.create(input.email);
    if (emailOrError.isFailure) {
      return Result.fail(emailOrError.getError());
    }

    const user = User.create({
      email: emailOrError.getValue(),
      name: input.name
    });

    await this.userRepo.save(user);
    return Result.ok(user);
  }
}`,
};

type TabId = keyof typeof examples;

export function CodeExamplesSection() {
  const t = useTranslations("home.code");
  const [activeTab, setActiveTab] = useState<TabId>("value_object");

  const tabs = [
    { id: "value_object" as const, label: t("tab_value_object") },
    { id: "use_case" as const, label: t("tab_use_case") },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      <FloatingSymbol symbol="{" position="top-20 right-20" delay={0} />
      <FloatingSymbol symbol="}" position="bottom-20 left-20" delay={1} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black uppercase text-center mb-16"
        >
          {t("title")}
        </motion.h2>

        <div className="max-w-4xl mx-auto">
          <BrutalistTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            className="mb-6"
          />

          <BrutalistTabContent activeTab={activeTab}>
            <pre className="text-green-400 dark:text-green-600 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto">
              {examples[activeTab]}
            </pre>
          </BrutalistTabContent>
        </div>
      </div>
    </section>
  );
}
