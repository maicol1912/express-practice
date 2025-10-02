import { v4 as uuidv4 } from 'uuid';

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly eventType: string;

  constructor() {
    this.eventId = uuidv4();
    this.occurredOn = new Date();
    this.eventType = this.constructor.name;
  }
}
