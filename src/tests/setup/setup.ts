import '../setup/env';

import { AppDataSource } from '../../database/datasource';

beforeAll(async () => {

    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    console.log('Test database connected');
});

afterEach(async () => {

    // Optional:
    // Clear mocks after every test

    jest.clearAllMocks();
});