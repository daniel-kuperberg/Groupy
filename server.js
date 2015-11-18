var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

app.get('/', function (request, res) {
    res.sendFile(__dirname + '/public/default.html');
});
server.listen(port, function () {
    var host = "127.0.0.1";
    console.log('Example app listening at http://%s:%s', host, port);
});

// Routing
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public'));
//app.use(express.static(path.join(__dirname, 'public')));
// Chatroom
// usernames which are currently connected to the chat

var client = {
    "username": "",
    "groupName": "",
    "socket": ""
};
var clientsArray = [];
var numUsers = 0;

io.on('connection', function (socket) {
    var addedUser = false;
    console.log('New client connected (id=' + socket.id + ').');
   
   
    // when the client emits 'new message', this listens and executes

    
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'  
        var a = JSON.stringify(data);
        console.log(a);
        debugger;

        var clientNumberinArray = -1;
        for (var i = 0; i < clientsArray.length; i++) {
            if (clientsArray[i].username == data.username)
                clientNumberinArray = i;
        }

        console.log("Client Number in array: " + clientNumberinArray);
        //console.log("GroupName: " + clientsArray[clientNumberinArray].groupName);

        for (var i = 0; i < clientsArray.length; i++) {
            if (i == clientNumberinArray)
                continue;

            if (clientsArray[i].groupName == clientsArray[clientNumberinArray].groupName) {
                clientsArray[i].socket.emit('new message', {
                    username: clientsArray[i].username,
                    message: data.message,
                    timestamp: Date.now()
                });
            }
        }



        //clients[1].emit('new message', {
        //    username: socket.username,
        //    message: data,
        //    timestamp: Date.now()
        //});
        //socket.broadcast.emit('new message', {
        //    username: socket.username,
        //    message: data,
        //    timestamp: Date.now()
        //});
        console.log('I sent it');
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (obj) {
        
        console.log("add user - UserName: " + obj.username + "  " + "GroupName: " + obj.groupName);


        // we store the username in the socket session for this client
        //socket.username = obj.username;
        // add the client's username to the global list
        //usernames[obj.username] = obj.username;
        client = {}
        client.username = obj.username;
        client.groupName = obj.groupName;
        client.socket = socket;

        clientsArray.push(client);
        
        //for (var i = 0; i < clientsArray.length; i++) {
        //    console.log(i+": "  +" UserNane " + clientsArray[i].username+ " GroupName:  "+ clientsArray[i].groupName);
           
        //}

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
           // delete usernames[socket.username];
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});

