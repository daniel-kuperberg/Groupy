//var express = require('express');
//var app = express();

////app.get('/', function (req, res) {
////    res.send('Hello World!');
////});
//app.get('/', function (request, res) {
//    console.log('aa');
//    res.sendFile('C:\\AngularApp\\Groupy\\default.html');
//});

//var server = app.listen(3000, function () {
//    var host = "127.0.0.1";
//    var port = server.address().port;

//    console.log('Example app listening at http://%s:%s', host, port);
//});

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

app.get('/', function (request, res) {
    console.log('aa');
    res.sendFile('C:\\AngularApp\\Groupy\\public\\default.html');
});
server.listen(port, function () {
    var host = "127.0.0.1";
    console.log('Example app listening at http://%s:%s', host, port);
});
  
// Routing
app.use('/js',  express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public'));
//app.use(express.static(path.join(__dirname, 'public')));
// Chatroom
// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;
  
io.on('connection', function (socket) {
    var addedUser = false;
    console.log('aa');
    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data,
            timestamp: Date.now()
        });
        console.log('I sent it');
    });
  
    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {

        //console.log('aa');

        // we store the username in the socket session for this client
        socket.username = username;
        // add the client's username to the global list
        usernames[username] = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });
  
    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });
  
    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });
  
    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        // remove the username from global usernames list
        if (addedUser) {
            delete usernames[socket.username];
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});

