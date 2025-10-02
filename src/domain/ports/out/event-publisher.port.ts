import { DomainEvent } from '../../events/domain-event';

export interface EventPublisherPort {
  publish<T extends DomainEvent>(event: T): Promise<void>;
}
