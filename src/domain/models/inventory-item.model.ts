import { SyncStatus } from '../value-objects/stock-availability.vo';
import { InventoryInconsistencyException } from '../exceptions/domain.exception';

export class InventoryItem {
  constructor(
    public id: string,
    public productId: string,
    public storeId: string,
    public onHand: number,
    public available: number,
    public reserved: number,
    public committed: number,
    public inTransit: number,
    public version: number,
    public syncStatus: SyncStatus,
    public lastSyncAt: Date | null,
    public createdAt: Date,
    public updatedAt: Date,
    public lastUpdatedBy: string
  ) {}

  isConsistent(): boolean {
    return this.onHand === this.available + this.reserved + this.committed;
  }

  canReserve(qty: number): boolean {
    return this.available >= qty;
  }

  reserveStock(qty: number): void {
    if (!this.canReserve(qty)) {
      throw new InventoryInconsistencyException(
        `Cannot reserve ${qty} units. Available: ${this.available}`
      );
    }
    this.available -= qty;
    this.reserved += qty;
    this.updatedAt = new Date();
  }

  releaseStock(qty: number): void {
    if (this.reserved < qty) {
      throw new InventoryInconsistencyException(
        `Cannot release ${qty} units. Reserved: ${this.reserved}`
      );
    }
    this.reserved -= qty;
    this.available += qty;
    this.updatedAt = new Date();
  }

  confirmSale(qty: number): void {
    if (this.reserved < qty) {
      throw new InventoryInconsistencyException(
        `Cannot confirm sale of ${qty} units. Reserved: ${this.reserved}`
      );
    }
    this.reserved -= qty;
    this.committed += qty;
    this.onHand -= qty;
    this.updatedAt = new Date();
  }

  addStock(qty: number): void {
    this.onHand += qty;
    this.available += qty;
    this.updatedAt = new Date();
  }

  adjustStock(qty: number): void {
    const newOnHand = this.onHand + qty;
    if (newOnHand < 0) {
      throw new InventoryInconsistencyException(
        `Cannot adjust stock by ${qty}. Would result in negative onHand.`
      );
    }

    this.onHand = newOnHand;

    if (qty > 0) {
      this.available += qty;
    } else {
      const absQty = Math.abs(qty);
      if (this.available >= absQty) {
        this.available -= absQty;
      } else {
        throw new InventoryInconsistencyException(
          `Cannot reduce stock by ${absQty}. Available: ${this.available}`
        );
      }
    }

    this.updatedAt = new Date();
  }

  markInTransit(qty: number): void {
    if (this.available < qty) {
      throw new InventoryInconsistencyException(
        `Cannot mark ${qty} units in transit. Available: ${this.available}`
      );
    }
    this.available -= qty;
    this.inTransit += qty;
    this.onHand -= qty;
    this.updatedAt = new Date();
  }

  receiveTransfer(qty: number): void {
    this.onHand += qty;
    this.available += qty;
    this.updatedAt = new Date();
  }

  confirmTransferOut(qty: number): void {
    if (this.inTransit < qty) {
      throw new InventoryInconsistencyException(
        `Cannot confirm transfer of ${qty} units. InTransit: ${this.inTransit}`
      );
    }
    this.inTransit -= qty;
    this.updatedAt = new Date();
  }
}
