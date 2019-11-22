const request = require('supertest');
const app     = require('../server');


describe('Post', function() {

  it('guest cannot create a post without login', async () => {
    const res = await request(app).post('/create').send({
        'title': 'A Post Title Example',
        'body': 'This is a body text example.'
    });
    expect(res.statusCode).toEqual(401);
  });
});