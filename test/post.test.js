const request = require('supertest');
const app     = require('../server');
const agent   = request.agent(app);
const assert  = require('assert');
const Post    = require('../models/Post');
const User    = require('../models/User');


describe('Post CRUD', function() {

  it('guest cannot create a post without login', async () => {
    await agent
    .post('/post/create')
    .send({
        'title': 'A Post Title Example',
        'text': 'This is a body text example.'
    })
    .expect(302)
    .expect('Location', '/login');
  });
    
  it('should not delete a post without authentication', async () => {
    await Post.deleteMany({});
    let count = await Post.countDocuments({});
    assert.equal(count, 0);

    let post = new Post({
      'title': 'a simple title',
      'text': 'a long text should be here',
    });
    await post.save();
    
    await agent
    .delete(`/post/delete/${post.id}`)
    .expect(302)
    .expect('Location', '/login');

    count = await Post.countDocuments({});
    assert.equal(count, 1);

    const foundPost = await Post.findOne({_id: post.id})
    assert.notEqual(foundPost, null);
    assert.equal(post.id, foundPost.id);
  });

  it('authenticated user can delete his own post', async () => {
  
    let userOne;
    let userTwo;
    const agentOne = request.agent(app);
    const agentTwo = request.agent(app);
    await User.deleteMany({});
    await Post.deleteMany({});

    userOne = await User.register(new User({'username': 'userOne'}), 'secret');
    userTwo = await User.register(new User({'username': 'userTwo'}), 'secret');
    let postByUserOne = new Post({
      'title': 'A random title',
      'text': 'A random text',
      'user_id': userOne.id,
    });
      
    await postByUserOne.save();
    await agentOne
      .post('/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
      'username': 'userOne',
      'password': 'secret'
    })
    .expect(302)
    .expect('Location', '/');

    await agentTwo
    .post('/login')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      'username': 'userTwo',
      'password': 'secret'
    })
    .expect(302)
    .expect('Location', '/');

    await agentTwo
    .delete(`/post/delete/${postByUserOne.id}`)
    .expect(401);

      await agentOne
      .delete(`/post/delete/${postByUserOne.id}`)
      .expect(302)
      .expect('Location', '/');
  });

  it('should add a post with authenticated user', async () => {
      await User.deleteMany({});
      await Post.deleteMany({});
      user = await User.register(new User({'username': 'test'}), 'secret');
      let count = await Post.countDocuments({});
      assert.equal(count, 0);

      await agent
      .post('/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        username: 'test',
        password: 'secret'
      })
      .expect(302)
      .expect('Location', '/');

      await agent
      .post('/post/create')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        'title': 'A Post Title Example',
        'text': 'This is a body text example.'
      })
      .expect(302)
      .expect('Location', '/')

      count = await Post.countDocuments({});
      assert.equal(count, 1);
  });

  it('user should update his own post', async () => {
    
    await Post.deleteMany({});
    await User.deleteMany({});

    user = await User.register(new User({ 'username': 'test' }), 'secret');
    // authenticate a user, is there a better way to create an authenticated user?
    await agent.post('/login')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      'username': 'test',
      'password': 'secret'
    })
    .expect(302)
    .expect('Location', '/');
    let count = await Post.countDocuments({}); 
    assert.equal(count, 0);

    let post = new Post({
      'title': 'The old title',
      'text': 'The old text',
      'user_id': user.id,
    });
    await post.save();
    count = await Post.countDocuments({}); 
    assert.equal(count, 1);
    await agent
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .put(`/post/edit/${post.id}`)
    .send({
      'title': 'A new title',
      'text': 'The old text'
    })
    .expect(302)
    .expect('Location', `/post/show/${post.id}`);
    
    const foundPost = await Post.findOne({_id: post.id});
    assert.equal(foundPost.id, post.id);
    assert.notEqual(foundPost.title, post.title);
    assert.equal(foundPost.title, 'A new title');
  });


  it('should update only owner post', async () => {
    let userOne;
    let userTwo;
    const agentOne = request.agent(app);
    const agentTwo = request.agent(app);
    await User.deleteMany({});
    await Post.deleteMany({});

    userOne = await User.register(new User({'username': 'userOne'}), 'secret');
    userTwo = await User.register(new User({'username': 'userTwo'}), 'secret');
    let postByUserOne = new Post({
      'title': 'A dummy title',
      'text': 'A dummy text',
      'user_id': userOne.id,
    });
      
    await postByUserOne.save();
    await agentOne
      .post('/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
      'username': 'userOne',
      'password': 'secret'
    })
    .expect(302)
    .expect('Location', '/');

    await agentTwo
    .post('/login')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      'username': 'userTwo',
      'password': 'secret'
    })
    .expect(302)
    .expect('Location', '/');

    await agentTwo
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .put(`/post/edit/${postByUserOne.id}`)
    .send({
      'title': 'A new title',
      'text': 'A new text'
    })
    .expect(401);

    const foundPost = await Post.findOne({_id: postByUserOne.id});
    assert.equal(foundPost.id, postByUserOne.id);
    assert.equal(foundPost.title, postByUserOne.title);
    assert.equal(foundPost.title, 'A dummy title');
    assert.equal(foundPost.text, 'A dummy text');

  });

});
