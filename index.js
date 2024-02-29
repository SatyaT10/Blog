const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://satyaprakashroy280:dnkfLWd9wKBAZC0Y@blog.pgbecex.mongodb.net/');
const morgan=require('morgan');


const express = require('express');
const app = express();
const http = require('http').createServer(app);
app.use(morgan('dev'));

const { Server } = require('socket.io');
const io = new Server(http, {})

const isBlog = require('./middlewares/is_blog');
app.use(isBlog.isBlog);

//for Admin Routes
const admin_routes = require('./routes/adminRoute');
app.use('/', admin_routes);


//User Routes
const user_Routes = require("./routes/userRoute");
app.use('/', user_Routes);

//Blog Routes
const blog_Route = require("./routes/blogRoute");
app.use('/', blog_Route);

const Post = require('./models/postModel');
const { ObjectId } = require('mongodb');

// app.get('/', function (req, res) {
//     res.send("Route is hitting");
// })
io.on('connection', function (socket) {
    console.log("User connected");

    socket.on("new_post", function (formData) {
        socket.broadcast.emit("new_post", formData);

    });
    socket.on("new_comment", function (comment) {
        io.emit("new_comment", comment);

    });

    socket.on("new_reply", function (reply) {
        io.emit("new_reply", reply);

    });
    socket.on("delete_post", function (postId) {
        socket.broadcast.emit("delete_post", postId);

    });
    socket.on('increment_page_view', async function (post_id) {
        var data = await Post.findOneAndUpdate({ _id: (post_id) }, {
            $inc: { views: 1 }
        }, {
            new: true,
        });
        socket.broadcast.emit("updated_views", data);
    })
});

http.listen(3000, () => console.log("Server is connected on port 3000."));