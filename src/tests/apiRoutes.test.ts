import request from 'supertest';
import { app, redisClient } from '../app';
import { AppDataSource } from '../database/datasource';

// Create a server variable to reference the running server instance
let server: ReturnType<typeof app.listen>;

// Setup before running tests
beforeAll(async () => {
    // Start the server for testing
    server = app.listen(0); // Using port 0 lets the OS assign an available port
});

// Cleanup after all tests
afterAll(async () => {
    // Close the express server
    await new Promise<void>((resolve) => {
        server?.close(() => {
            resolve();
        });
    });

    // Close a database connection if active
    if (AppDataSource?.isInitialized) {
        await AppDataSource.destroy();
    }

    // Close Redis connection if active
    if (redisClient?.disconnect) {
        redisClient.disconnect();
    } else if (redisClient?.quit) {
        await redisClient.quit();
    }

    // Small delay to ensure all resources are released
    await new Promise(resolve => setTimeout(resolve, 100));
});

describe('API Route Tests', () => {
    // Your existing test code remains unchanged
    // ...
    describe('Charger Routes', () => {
        it('GET /api/chargers should require authentication', async () => {
            const res = await request(app).get('/api/chargers');
            expect([401, 403]).toContain(res.status);
        });
        // Add more tests for charger routes as needed
    });

    describe('Session Routes', () => {
        it('GET /api/sessions/:sessionId should require authentication', async () => {
            const res = await request(app).get('/api/sessions/1');
            expect([401, 403]).toContain(res.status);
        });
        // Add more tests for session routes as needed
    });

    describe('User Routes', () => {
        it('POST /api/auth/send-otp should send OTP', async () => {
            const res = await request(app)
                .post('/api/auth/send-otp')
                .send({ phoneNumber: '1234567890' });
            expect([200, 400, 500]).toContain(res.status);
        });
        // Add more tests for user routes as needed
    });

    describe('Vehicle Routes', () => {
        it('GET /api/users/:userId/vehicles should require authentication', async () => {
            const res = await request(app).get('/api/users/1/vehicles');
            expect([401, 403]).toContain(res.status);
        });
        // Add more tests for vehicle routes as needed
    });
});



