import "reflect-metadata"
import { CategoryService } from '@application/services/category.service';
import { NotFoundException, AlreadyExistsException } from '@domain/exceptions/domain.exception';
import { MockRepositories } from '../../utils/mocks';
import { TestFactories } from '../../utils/factories';

describe('CategoryService - Unit Tests', () => {
    let categoryService: CategoryService;
    let categoryRepository: any;

    beforeEach(() => {
        categoryRepository = MockRepositories.categoryRepository();
        categoryService = new CategoryService(categoryRepository);
    });

    describe('create', () => {
        it('should create a new category successfully', async () => {
            const categoryData = { name: 'Electronics', description: 'Electronic products' };
            const mockCategory = TestFactories.createCategory(categoryData);

            categoryRepository.findByName.mockResolvedValue(null);
            categoryRepository.save.mockResolvedValue(mockCategory);

            const result = await categoryService.create(categoryData.name, categoryData.description);

            expect(result).toEqual(mockCategory);
            expect(categoryRepository.findByName).toHaveBeenCalledWith(categoryData.name);
            expect(categoryRepository.save).toHaveBeenCalled();
        });

        it('should throw AlreadyExistsException when category name exists', async () => {
            const existingCategory = TestFactories.createCategory({ name: 'Electronics' });
            categoryRepository.findByName.mockResolvedValue(existingCategory);

            await expect(
                categoryService.create('Electronics', 'Description')
            ).rejects.toThrow(AlreadyExistsException);
        });
    });

    describe('findById', () => {
        it('should return category when found', async () => {
            const mockCategory = TestFactories.createCategory();
            categoryRepository.findById.mockResolvedValue(mockCategory);

            const result = await categoryService.findById(mockCategory.id);

            expect(result).toEqual(mockCategory);
        });

        it('should throw NotFoundException when not found', async () => {
            categoryRepository.findById.mockResolvedValue(null);

            await expect(
                categoryService.findById('non-existent-id')
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update category successfully', async () => {
            const existingCategory = TestFactories.createCategory({ name: 'Old Name' });
            const updatedCategory = { ...existingCategory, name: 'New Name' };

            categoryRepository.findById.mockResolvedValue(existingCategory);
            categoryRepository.findByName.mockResolvedValue(null);
            categoryRepository.save.mockResolvedValue(updatedCategory);

            const result = await categoryService.update(existingCategory.id, 'New Name');

            expect(result.name).toBe('New Name');
            expect(categoryRepository.save).toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should delete category successfully', async () => {
            const mockCategory = TestFactories.createCategory();
            categoryRepository.findById.mockResolvedValue(mockCategory);

            await categoryService.delete(mockCategory.id);

            expect(categoryRepository.delete).toHaveBeenCalledWith(mockCategory.id);
        });
    });
});