import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

@Entity('inventory_items')
export class InventoryItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId!: string;

  @Column({ name: 'on_hand', type: 'int', default: 0 })
  onHand!: number;

  @Column({ type: 'int', default: 0 })
  available!: number;

  @Column({ type: 'int', default: 0 })
  reserved!: number;

  @Column({ type: 'int', default: 0 })
  committed!: number;

  @Column({ name: 'in_transit', type: 'int', default: 0 })
  inTransit!: number;

  @VersionColumn()
  version!: number;

  @Column({ name: 'sync_status', type: 'varchar', default: 'SYNCED' })
  syncStatus!: string;

  @Column({ name: 'last_sync_at', type: 'timestamp', nullable: true })
  lastSyncAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'last_updated_by', type: 'uuid' })
  lastUpdatedBy!: string;
}