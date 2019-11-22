const request = require('supertest');
const app     = require('../../server');
// cosnt agent = request.agent('http://localhost:3000');
let User = require('../../models/User');

describe('Login', function() {

  it('should return success for login page', async () => {
    const res = await request(app).get('/login');
      expect(res.statusCode).toEqual(200);
  });

  it('should redirect user to home when user successfull login', async () => {
    let user = await User.register(User({ username: 'user@example.com'}), 'secret', () => console.log('user created'));
    const res = await request(app)
      .post('/login')
      .send({
        'username': 'user@example.com',
        'password': 'secret'
      });
      expect(res.statusCode).toEqual(302);
      expect(res.header.location).toBe('/');
  });
});