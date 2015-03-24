/**
 * Created by USER on 13.03.2015.
 */
var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8000);

function handler(req, res)
{
    fs.readFile("IO/index.html",
        function(err, data) {
            if (err)
            {
                res.writeHead(500);
                return res.end("Error with loading data");
            }
            res.writeHead(200);
            res.end(data);
        });
}

io.sockets.on("connection", function(socket) {
    var ID = (socket.id).toString().substr(0, 5);
    var time = (new Date).toTimeString().substr(0,8);
    socket.json.send({'event':'connected', 'name': ID, 'time': time});
    socket.broadcast.json.send({'event':'userJoined', 'name': ID, 'time': time});

    socket.on('message', function(msg) {
        var time = (new Date).toTimeString().substr(0,8);
        socket.json.send({'event':'messageSent', 'name': ID, 'text': msg, 'time': time});
        socket.broadcast.json.send({'event':'messageReceived', 'name': ID, 'text': msg, 'time': time});

    });
    socket.on('disconnect', function() {
        var time = (new Date).toTimeString().substr(0,8);
        io.sockets.json.send({'event': 'userSplit', 'name': ID, 'time': time});
    })
});
