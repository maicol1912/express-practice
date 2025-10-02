export class UserResponseDTO {
  id!: string;
  username!: string;
  email!: string;
  fullName!: string;
  role!: string;
  storeId?: string;
  storeName?: string;
  active!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
