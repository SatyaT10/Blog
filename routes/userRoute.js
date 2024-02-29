const express = require("express");
const user_routes = express();

user_routes.use(express.json());
user_routes.use(express.urlencoded({ extended: true }));

const config = require('../config/config');
const session = require('express-session');
user_routes.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true
}));

user_routes.set('view engine', 'ejs');
user_routes.set('views', './views');

user_routes.use(express.static('public'));

const userController = require('../controllers/userController');
const adminLoginAuth = require('../middlewares/Admin/adminLoginAuth');

user_routes.get('/login', adminLoginAuth.isLogout, userController.loadLogin);

user_routes.post('/login', userController.verifyLogin);

user_routes.get('/logout', adminLoginAuth.isLogin, userController.logout);


user_routes.get('/profile', userController.profileLoad);

user_routes.get('/forget-password', adminLoginAuth.isLogout, userController.forgetPasswordLoad)


user_routes.post('/forget-password',userController.forgetPasswordVerify)

user_routes.get('/reset-password',adminLoginAuth.isLogout,userController.resetPasswordLoad);

user_routes.post('/reset-password',userController.resetPassword);



module.exports = user_routes;
