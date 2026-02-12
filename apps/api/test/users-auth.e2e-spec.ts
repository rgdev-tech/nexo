import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { CoreModule } from '../src/core.module';

/**
 * E2E tests de autenticación de usuarios – verifican que los endpoints
 * protegidos por SupabaseGuard rechacen peticiones sin token o con
 * token inválido (401).
 */
describe('Users Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
    }).compile();

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

  // ── GET /api/users/profile ────────────────────────────────────────────

  describe('GET /api/users/profile', () => {
    it('should return 401 without authorization header', () => {
      return supertest(app.getHttpServer())
        .get('/api/users/profile')
        .expect(401);
    });

    it('should return 401 with invalid Bearer token', () => {
      return supertest(app.getHttpServer())
        .get('/api/users/profile')
        .set('authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  // ── PATCH /api/users/profile ──────────────────────────────────────────

  describe('PATCH /api/users/profile', () => {
    it('should return 401 without authorization header', () => {
      return supertest(app.getHttpServer())
        .patch('/api/users/profile')
        .send({ first_name: 'Test' })
        .expect(401);
    });

    it('should return 401 with invalid Bearer token', () => {
      return supertest(app.getHttpServer())
        .patch('/api/users/profile')
        .set('authorization', 'Bearer invalid-token')
        .send({ first_name: 'Test' })
        .expect(401);
    });
  });
});
