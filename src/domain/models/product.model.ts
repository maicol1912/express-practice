export class Product {
  constructor(
    public id: string,
    public sku: string,
    public name: string,
    public description: string | null,
    public categoryId: string,
    public price: number,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
