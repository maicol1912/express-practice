import { DataSource } from 'typeorm';
import { AppDataSource } from '@infrastructure/config/database.config';

export class DatabaseHelper {
    static dataSource: DataSource;

    static async initialize(): Promise<DataSource> {
        if (!this.dataSource || !this.dataSource.isInitialized) {
            this.dataSource = await AppDataSource.initialize();
        }
        return this.dataSource;
    }

    static async cleanup(): Promise<void> {
        if (this.dataSource && this.dataSource.isInitialized) {
            await this.dataSource.destroy();
        }
    }

    static async clearDatabase(): Promise<void> {
        const entities = this.dataSource.entityMetadatas;
        for (const entity of entities) {
            const repository = this.dataSource.getRepository(entity.name);
            await repository.clear();
        }
    }
}