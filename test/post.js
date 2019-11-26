const request = require('supertest');
const app     = require('../server');
const agent   = request.agent(app);
const assert  = require('assert');
const Post    = require('../models/Post');

describe('Post', function() {
  
  before((done) => {
    Post.deleteMany({}).then(() => {
      done();
    });
  });

  it('guest cannot create a post without login', (done) => {
    request(app)
    .post('/post/create')
    .send({
        'title': 'A Post Title Example',
        'text': 'This is a body text example.'
    })
    .expect(302)
    .expect('Location', '/login')
    .end((err, res) => {
      if(err) return done(err);
      return done();
    });
  });
  
  it('should post an article with authenticated user', done => {
      // make suer theres no articles
      let query = Post.find({});

      query.exec(function (err, docs) {
        assert.equal(docs.length, 0);
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
            agent
            .post('/post/create')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
              'title': 'A Post Title Example',
              'text': 'This is a body text example.'
            })
            .expect(302)
            .expect('Location', '/')
            .end((err, res) => {
              if(err) return done(err);
              let query = Post.find({});
              query.exec(function (err, docs) {
                assert.equal(docs.length, 1);
              });
              return done();
            });
        });
        
      });
  });


});
