
const Post = require('../models/Post');

const DBSeeder = async () => {
    await Post.deleteMany({});
    console.log('Delete All Posts');
    await Post.create({user_id: 1, title: 'One title like an example ', text: 'some lorem text goes here', created_at: new Date()});
    await Post.create({user_id: 1, title: 'Another title like an example ', text: 'some lorem text goes here', created_at: new Date()});
    await Post.create({user_id: 1, title: 'Third title like an example ', text: 'some lorem text goes here', created_at: new Date()});
    console.log('Create 3 Posts');
};




module.exports = DBSeeder;