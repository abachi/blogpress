const request = require('supertest');
const app     = require('../server');

describe('Home', function() {

  it('should return the home page', async () => {
    await request(app)
    .get('/')
    .expect(200);
  });
});
