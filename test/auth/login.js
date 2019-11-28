const request = require('supertest');
const app     = require('../../server');
const agent = request.agent(app);
const assert = require('assert');
let User = require('../../models/User');

describe('Login', () => {

  it('return the login page', async () => {
    await request(app)
      .get('/login')
      .expect(200);
  });

  it('should redirect user to home when user successfull login', async () => {
    await User.deleteMany({});
    await User.register(new User({'username': 'test'}), 'secret');
    await agent
      .post('/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        username: 'test',
        password: 'secret'
      })
      .expect(302)
      .expect('Location', '/');
  });

  it('should redirect to home page when user is logout', async () => {
    await User.deleteMany({});
    await User.register(new User({'username': 'test'}), 'secret');
    await agent
    .post('/login')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      username: 'test',
      password: 'secret'
    })
    .expect(302)
    .expect('Location', '/');

    await agent.get('/post/create')
    .expect(200);
    
    await agent
    .get('/logout')
    .expect(302)
    .expect('Location', '/');
    
    await agent.get('/post/create')
    .expect(302)
    .expect('Location', '/login')
  });

  it('should redirect to login page with error message when user fails login', async () => {
    await User.deleteMany({});
    await agent
      .post('/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        'username': 'not-exist',
        'password': 'secret',
      })
      .expect(302)
      .expect('Location', '/login')
  });

});