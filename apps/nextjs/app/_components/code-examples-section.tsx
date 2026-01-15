"use client";

import { FloatingSymbol } from "@packages/ui/components/decorative-shape";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@packages/ui/components/ui/tabs";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

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

export function CodeExamplesSection() {
  const t = useTranslations("home.code");

  return (
    <section className="py-24 bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
      <FloatingSymbol symbol="{" position="top-20 right-20" delay={0} />
      <FloatingSymbol symbol="}" position="bottom-20 left-20" delay={1} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold text-center mb-16"
        >
          {t("title")}
        </motion.h2>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="value_object">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <TabsList className="mb-6">
                <TabsTrigger value="value_object">
                  {t("tab_value_object")}
                </TabsTrigger>
                <TabsTrigger value="use_case">{t("tab_use_case")}</TabsTrigger>
              </TabsList>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-lg overflow-hidden"
            >
              <TabsContent value="value_object" className="m-0">
                <pre className="text-emerald-600 dark:text-emerald-400 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto p-6 bg-gradient-to-br from-background to-secondary/20">
                  {examples.value_object}
                </pre>
              </TabsContent>
              <TabsContent value="use_case" className="m-0">
                <pre className="text-emerald-600 dark:text-emerald-400 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto p-6 bg-gradient-to-br from-background to-secondary/20">
                  {examples.use_case}
                </pre>
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
