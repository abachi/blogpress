const request = require('supertest');
const app     = require('../../server');
const agent = request.agent(app);
const assert = require('assert');
let User = require('../../models/User');

describe('Login', function() {
  before((done) => {
      User.deleteMany({}).then(() => {
        User.register(new User({ username: 'test'}), 'secret', (err, user) => {
            if(err){
                console.log('Error: ', err);
            }
            done();
        });
      });
  });

  it('return the login page', (done) => {
      request(app).get('/login').expect(200).end((err, res) => {
        if(err) return done(err);
        return done();
      });
  });


  it('should redirect user to home when user successfull login', (done) => {
    agent
      .post('/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        username: 'test',
        password: 'secret'
      })
      .expect(302)
      .expect('Location', '/')
      .end((err, res) => {
          if(err) return done(err);

          return done();
      });
  });

  it('should redirect to home page when user is logout', done => {

    agent
    .post('/login')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      username: 'test',
      password: 'secret'
    })
    .expect(302)
    .expect('Location', '/')
    .end((err, res) => {
        if(err) return done(err);
    });
    agent.get('/post/create')
    .expect(200)
    .end((err, res) => {
        if(err) return done(err);   
    });
    agent
      .get('/logout')
      .expect(302)
      .expect('Location', '/')
      .end((err, res) => {
        // we wait till the logout finish and we
        // make sure there is no session
        if(err) return done(err);   
        agent.get('/post/create')
        .expect(302)
        .expect('Location', '/login')
        .end((err, res) => {
          if(err) return done(err); 
          return done();
        });
      });

  });

});