const isLogin = async (req, res, next) => {
    try {
        const reqSession = req.session;

        const { user_id, is_admin } = reqSession;

        if (user_id && is_admin == 1) {

        } else {
            res.redirect('/login');
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}


const isLogout = async (req, res, next) => {
    try {
        const reqSession = req.session;

        const { user_id, is_admin } = reqSession;

        if (user_id && is_admin == 1) {
            res.redirect('/dashboard')
        } 
        next()
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}