export enum RoleName {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export class Role {
  constructor(
    public id: string,
    public name: RoleName,
    public description: string | null
  ) {}
}
