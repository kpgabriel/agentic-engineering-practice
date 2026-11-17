process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../index');

describe('GET /health', () => {
  test('reports the service is ok with a timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });
});
