export class Category {
  constructor(
    public id: string,
    public name: string,
    public description: string | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
