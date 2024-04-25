import {WebSocketServer} from 'ws';
import http from 'http';
import {v4} from 'uuid';


export const server = http.createServer();
const wsServer = new WebSocketServer({server});

const Events = {
    USER_EVENT: 'USER_EVENT',
    LOGOUT_EVENT: 'LOGOUT_EVENT',
    AUTH_EVENT: 'AUTH_EVENT'
};

const clients = {};
let userActivity = [];

// Handle new client connections
wsServer.on('connection', function handleNewConnection(connection) {
    const userId = v4();
    clients[userId] = connection;

    connection.on('message', (message) => processReceivedMessage(message));
    connection.on('close', (message) => handleClientDisconnection(message, userId));
});

// Handle incoming messages from clients
function processReceivedMessage(message) {
    const dataFromClient = JSON.parse(message.toString());
    const json = {type: dataFromClient.type};

    switch (dataFromClient.type) {
        case Events.USER_EVENT:
            if (!userActivity.includes(dataFromClient.id)) {
                userActivity.push(dataFromClient.id);
            }
            json.data = userActivity;
            break;
        case Events.AUTH_EVENT:
            if (!userActivity.includes(dataFromClient.id)) {
                userActivity.push(dataFromClient.id);
            }
            json.data = userActivity;
            break;
        case Events.LOGOUT_EVENT:
            userActivity = userActivity.filter(it => it !== dataFromClient.id);
            json.data = userActivity;
            break;
        default:
            break;
    }

    sendMessageToAllClients(json);
}

// Handle disconnection of a client
function handleClientDisconnection(message, userId) {
    const dataFromClient = JSON.parse(message.toString());
    const json = {type: Events.LOGOUT_EVENT};
    userActivity = userActivity.filter(it => it !== dataFromClient.id);
    console.log('Events.LOGOUT_EVENT' + userActivity)
    json.data = userActivity;

    delete clients[userId];

    sendMessageToAllClients(json);
}

function sendMessageToAllClients(msg) {
    wsServer.clients.forEach(function (client) {
        client.send(JSON.stringify(msg));
    });
}
