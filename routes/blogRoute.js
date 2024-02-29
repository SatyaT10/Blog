const express = require('express');
const blog_Route = express();


blog_Route.set('view engine', 'ejs')
blog_Route.set('views', './views');

blog_Route.use(express.static('public'));

const blog_Controller = require('../controllers/blogController');

blog_Route.get('/', blog_Controller.loadBlog);

blog_Route.get('/post/:id', blog_Controller.loadPost);

blog_Route.post('/add-comment', blog_Controller.addComment);

blog_Route.post('/do-reply', blog_Controller.doReply);


blog_Route.get('/get-posts/:start/:limit', blog_Controller.getPosts);



module.exports = blog_Route;