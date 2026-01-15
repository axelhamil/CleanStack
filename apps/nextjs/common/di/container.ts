import { type Container, createContainer } from "@evyweb/ioctopus";
import type { InMemoryEventDispatcher } from "@/adapters/events/in-memory-event-dispatcher";
import { createAuthModule } from "./modules/auth.module";
import { createBillingModule } from "./modules/billing.module";
import { createEmailModule } from "./modules/email.module";
import {
  createEventsModule,
  registerEventHandlers,
} from "./modules/events.module";
import { type DI_RETURN_TYPES, DI_SYMBOLS } from "./types";

let _container: Container | null = null;
let _initialized = false;

function getContainer(): Container {
  if (!_container) {
    _container = createContainer();

    _container.load(Symbol("EventsModule"), createEventsModule());
    _container.load(Symbol("AuthModule"), createAuthModule());
    _container.load(Symbol("BillingModule"), createBillingModule());
    _container.load(Symbol("EmailModule"), createEmailModule());
  }

  if (!_initialized) {
    _initialized = true;
    const dispatcher = _container.get(
      DI_SYMBOLS.IEventDispatcher,
    ) as InMemoryEventDispatcher;

    const emailService = _container.get(
      DI_SYMBOLS.IEmailService,
    ) as DI_RETURN_TYPES["IEmailService"];
    registerEventHandlers(dispatcher, emailService);
  }

  return _container;
}

export function getInjection<K extends keyof typeof DI_SYMBOLS>(
  symbol: K,
): DI_RETURN_TYPES[K] {
  return getContainer().get(DI_SYMBOLS[symbol]);
}
