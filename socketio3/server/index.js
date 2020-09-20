//Name : Poojanbhai Niteshbhai Patel
//UTA ID : 1001827807

// This will store socket function from library import
const socket = require('socket.io');

const ioServer = socket(6363); //This will start socket server on 6363 port -> returns ioServer Object

let connectedUser = [];
let clients = [];

// Listen for client join
ioServer.on('connection', function (socket) {

    //This will emit immediately => give socket to the client
    socket.emit('CLIENT_JOINED', socket.id);
    socket.on('CLIENT_JOINED', obj => {
    console.log("TCL: obj", obj)
        if (clients.filter((ele) => ele.name === obj.name).length === 1) {
            // socket.emit('repeat-name')
        } else {
            connectedUser.push(obj);
            socketId = obj.socketId;
            try {
                // join three person room
                socket.join('ThreePersonRoom');

                //This will Keep track of logged in clients
                clients = Object.keys(socket.adapter.rooms.ThreePersonRoom.sockets).map(client => {
                    return {
                        name: connectedUser.find(ele => ele.socketId === client).name,
                        socketId: client
                    }
                })

                ioServer.to('ThreePersonRoom').emit('room-joined', clients)
            } catch (error) {
                console.log('TCL: -> error', error);
            }

            //This will Emit in specific room
            socket.on('send-chat-msg', function (obj) {
                ioServer.to('ThreePersonRoom').emit('send-chat-msg', obj)
            })
            // Emit in specific user (Private msg)
            socket.on('send-private-msg', function (clt) {
                //This will check if client is online or not
                let obj = clients.find(ele => ele.socketId === clt.socketId)

                obj.msg = clt.msg
                obj.from = clt.from
                ioServer.to(clt.socketId).emit('send-private-msg', obj)
            })
        }
    });
    socket.on('disconnect', () => {
        ioServer.to('ThreePersonRoom').emit('room-leave', clients.find((client) => client.socketId === socket.id))
        connectedUser = connectedUser.filter((client) => client.socketId !== socket.id)
    });
});

// socket.broadcast.emit('all', connectedUser);
// socket.on('client-join', function(name) {
//     if (Object.keys(connectedUser).length === 3) {
//         socket.emit('full-room')
//         console.log("TCL: connectedUser", connectedUser);
//     } else {
//         connectedUser[socket.id] = name;
//         console.log("TCL: connectedUser", connectedUser);
//         socket.broadcast.emit('connected-users', connectedUser);
//     }
// })
