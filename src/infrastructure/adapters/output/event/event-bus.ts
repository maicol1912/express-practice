import { EventEmitter } from 'events';
import { DomainEvent } from '@domain/events/domain-event';
import { logger } from '@infrastructure/config/logger.config';

export class EventBus {
  private static instance: EventBus;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50);
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  publish<T extends DomainEvent>(event: T): void {
    logger.info('Publishing event:', {
      eventType: event.eventType,
      eventId: event.eventId,
    });

    this.emitter.emit(event.eventType, event);
  }

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: (event: T) => void | Promise<void>
  ): void {
    this.emitter.on(eventType, async (event: T) => {
      try {
        await handler(event);
      } catch (error) {
        logger.error('Error handling event:', {
          eventType,
          eventId: event.eventId,
          error,
        });
      }
    });

    logger.debug('Event handler subscribed:', { eventType });
  }
}
