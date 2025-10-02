import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '@infrastructure/config/database.config';
import { ReservationRepositoryPort } from '@domain/ports/out/reservation-repository.port';
import {
  Reservation,
  ReservationStatus,
  ReservationType,
  ReservationPriority
} from '@domain/models/reservation.model';
import { ReservationEntity } from '../entities/reservation.entity';

@injectable()
export class ReservationRepository implements ReservationRepositoryPort {
  private repository: Repository<ReservationEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(ReservationEntity);
  }

  async save(reservation: Reservation): Promise<Reservation> {
    const entity = this.domainToEntity(reservation);
    const saved = await this.repository.save(entity);
    return this.entityToDomain(saved);
  }

  async findById(id: string): Promise<Reservation | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findActiveByOrderRef(orderRef: string): Promise<Reservation | null> {
    const entity = await this.repository.findOne({
      where: {
        orderRef,
        status: ReservationStatus.ACTIVE,
      },
    });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByStoreAndProduct(
    storeId: string,
    productId: string,
    status?: ReservationStatus
  ): Promise<Reservation[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('reservation')
      .where('reservation.storeId = :storeId', { storeId })
      .andWhere('reservation.productId = :productId', { productId });

    if (status) {
      queryBuilder.andWhere('reservation.status = :status', { status });
    }

    const entities = await queryBuilder.getMany();
    return entities.map((e) => this.entityToDomain(e));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private domainToEntity(domain: Reservation): ReservationEntity {
    const entity = new ReservationEntity();
    entity.id = domain.id;
    entity.storeId = domain.storeId;
    entity.productId = domain.productId;
    entity.qty = domain.qty;
    entity.status = domain.status;
    entity.type = domain.type;
    entity.priority = domain.priority;
    entity.orderRef = domain.orderRef;
    entity.customerId = domain.customerId;
    entity.createdAt = domain.createdAt;
    entity.expiresAt = domain.expiresAt;
    entity.cancelledReason = domain.cancelledReason;
    return entity;
  }

  private entityToDomain(entity: ReservationEntity): Reservation {
    return new Reservation(
      entity.id,
      entity.storeId,
      entity.productId,
      entity.qty,
      entity.status as ReservationStatus,
      entity.type as ReservationType,
      entity.priority as ReservationPriority,
      entity.orderRef,
      entity.customerId,
      entity.createdAt,
      entity.expiresAt,
      entity.cancelledReason
    );
  }
}
