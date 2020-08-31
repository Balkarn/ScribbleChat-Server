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

//When there is a connection from a new client
io.on("connection", (socket) => {

    socket.name = null;
    console.log("New client connected");

    //Request from the client to try a username
    socket.on('tryName', (nameAttempt) => {

        if (names.indexOf(nameAttempt) > -1) { //If name already exists
            socket.emit('nameAgain',nameAttempt);
        } else {
            io.emit
            names.push(nameAttempt); //Store the name
            socket.name = nameAttempt;
            socket.emit('nameValid',""); //Send a message back that it is valid
            console.log(names);
            socket.broadcast.emit('userJoined',nameAttempt); //Tell everyone else that there is a new user
        }

    });

    //Request from the client to know who is online
    socket.on('requestCurrentlyOnline', (data) => {

        toReturn = "Currently online:";
        for (i = 0; i < names.length; i++) { //Build a string of everyone online
            if (names[i] != data) {
                toReturn = toReturn + " " + names[i] + ",";
            } else {
                toReturn = toReturn + " and you!";
            }
        }
        socket.emit('currentlyOnline', toReturn); //Send a message back of the built string

    });

    //Request from the cleint to send a message
    socket.on('sendMessage', (msg) => {
        io.emit('recieveMessage', msg); //Emit the chat message event to everyone connected
    });

    //Disconnection event
    socket.on("disconnect", () => {

        socket.broadcast.emit('userLeft', socket.name); //Tell everyone else that they have left
        console.log("Client disconnected");

        if (socket.name!=null) { //Remove the users name from the list of names online (if the name has been selected)
            var index = names.indexOf(socket.name);
            if (index > -1) {
                names.splice(index, 1);
            }   
            console.log(names);
        }

    });

});

server.listen(port, () => console.log(`Listening on port ${port}`));