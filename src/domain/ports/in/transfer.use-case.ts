import { Transfer, TransferStatus } from '../../models/transfer.model';

export interface TransferUseCase {
  createTransfer(
    fromStoreId: string,
    toStoreId: string,
    productId: string,
    quantity: number,
    requestedBy: string
  ): Promise<Transfer>;

  startTransfer(transferId: string, actor: string): Promise<Transfer>;

  completeTransfer(transferId: string, actor: string): Promise<Transfer>;

  failTransfer(transferId: string, actor: string): Promise<Transfer>;

  listTransfers(
    storeId?: string,
    productId?: string,
    status?: TransferStatus
  ): Promise<Transfer[]>;

  getTransferById(id: string): Promise<Transfer>;
}
