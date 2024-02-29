const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const config = require('../config/config');
const admin_Controller = require('../controllers/adminController');

const sendRestPasswordMail = async (name, email, token) => {
    try {
        const transport = nodemailer.createTransport({
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
            from: config.emailUser,
            to: email,
            subject: 'Reset Password',
            html: '<p>Hii' + name + ', Please click here to <a href="http://127.0.0.1:3000/reset-password?token=' + token + '">Reset</a>Your Password'
        }
        transport.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been send :- ", info.response);
            }
        });

    } catch (error) {
        console.log(error.message);
    }
}


const loadLogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}
const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/login')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        const reqBody = req.body;
        const { email, password } = reqBody;
        if (!email || !password) {
            res.render('login', { message: "please fill all the fild" });
        }
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                req.session.user_id = userData._id;
                req.session.is_admin = userData.is_admin;
                if (userData.is_admin == 1) {
                    res.redirect('/dashboard');
                } else {
                    res.redirect('/profile');
                }
            } else {
                res.render('login', { message: "User Or Password is Wrong!" });
            }
        } else {
            res.render('login', { message: "User Or Password is Wrong!" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const profileLoad = async (req, res) => {
    try {
        res.render('profile');
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad = async (req, res) => {
    try {
        res.render('forget-password')
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordVerify = async (req, res) => {
    try {
        const reqBody = req.body;
        const { email } = reqBody;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const randomString = randomstring.generate();

             await User.updateOne({ email }, { $set: { token: randomString } });
            await sendRestPasswordMail(userData.name, userData.email, randomString);
            res.render('forget-password', { message: "Please check your mail to Reset your Password" })

        } else {
            res.render('forget-password', { message: "User email does not exist!." });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resetPasswordLoad = async (req, res) => {
    try {
        const reqQuery = req.query;
        const { token } = reqQuery;
        const userData = await User.findOne({ token: token });
        if (userData) {
            res.render('reset-password', { user_id: userData._id })
        } else {
            res.render('404');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = async (req, res) => {
    try {
        const reqBody = req.body;
        const { password, user_id } = reqBody;
        const newPassword = await admin_Controller.securePassword(password);
        await User.updateOne({ _id: user_id }, { $set: { password: newPassword, token: '' } });
        res.render('resetPasswordMessage',{message:"Your Passwor Has been Updated"});
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    profileLoad,
    logout,
    forgetPasswordLoad,
    forgetPasswordVerify,
    resetPasswordLoad,
    resetPassword
}