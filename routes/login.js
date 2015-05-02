var User = require("../models/user").User;
var async = require("async");
var HttpError = require("../error").HttpError;
var AuthError = require("../error").AuthError;

exports.get = function (req, res) {
    res.render("login");
};

exports.post = function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var regUser = /^([a-zа-яё0-9_]{3,20})$/i;
    var regPas = /^.{4,12}$/;
    User.authorize(username, password, function(err, user) {
        if (!regUser.test(username))
        {
            return next(new HttpError(403, "Недопустимый логин"));
        }
        if (!regPas.test(password))
        {
            return next(new HttpError(403, "Пароль должен содержать от 4 до 12 символов"))
        }
        if (err)
        {
            if (err instanceof AuthError){
                return next(new HttpError(403, err.message));
            } else {
                return next(err);
            }
        }
        req.session.user = user._id;
        res.send({});
    })

};
