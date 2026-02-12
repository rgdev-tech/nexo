import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { CoreModule } from '../src/core.module';
import { SupabaseService } from '../src/shared/supabase/supabase.service';

/**
 * E2E tests de health – verifican que los endpoints raíz y /api/health
 * respondan correctamente y contengan las propiedades esperadas.
 */
describe('Health E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
    })
      .overrideProvider(SupabaseService)
      .useValue({ getClient: jest.fn() })
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

  // ── Root ────────────────────────────────────────────────────────────────

  describe('GET /', () => {
    it('should return 200 with API info', async () => {
      const res = await supertest(app.getHttpServer()).get('/').expect(200);

      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('docs');
      expect(res.body).toHaveProperty('endpoints');
      expect(res.body.endpoints).toHaveProperty('health');
      expect(res.body.endpoints).toHaveProperty('prices');
    });
  });

  // ── Health ──────────────────────────────────────────────────────────────

  describe('GET /api/health', () => {
    it('should return 200 with status ok', async () => {
      const res = await supertest(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(typeof res.body.timestamp).toBe('string');
    });

    it('should return a valid ISO timestamp', async () => {
      const res = await supertest(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      const date = new Date(res.body.timestamp);
      expect(date.toISOString()).toBe(res.body.timestamp);
    });
  });
});
