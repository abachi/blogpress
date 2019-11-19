const request = require('supertest');
const app     = require('../../server');


describe('Login', function() {

  it('should return success for login page', async () => {
    const res = await request(app).get('/login');
      expect(res.statusCode).toEqual(200);
  });
});