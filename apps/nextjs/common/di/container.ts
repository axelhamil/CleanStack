import { createContainer } from "@evyweb/ioctopus";
import type { InMemoryEventDispatcher } from "@/adapters/events/in-memory-event-dispatcher";
import { createAuthModule } from "./modules/auth.module";
import { createBillingModule } from "./modules/billing.module";
import { createEmailModule } from "./modules/email.module";
import {
  createEventsModule,
  registerEventHandlers,
} from "./modules/events.module";
import { type DI_RETURN_TYPES, DI_SYMBOLS } from "./types";

const ApplicationContainer = createContainer();

ApplicationContainer.load(Symbol("EventsModule"), createEventsModule());
ApplicationContainer.load(Symbol("AuthModule"), createAuthModule());
ApplicationContainer.load(Symbol("BillingModule"), createBillingModule());
ApplicationContainer.load(Symbol("EmailModule"), createEmailModule());

const dispatcher = ApplicationContainer.get(
  DI_SYMBOLS.IEventDispatcher,
) as InMemoryEventDispatcher;

const emailService = ApplicationContainer.get(
  DI_SYMBOLS.IEmailService,
) as DI_RETURN_TYPES["IEmailService"];
registerEventHandlers(dispatcher, emailService);

export function getInjection<K extends keyof typeof DI_SYMBOLS>(
  symbol: K,
): DI_RETURN_TYPES[K] {
  return ApplicationContainer.get(DI_SYMBOLS[symbol]);
}
