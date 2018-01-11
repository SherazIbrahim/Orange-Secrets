var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
    server.listen(process.env.PORT || 3000);
var usernames = [];
console.log('Server is running...');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/' + 'index.html');
});

io.sockets.on('connection', function(socket) {


    socket.on("add user", function (data, callback) {
        if (usernames.indexOf(data.username) === -1) {
            callback(true);
            var username = data.username;
            var room = data.room;
            socket.username = username;
            usernames.push(socket.username);
            socket.room = room;
            socket.join(room);
            io.sockets.in(socket.room).emit('declare username', { username: socket.username });
        }
        else {
            callback(false);
        }

    });
    socket.on('disconnect', function (data) {
        if (!socket.username) {
            return;
        }
        socket.in(socket.room).emit('disconnected', { username: socket.username });
        usernames.splice(usernames.indexOf(socket.username),1);
    });
    socket.on('sent message', function (data) {
        io.sockets.in(socket.room).emit('recieved message', { message: data, sentby: socket.username });
    });

});