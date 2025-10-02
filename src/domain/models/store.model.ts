export class Store {
  constructor(
    public id: string,
    public code: string,
    public name: string,
    public address: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
