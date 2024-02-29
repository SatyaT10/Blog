const express = require("express");
const admin_routes = express();

admin_routes.use(express.json());
admin_routes.use(express.urlencoded({ extended: true }));

const config = require('../config/config');
const session = require('express-session');
admin_routes.use(session({ 
    secret: config.sessionSecret,
    resave:true,
    saveUninitialized:true 
}));

const adminLoginAuth=require('../middlewares/Admin/adminLoginAuth');

admin_routes.set('view engine', 'ejs');
admin_routes.set('views', './views');

const multer = require('multer');
const path = require('path');

admin_routes.use(express.static('public'));

const staroge = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    }
});

const upload = multer({ storage: staroge });

const admin_controller = require('../controllers/adminController');


admin_routes.get('/blog-setup', admin_controller.blogSetup);


admin_routes.post('/blog-setup',upload.single('blog_logo'), admin_controller.blogSetupSave);

admin_routes.get('/dashboard',adminLoginAuth.isLogin,admin_controller.dashboardLoad);


admin_routes.get('/create-post',adminLoginAuth.isLogin,admin_controller.loadPostDashboard);

admin_routes.post('/create-post',adminLoginAuth.isLogin,admin_controller.addPost);

admin_routes.post('/upload-post-image',adminLoginAuth.isLogin,upload.single('image'),admin_controller.uploadPostImage);

admin_routes.post('/delete-post',adminLoginAuth.isLogin,admin_controller.deletePost);

admin_routes.get('/edit-post/:id',adminLoginAuth.isLogin,admin_controller.loadEditPosts);

admin_routes.post('/update-post',adminLoginAuth.isLogin,admin_controller.updatePosts);

admin_routes.get('/settings',adminLoginAuth.isLogin,admin_controller.loadSettings);

admin_routes.post('/settings',adminLoginAuth.isLogin,admin_controller.saveSettings);

module.exports = admin_routes;