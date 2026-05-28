import { AppDataSource } from '../../database/datasource';

export default async () => {

    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();

        console.log('Test database disconnected');
    }
};