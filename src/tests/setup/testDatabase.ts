import { AppDataSource } from '../../database/datasource';

export async function clearDatabase() {

    if (!AppDataSource.isInitialized) {
        return;
    }

    const entities = AppDataSource.entityMetadatas;

    for (const entity of entities) {

        const repository = AppDataSource.getRepository(entity.name);

        await repository.query(
            `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`
        );
    }
}