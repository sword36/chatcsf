var config = require("../config");
var log = require("../libs/log")(module);
var connect = require("connect");
var async = require("async");
var cookie = require("cookie");
var sessionStore = require("../libs/sessionStore");
var HttpError = require("../error").HttpError;
var User = require("../models/user").User;

function LoadSession(sid, callback) {
    sessionStore.load(sid, function(err, session) {
        if (arguments.length == 0)
            return callback(null, null);
        else if (err)
            return callback(err);
        else
            return callback(null, session);
    });
}

function LoadUser(session, callback) {
    if (!session.user) {
        log.debug("Session %s anonymous", session.id);
        return callback(null, null);
    }

    log.debug("retrieving user ", session.user);
    User.findById(session.user, function(err, user) {
        if (err)
            return callback(err);

        if (!user)
            return callback(null, null);
        log.debug("User find by id result " + user);
        callback(null, user);

    });
}

module.exports = function(server) {
    var io = require("socket.io").listen(server);
    io.set("logger", log);
    io.set("authorization", function(handshake, callback) {
        async.waterfall([
            function(callback) {
                handshake.cookies = cookie.parse(handshake.headers.cookie || "");
                var sidCookie = handshake.cookies[config.get("session:key")];
                var sid = connect.utils.parseSignedCookie(sidCookie, config.get("session:secret"));
                LoadSession(sid, callback);
            },
            function(session, callback) {
                if (!session)
                    callback(new HttpError(401, "No session"));
                handshake.session = session;
                LoadUser(session, callback);
            },
            function(user, callback) {
                if (!user)
                    callback(new HttpError(403, "Anonymous session may not connect"));

                handshake.user = user;
                callback(null);
            }
        ], function(err) {
            if (!err)
            {
                return callback(null, true);
            }
            if (err instanceof HttpError)
                return callback(null, false);

            callback(err);
        })
    });
    io.set("origins", "localhost:*");
    //io.set("origins", "https://mysterious-island-7447.herokuapp.com:*");


    io.sockets.on("session:reload", function(sid) {
        var clients = io.sockets.clients();

        clients.forEach(function(client) {
            if (client.handshake.session.id != sid) return;

            LoadSession(sid, function(err, session) {
                if (err) {
                    client.emit("error", "server error");
                    client.disconnect();
                    return;
                }
                if (!session) {
                    client.emit("logout");
                    client.disconnect();
                    return;
                }
                client.handshake.session = session;
            });
        });
    });

    io.sockets.on("connection", function (socket) {
        var username = socket.handshake.user.get('username');
        var time = (new Date()).toTimeString().substr(0, 8);

        socket.json.send({'event': 'connected', 'name':username, 'time':time});
        socket.broadcast.json.send({'event':'userJoined', 'name': username, 'time': time});

        socket.on("message", function (msg) {
            var time = (new Date).toTimeString().substr(0,8);


            socket.json.send({'event': 'messageSent', 'name':username, 'text': msg, 'time':time});
            socket.broadcast.json.send({'event':'messageReceived', 'name': username, 'text': msg, 'time': time});
        });

        socket.on("disconnect", function() {
            var time = (new Date()).toTimeString().substr(0, 8);
            io.sockets.json.send({'event':'userSplit', 'name':username, 'time':time});
        });
    });
    return io;
};