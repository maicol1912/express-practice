import { injectable } from 'tsyringe';
import { EventPublisherPort } from '@domain/ports/out/event-publisher.port';
import { DomainEvent } from '@domain/events/domain-event';
import { EventBus } from './event-bus';

@injectable()
export class SpringEventPublisher implements EventPublisherPort {
  private eventBus: EventBus;

  constructor() {
    this.eventBus = EventBus.getInstance();
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    this.eventBus.publish(event);
  }
}
