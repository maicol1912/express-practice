import { faker } from '@faker-js/faker';
import { Category } from '@domain/models/category.model';
import { Product } from '@domain/models/product.model';
import { Store } from '@domain/models/store.model';
import { User } from '@domain/models/user.model';
import { Role, RoleName } from '@domain/models/role.model';
import { InventoryItem } from '@domain/models/inventory-item.model';
import { SyncStatus } from '@domain/value-objects/stock-availability.vo';
import { Transfer, TransferStatus } from '@domain/models/transfer.model';
import { Reservation, ReservationPriority, ReservationStatus, ReservationType } from '@domain/models/reservation.model';

export class TestFactories {
    static createCategory(overrides?: Partial<Category>): Category {
        return new Category(
            overrides?.id || faker.string.uuid(),
            overrides?.name || faker.commerce.department(),
            overrides?.description || faker.lorem.sentence(),
            overrides?.createdAt || new Date(),
            overrides?.updatedAt || new Date()
        );
    }

    static createProduct(overrides?: Partial<Product>): Product {
        return new Product(
            overrides?.id || faker.string.uuid(),
            overrides?.sku || faker.string.alphanumeric(10).toUpperCase(),
            overrides?.name || faker.commerce.productName(),
            overrides?.description || faker.commerce.productDescription(),
            overrides?.categoryId || faker.string.uuid(),
            overrides?.price || parseFloat(faker.commerce.price()),
            overrides?.createdAt || new Date(),
            overrides?.updatedAt || new Date()
        );
    }

    static createStore(overrides?: Partial<Store>): Store {
        return new Store(
            overrides?.id || faker.string.uuid(),
            overrides?.code || faker.string.alphanumeric(5).toUpperCase(),
            overrides?.name || faker.company.name(),
            overrides?.address || faker.location.streetAddress(),
            overrides?.createdAt || new Date(),
            overrides?.updatedAt || new Date()
        );
    }

    static createRole(overrides?: Partial<Role>): Role {
        return new Role(
            overrides?.id || faker.string.uuid(),
            overrides?.name || RoleName.EMPLOYEE,
            overrides?.description || faker.lorem.sentence()
        );
    }

    static createUser(overrides?: Partial<User>): User {
        const role = overrides?.role || this.createRole();
        return new User(
            overrides?.id || faker.string.uuid(),
            overrides?.username || faker.internet.username(),
            overrides?.email || faker.internet.email(),
            overrides?.password || faker.internet.password(),
            role,
            overrides?.storeId || null,
            overrides?.isActive !== undefined ? overrides.isActive : true,
            overrides?.createdAt || new Date(),
            overrides?.updatedAt || new Date(),
            overrides?.lastLoginAt || null
        );
    }

    static createInventoryItem(overrides?: Partial<InventoryItem>): InventoryItem {
        const onHand = overrides?.onHand || faker.number.int({ min: 0, max: 100 });
        const reserved = overrides?.reserved || 0;
        const committed = overrides?.committed || 0;
        const available = overrides?.available || (onHand - reserved - committed);

        return new InventoryItem(
            overrides?.id || faker.string.uuid(),
            overrides?.productId || faker.string.uuid(),
            overrides?.storeId || faker.string.uuid(),
            onHand,
            available,
            reserved,
            committed,
            overrides?.inTransit || 0,
            overrides?.version || 0,
            overrides?.syncStatus || SyncStatus.SYNCED,
            overrides?.lastSyncAt || null,
            overrides?.createdAt || new Date(),
            overrides?.updatedAt || new Date(),
            overrides?.lastUpdatedBy || faker.string.uuid()
        );
    }

    static createTransfer(overrides?: Partial<Transfer>): Transfer {
        return new Transfer(
            overrides?.id || faker.string.uuid(),
            overrides?.fromStoreId || faker.string.uuid(),
            overrides?.toStoreId || faker.string.uuid(),
            overrides?.productId || faker.string.uuid(),
            overrides?.qty || faker.number.int({ min: 1, max: 50 }),
            overrides?.status || TransferStatus.PENDING,
            overrides?.requestedBy || faker.string.uuid(),
            overrides?.approvedBy || null,
            overrides?.requestedAt || new Date(),
            overrides?.startedAt || null,
            overrides?.completedAt || null
        );
    }

    static createReservation(overrides?: Partial<Reservation>): Reservation {
        return new Reservation(
            overrides?.id || faker.string.uuid(),
            overrides?.storeId || faker.string.uuid(),
            overrides?.productId || faker.string.uuid(),
            overrides?.qty || faker.number.int({ min: 1, max: 10 }),
            overrides?.status || ReservationStatus.ACTIVE,
            overrides?.type || ReservationType.STANDARD,
            overrides?.priority || ReservationPriority.NORMAL,
            overrides?.orderRef || `ORD-${faker.string.alphanumeric(8)}`,
            overrides?.customerId || null,
            overrides?.createdAt || new Date(),
            overrides?.expiresAt || new Date(Date.now() + 15 * 60 * 1000),
            overrides?.cancelledReason || null
        );
    }
}