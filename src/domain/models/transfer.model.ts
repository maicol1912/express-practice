export enum TransferStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class Transfer {
  constructor(
    public id: string,
    public fromStoreId: string,
    public toStoreId: string,
    public productId: string,
    public qty: number,
    public status: TransferStatus,
    public requestedBy: string,
    public approvedBy: string | null,
    public requestedAt: Date,
    public startedAt: Date | null,
    public completedAt: Date | null
  ) {}

  canStart(): boolean {
    return this.status === TransferStatus.PENDING;
  }

  canComplete(): boolean {
    return this.status === TransferStatus.IN_TRANSIT;
  }

  canFail(): boolean {
    return (
      this.status === TransferStatus.PENDING ||
      this.status === TransferStatus.IN_TRANSIT
    );
  }

  start(actor: string): void {
    this.status = TransferStatus.IN_TRANSIT;
    this.approvedBy = actor;
    this.startedAt = new Date();
  }

  complete(actor: string): void {
    this.status = TransferStatus.COMPLETED;
    this.approvedBy = actor;
    this.completedAt = new Date();
  }

  fail(actor: string): void {
    this.status = TransferStatus.FAILED;
    this.approvedBy = actor;
    this.completedAt = new Date();
  }
}
