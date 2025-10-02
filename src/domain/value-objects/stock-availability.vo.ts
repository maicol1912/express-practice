export enum SyncStatus {
  SYNCED = 'SYNCED',
  PENDING_SYNC = 'PENDING_SYNC',
  CONFLICT = 'CONFLICT',
}

export class StockAvailability {
  constructor(
    public readonly productId: string,
    public readonly storeId: string,
    public readonly available: number,
    public readonly reserved: number,
    public readonly total: number,
    public readonly committed: number,
    public readonly inTransit: number,
    public readonly syncStatus: SyncStatus,
    public readonly lastUpdated: Date
  ) {}

  isAvailable(requestedQuantity: number): boolean {
    return this.available >= requestedQuantity;
  }

  getAvailabilityRatio(): number {
    return this.total > 0 ? this.available / this.total : 0;
  }

  isLowStock(threshold: number): boolean {
    return this.available <= threshold;
  }

  isOutOfStock(): boolean {
    return this.available === 0;
  }
}
