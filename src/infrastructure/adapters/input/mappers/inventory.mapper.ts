import { InventoryItem } from '../../../../domain/models/inventory-item.model';
import { InventoryResponseDTO } from '../../../../application/dto/responses';

export class InventoryMapper {
  static toResponseDTO(inventory: InventoryItem): InventoryResponseDTO {
    return {
      id: inventory.id,
      storeId: inventory.storeId,
      productId: inventory.productId,
      availableQuantity: inventory.available,
      reservedQuantity: inventory.reserved,
      committedQuantity: inventory.committed,
      inTransitQuantity: inventory.inTransit,
      syncStatus: inventory.syncStatus,
      lastSyncAt: inventory.lastSyncAt || undefined,
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
    };
  }

  static toResponseDTOArray(items: InventoryItem[]): InventoryResponseDTO[] {
    return items.map((item) => this.toResponseDTO(item));
  }
}
