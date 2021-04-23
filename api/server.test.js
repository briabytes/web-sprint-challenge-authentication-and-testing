const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwtDecode = require('jwt-decode');

const server = require('./server');
const db = require('../data/dbConfig');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

test('sanity', () => {
  expect(true).toBe(true)
})

describe('server.js', () => {
  describe('[POST] /api/auth/register', () => {
    it('[1] creates a new user', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'lester', password: 'c1234'});
      const lester = await db('users')
        .where('username', 'lester')
        .first();
      expect(lester).toMatchObject({ username: 'lester' });
    });
    it('[2] saves password as hash rather than plain text', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'angel', password: 'c1234' });
      const angel = await db('users')
        .where('username', 'angel')
        .first();
      expect(bcrypt.compareSync('c1234', angel.password)).toBeTruthy();
    });
  });
  describe('[POST] /api/auth/login', () => {
    it('[1] responds with the right message when logging in with valid credentials', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'lester', password: 'c1234' });
      expect(res.body.message).toMatch(/welcome, lester/i);
    });
    it('[2] responds with the right status and message when missing username', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ password: 'c1234' });
      expect(res.body.message).toMatch(/username and password required/i);
      expect(res.status).toBe(422);
    });
  });
  describe('[GET] /api/jokes', () => {
    it('[1] requests without a token are rejected with right status and message', async () => {
      const res = await request(server)
        .get('/api/jokes');
      expect(res.body.message).toMatch(/token required/i);
    });
    it('[2] requests with invalid token are rejected with right status and message', async () => {
      const res = await request(server)
        .get('/api/jokes')
        .set('Authorization', 'loveMeTillIAmDead');
      expect(res.body.message).toMatch(/token invalid/i);
    });
  });
});
