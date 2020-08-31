//Server

const express = require("express"); 
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001; //listen to environment variable port, otherwise port 4001
const index = require("./routes/index"); //Index route to listen to connection

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

var names = [] //List of all names online

io.on("connection", (socket) => { //on connection

    socket.name = null;

    console.log("New client connected");

    socket.on('tryName', (nameAttempt) => {
        if (names.indexOf(nameAttempt) > -1) { //If name already exists
            socket.emit('nameAgain',nameAttempt);
        } else {
            io.emit
            names.push(nameAttempt);
            socket.name = nameAttempt;
            socket.emit('nameValid',"");
            console.log(names);
            socket.broadcast.emit('userJoined',nameAttempt);
        }
    });

    socket.on('requestCurrentlyOnline', (data) => {
        toReturn = "Currently online:";
        for (i = 0; i < names.length; i++) {
            if (names[i] != data) {
                toReturn = toReturn + " " + names[i] + ",";
            } else {
                toReturn = toReturn + " " + names[i] + "(you)"
            }
        }
        socket.emit('currentlyOnline', toReturn);
    });

    socket.on('sendMessage', (msg) => {
        io.emit('recieveMessage', msg); //emit the chat message event to everyone
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit('userLeft', socket.name);
        console.log("Client disconnected");
        if (socket.name!=null) {
            var index = names.indexOf(socket.name);
            if (index > -1) {
                names.splice(index, 1);
            }   
            console.log(names);
        }
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));