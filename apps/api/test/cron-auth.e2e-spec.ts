import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import supertest from 'supertest';
import { CoreModule } from '../src/core.module';
import { VesService } from '../src/modules/ves/ves.service';

const TEST_CRON_SECRET = 'test-cron-secret-e2e';

/**
 * E2E tests de autenticación del cron – verifican que el endpoint
 * /api/cron/ves-snapshot rechace tokens inválidos (401) y acepte
 * el CRON_SECRET correcto (200) con VesService mockeado.
 */
describe('Cron Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
    })
      .overrideProvider(VesService)
      .useValue({
        getPrice: jest.fn().mockResolvedValue({ official: 36.5, parallel: 45.0 }),
        getHistory: jest.fn().mockResolvedValue([]),
        fetchAndSaveVes: jest.fn().mockResolvedValue(undefined),
      })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          const env: Record<string, string> = {
            CRON_SECRET: TEST_CRON_SECRET,
            SUPABASE_URL: 'https://fake.supabase.co',
            SUPABASE_KEY: 'fake-key',
            SUPABASE_SERVICE_ROLE_KEY: 'fake-service-key',
          };
          return env[key];
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Cron Auth ──────────────────────────────────────────────────────────

  describe('GET /api/cron/ves-snapshot', () => {
    it('should return 401 for wrong Bearer token', () => {
      return supertest(app.getHttpServer())
        .get('/api/cron/ves-snapshot')
        .set('authorization', 'Bearer wrong-secret')
        .expect(401);
    });

    it('should return 200 with correct CRON_SECRET', async () => {
      const res = await supertest(app.getHttpServer())
        .get('/api/cron/ves-snapshot')
        .set('authorization', `Bearer ${TEST_CRON_SECRET}`)
        .expect(200);

      expect(res.body).toHaveProperty('ok', true);
      expect(res.body).toHaveProperty('message', 'VES snapshot saved');
    });
  });
});
