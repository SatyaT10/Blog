const BlogSetting = require('../models/blogSettingModel');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const Settings = require('../models/settingModel');
const bcrypt = require('bcrypt');

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}


const blogSetup = async (req, res) => {
    try {
        const blogSetting = await BlogSetting.find({});
        // console.log(blogSetting);
        if (blogSetting.length > 0) {
            res.redirect('/login');
        } else {
            res.render('blogSetup');

        }
        res.send('New Blog Setup here');
    } catch (error) {
        console.log(error.message);
    }
}

//Blog Save
const blogSetupSave = async (req, res) => {
    try {
        const reqBody = req.body;
        const { blog_title, description, name, email, password } = reqBody;
        const blog_logo = req.file.filename;
        const newPassword = await securePassword(password);

        await BlogSetting.create({
            blog_title: blog_title,
            blog_logo: blog_logo,
            description: description,
        })

        const user = new User({
            name: name,
            email: email,
            password: newPassword,
            is_admin: 1
        })
        const userData = await user.save();
        if (userData) {
            res.redirect('/login');
        } else {
            res.render('blogSetup', { message: 'Blog not setup properly' });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const dashboardLoad = async (req, res) => {
    try {
        const allPost = await Post.find({});

        res.render('admin/dashboard', { posts: allPost });
    } catch (error) {
        console.log(error.message);
    }
}

const loadPostDashboard = async (req, res) => {
    try {
        res.render('admin/postDashboard');

    } catch (error) {
        console.log(error.message);
    }
}

const addPost = async (req, res) => {
    try {
        var images = '';
        if (req.body.image !== undefined) {
            images = req.body.image;
        }


        const reqBody = req.body;
        const { title, content } = reqBody;

        const postData = await Post.create({
            title: title,
            content: content,
            image: images
        });
        res.send({ success: true, msg: 'Your Post was Add successfully!', _id: postData._id });

    } catch (error) {
        res.send({ success: false, msg: error.message });
    }
}
const uploadPostImage = async (req, res) => {
    try {

        var imagePath = '/images';
        imagePath = imagePath + '/' + req.file.filename;
        res.send({ success: true, msg: 'Post Image Upload successfully!', path: imagePath });

    } catch (error) {
        res.send({ success: false, message: error.message });
    }
}

const deletePost = async (req, res) => {
    try {
        const reqBody = req.body;
        const { _id } = reqBody;
        await Post.deleteOne({ _id: _id });
        res.status(200).send({ success: true, msg: "Post Deleted Successfully!" });

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const loadEditPosts = async (req, res) => {
    try {
        const reqParams = req.params;
        const { id } = reqParams;
        const postData = await Post.findOne({ _id: id });
        res.render('admin/editPost', { post: postData });

    } catch (error) {
        console.log(error.message);
    }
}

const updatePosts = async (req, res) => {
    try {
        const reqBody = req.body
        const { id, title, content, image } = reqBody;
        await Post.findOneAndUpdate({ _id: id }, { $set: { title: title, content: content, image: image } });
        res.status(200).send({ success: true, msg: "Your Post has updated successfully!" });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const loadSettings = async (req, res) => {
    try {
        var setting = await Settings.findOne({});
        var postLimit = 0;

        if (setting != null) {
            postLimit = setting.post_limit;
        }
        res.render('admin/setting', { limit: postLimit });
    } catch (error) {
        console.log(error.message);
    }
}

const saveSettings = async (req, res) => {
    try {

        const reqBody = req.body;
        console.log(reqBody);
        const { postLimit } = reqBody;
        console.log(postLimit);
        await Settings.updateOne({}, {
            post_limit: postLimit
        }, { upsert: true })
        res.status(200).send({ success: true, msg: "Settings updated!" });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

module.exports = {
    blogSetup,
    blogSetupSave,
    dashboardLoad,
    loadPostDashboard,
    addPost,
    securePassword,
    uploadPostImage,
    deletePost,
    loadEditPosts,
    updatePosts,
    loadSettings,
    saveSettings
}