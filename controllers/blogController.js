const Post = require('../models/postModel');
const Like = require('../models/likeModel');
const Settings = require('../models/settingModel');
const { ObjectId } = require('mongodb');
const config = require('../config/config');
const nodemailer = require('nodemailer');



const sendCommentMail = async (name, email, post_id) => {
    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailpassword
            }
        });

        const mailOption = {
            from: 'BMS',
            to: email,
            subject: 'Replay On your comment',
            html: '<p>' + name + ',has Replied On your Comment <a href="http://127.0.0.1:3000/post/' + post_id + '" >Read Hear your Comment Replay</a></p>'
        }
        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                // console.log("Error found");
                console.log(error);
            } else {
                console.log("Email has been Send ", info.response);
            }
        });

    } catch (error) {
        console.log(error.message);
    }
}


const loadBlog = async (req, res) => {
    try {

        const setting = await Settings.findOne({});
        const postLimit = setting.post_limit;

        const posts = await Post.find({}).limit(postLimit);

        res.render('blog', {
            posts: posts,
            postLimit: postLimit
        });
    } catch (error) {
        console.log(error.message);
    }
}

const loadPost = async (req, res) => {
    try {
        const reqParams = req.params;
        const { id } = reqParams;
        const likes = await Like.find({ "post_id": id, type: 1 }).count();
        const disLikes = await Like.find({ "post_id": id, type: 0 }).count();
        const postData = await Post.findOne({ _id: id });
        res.render('post', { post: postData,likes:likes,disLikes:disLikes });
    } catch (error) {
        console.log(error.message);
    }
}

const addComment = async (req, res) => {
    try {
        const reqBody = req.body;
        const { post_id, username, email, comment } = reqBody;
        var comment_id = new ObjectId();
        await Post.findOneAndUpdate({ _id: post_id }, {
            $push: {
                comments: {
                    _id: comment_id, username: username, email: email, comment: comment
                }
            }
        });

        res.status(200).send({ success: true, msg: "Comment Added!", _id: comment_id });


    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const doReply = async (req, res) => {
    try {
        const reqBody = req.body;
        const { post_id, comment_id, comment_email, name, reply } = reqBody;
        var reply_id = new ObjectId();
        await Post.updateOne({
            "_id": new ObjectId(post_id),
            "comments._id": new ObjectId(comment_id)
        }, {
            $push: {
                "comments.$.replies": { _id: reply_id, name: name, reply: reply }
            }
        });

        await sendCommentMail(name, comment_email, post_id)


        res.status(200).send({ success: true, msg: "Reply Added!", _id: reply_id })
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message })
    }
}
const getPosts = async (req, res) => {
    try {

        const reqParams = req.params;
        const { start, limit } = reqParams;


        const posts = await Post.find({}).skip(start).limit(limit);
        res.send(posts);

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message })
    }
}


module.exports = {
    loadBlog,
    loadPost,
    addComment,
    doReply,
    getPosts
}