import { Product } from '../../../../domain/models/product.model';
import { ProductResponseDTO } from '../../../../application/dto/responses';

export class ProductMapper {
  static toResponseDTO(product: Product): ProductResponseDTO {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description || undefined,
      price: product.price,
      categoryId: product.categoryId,
      active: true, // Default to true since Product model doesn't have active field
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  static toResponseDTOArray(products: Product[]): ProductResponseDTO[] {
    return products.map((product) => this.toResponseDTO(product));
  }
}
