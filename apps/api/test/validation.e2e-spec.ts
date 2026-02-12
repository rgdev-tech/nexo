import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { CoreModule } from '../src/core.module';
import { SupabaseService } from '../src/shared/supabase/supabase.service';

/**
 * E2E tests de validación – verifican que los DTOs devuelvan HTTP 400
 * para inputs inválidos en los endpoints de precios y cron.
 */
describe('Validation E2E', () => {
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

  // ── Crypto ────────────────────────────────────────────────────────────────

  describe('GET /api/prices/crypto', () => {
    it('should reject invalid currency', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/crypto?currency=XYZ')
        .expect(400);
    });

    it('should reject unknown query param (forbidNonWhitelisted)', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/crypto?foo=bar')
        .expect(400);
    });

    it('should accept valid currency', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/crypto?currency=USD')
        .expect(200);
    });
  });

  describe('GET /api/prices/crypto/history', () => {
    it('should reject days=0', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/crypto/history?days=0')
        .expect(400);
    });

    it('should reject days=9999', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/crypto/history?days=9999')
        .expect(400);
    });

    it('should reject days=abc', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/crypto/history?days=abc')
        .expect(400);
    });

    it('should reject invalid currency', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/crypto/history?currency=INVALID')
        .expect(400);
    });

    it('should accept valid params', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/crypto/history?symbol=BTC&days=7&currency=USD')
        .expect(200);
    });
  });

  // ── Forex ─────────────────────────────────────────────────────────────────

  describe('GET /api/prices/forex', () => {
    it('should reject invalid from currency', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/forex?from=XYZ')
        .expect(400);
    });

    it('should reject invalid to currency', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/forex?to=ABC')
        .expect(400);
    });

    it('should accept valid currencies', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/forex?from=USD&to=EUR')
        .expect(200);
    });
  });

  describe('GET /api/prices/forex/history', () => {
    it('should reject days=0', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/forex/history?days=0')
        .expect(400);
    });

    it('should reject days=9999', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/forex/history?days=9999')
        .expect(400);
    });

    it('should reject invalid from currency', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/forex/history?from=FAKE')
        .expect(400);
    });
  });

  // ── VES ───────────────────────────────────────────────────────────────────

  describe('GET /api/prices/ves/history', () => {
    it('should reject days=0', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/ves/history?days=0')
        .expect(400);
    });

    it('should reject days=9999', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/ves/history?days=9999')
        .expect(400);
    });

    it('should reject days=abc', () => {
      return supertest(app.getHttpServer())
        .get('/api/prices/ves/history?days=abc')
        .expect(400);
    });
  });

  // ── Cron ──────────────────────────────────────────────────────────────────

  describe('GET /api/cron/ves-snapshot', () => {
    it('should reject missing authorization header', () => {
      return supertest(app.getHttpServer())
        .get('/api/cron/ves-snapshot')
        .expect(400);
    });

    it('should reject invalid authorization format (no Bearer prefix)', () => {
      return supertest(app.getHttpServer())
        .get('/api/cron/ves-snapshot')
        .set('authorization', 'plain-token')
        .expect(400);
    });

    it('should reject Bearer with empty token', () => {
      return supertest(app.getHttpServer())
        .get('/api/cron/ves-snapshot')
        .set('authorization', 'Bearer ')
        .expect(400);
    });
  });
});
