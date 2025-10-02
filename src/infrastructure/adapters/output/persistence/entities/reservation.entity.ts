import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reservations')
export class ReservationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ type: 'int' })
  qty!: number;

  @Column({ type: 'varchar' })
  status!: string;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar' })
  priority!: string;

  @Column({ name: 'order_ref', type: 'varchar' })
  orderRef!: string;

  @Column({ name: 'customer_id', type: 'varchar', nullable: true })
  customerId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'cancelled_reason', type: 'varchar', nullable: true })
  cancelledReason!: string | null;
}