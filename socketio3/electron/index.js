//Poojanbhai Niteshbhai Patel
//UTA ID : 1001827807

const clientSocket = io('http://localhost:6363');

//These are constant DOM Elements
const form = document.querySelector('#chat-form');
const privateForm = document.querySelector('#private-chat');
const input = document.querySelector('#public-input');
const privateInput = document.querySelector('#private-input');
const privateInputMsg = document.querySelector('#private-msg-input');
const messageList = document.querySelector('.watch-box');

let mySocketId = '';
let MyName = prompt('What is your name?'); // This will prompt user to enter the name
let connectedClients = [];

while (!MyName) {
    MyName = prompt('What is your name?');
}

// DOM Manipulation Methods or Display DOM function
function appendConnectedUsers(user) {
    let node = document.createElement('LI'); //This will Create a <li> node
    let textnode = document.createTextNode(user); //This will Create a text node
    node.appendChild(textnode); //This will Append the text to <li>
    document.querySelector('.connected-users').appendChild(node); //This will Append <li> to <ul> with id="myList"
}

//This is for private message
function appendMsg({ name, msg }) {
    let node = document.createElement('p'); //This will Create a <li> node
    let textnode = document.createTextNode(
        `${name === MyName ? 'You' : name} - ${msg}`
    ); //This will Create a text node
    node.appendChild(textnode); //This will Append the text to <li>
    document.querySelector('.watch-box').appendChild(node); // This will Append <li> to <ul> with id="myList"
}

//This is for private message
function appendPrivateMsg({ name, msg, from }) {
    let node = document.createElement('p'); // This will Create a <li> node
    let textnode = document.createTextNode(
        `From ${from} ==> ${msg}`
    ); //This will Create a text node
    node.appendChild(textnode); //This will Append the text to <li>
    document.querySelector('.private-box').appendChild(node); // This will Append <li> to <ul> with id="myList"
}

// logout function whic h ask for confirmation whether you wann online or wann exit
function logout() {
    let r = confirm('Click the OK button now!');
    if (r == true) {
        window.close();
    } else {
        alert(`You've cancled & still online!`);
    }
}
//It will not run until you take name from user
clientSocket.on('connect', () => {
    clientSocket.on('CLIENT_JOINED', socketId => {
        clientSocket.emit('CLIENT_JOINED', { name: MyName, socketId });
    });
    clientSocket.on('send-chat-msg', client => {
        appendMsg(client);
        privateInputMsg.value = '';
    });
    clientSocket.on('send-private-msg', obj => {
        appendPrivateMsg(obj)
    });
    clientSocket.on('room-joined', clients => {
        let myLIs = document.querySelector('.connected-users');
        myLIs.querySelectorAll('li').forEach(function (item) {
            item.remove();
        });
        connectedClients = clients;
        clients.forEach(client => {
            if (client.name !== MyName) {
                appendConnectedUsers(client.name);
            } else {
                appendConnectedUsers(`You: ${MyName}`);
            }
        });
    });

    clientSocket.on('room-leave', client => {
        if (client) {
            let myLIs = document.querySelector('.connected-users');
            myLIs.querySelectorAll('li').forEach(function (item) {
                if (item.innerHTML === client.name) item.remove();
            });
            connectedClients = connectedClients.filter(
                ele => ele.name !== client.name
            );
        }
    });
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
    //This will send message to server for specific room
    if (input.value) {
        clientSocket.emit('send-chat-msg', { name: MyName, msg: input.value });
    }
    input.value = '';
});

privateForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let privateInputValues = privateInput.value && privateInput.value.trim().split(',').map(ele => ele.trim())
    let sendTOcClients = [];
    privateInputValues.map((ele) => {
        connectedClients.map((clt) => {
            if (clt.name === ele) {
                clt.msg = privateInputMsg.value;
                clt.from = MyName;
                sendTOcClients.push(clt);
            }
        })
    })
    if (privateInputValues.length > 0) {
        sendTOcClients.forEach((ele) => {
            clientSocket.emit('send-private-msg', ele);
        })
    }
    privateInput.value = '';
    privateInputMsg.value = '';
});
