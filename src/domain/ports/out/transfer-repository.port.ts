import { Transfer, TransferStatus } from '../../models/transfer.model';

export interface TransferRepositoryPort {
  save(transfer: Transfer): Promise<Transfer>;

  findById(id: string): Promise<Transfer | null>;

  findAll(
    storeId?: string,
    productId?: string,
    status?: TransferStatus
  ): Promise<Transfer[]>;

  delete(id: string): Promise<void>;
}
