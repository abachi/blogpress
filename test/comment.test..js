const request = require('supertest');
const app     = require('../server');
const agent   = request.agent(app);
const assert  = require('assert');
const Post    = require('../models/Post');
const Comment    = require('../models/Comment');
const User    = require('../models/User');


describe('Post CRUD', function() {

  it('guest cannot create a comment without login', async () => {
    let post = new Post({
      'title': 'The Post title',
      'text': 'The Post text',
      'user_id': 1,
    });
    await post.save();

    await agent
    .post(`/comment/${post.id}`)
    .send({
        'comment': 'A simple comment',
        'post_id': post.id
    })
    .expect(302)
    .expect('Location', '/login');
  });

  it('should add a comment to post', async () => {
    
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});
    let user = await User.register(new User({'username': 'test'}), 'secret');
    
    let post = new Post({
      'title': 'The Post title',
      'text': 'The Post text',
      'user_id': 1,
    });
    await post.save();

    await agent
      .post('/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
      'username': 'test',
      'password': 'secret'
    })
    .expect(302)
    .expect('Location', '/');

    let count = await Comment.countDocuments({});
    assert.equal(count, 0);

    await agent
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .post(`/comment/${post.id}`)
    .send({
      'comment': 'A simple comment',
    })
    .expect(302)
    .expect('Location', `/post/show/${post.id}`);
    
    count = await Comment.countDocuments({});
    assert.equal(count, 1);
  });

  it('should not add a comment for non-existent post', async () => {
    
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});
    let user = await User.register(new User({'username': 'test'}), 'secret');

    let count = await Comment.countDocuments({});
    assert.equal(count, 0);

    await agent
      .post('/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
      'username': 'test',
      'password': 'secret'
    })
    .expect(302)
    .expect('Location', '/');

    await agent
    .post(`/comment/123456789`) // 2121212121 is a fake post id
    .send({
        'comment': 'A simple comment',
    })
    .expect(302)
    .expect('Location', '/404');
  
    count = await Comment.countDocuments({});
    assert.equal(count, 0);
  
  });

  it('should not add an empty comment', async () => {
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});
    let user = await User.register(new User({'username': 'test'}), 'secret');
    
    let post = new Post({
      'title': 'The Post title',
      'text': 'The Post text',
      'user_id': 1,
    });
    await post.save();

    await agent
      .post('/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
      'username': 'test',
      'password': 'secret'
    })
    .expect(302)
    .expect('Location', '/');

    let count = await Comment.countDocuments({});
    assert.equal(count, 0);

    await agent
    .post(`/comment/${post.id}`)
    .send({
        'comment': '',
    })
    .expect(302)
    .expect('Location', `/post/show/${post.id}`);
    
    count = await Comment.countDocuments({});
    assert.equal(count, 0);

  });

});
