import {WebSocketServer} from 'ws';
import http from 'http';
import app from './../../app.js';
import {saveMessage} from "../controllers/DialogController.js";


export const Events = {
    USER_EVENT: 'USER_EVENT',
    LOGOUT_EVENT: 'LOGOUT_EVENT',
    AUTH_EVENT: 'AUTH_EVENT',
    FOLLOW_EVENT: 'FOLLOW_EVENT',
    FRIEND_EVENT: 'FRIEND_EVENT',
    MSG_EVENT: 'MSG_EVENT'
};

export const EventsType = {
    FOLLOW: 'FOLLOW',
    FRIEND: 'FRIEND',
    MSG: 'MSG'
};

export const server = http.createServer();
const wsServer = new WebSocketServer({server, perMessageDeflate: false});

server.on('request', app)

const clients = {};
let userActivity = [];

// Handle new client connections
wsServer.on('connection', (connection, req) => {
    const regex = new RegExp('[0-9a-f]{24}');
    const res = regex.exec(req.url);

    const userId = res ? res[0] : null;
    if (userId) {
        clients[userId] = connection;
        connection.on('message', (message) => processReceivedMessage(message));
        connection.on('close', (message) => handleClientDisconnection(message, userId));
    }

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
            userActivity = userActivity.filter(it => it !== dataFromClient.id).filter(it => !!it);
            json.data = userActivity;
            break;
        case Events.MSG_EVENT:

            saveMessage(dataFromClient.msg)
                .then((data) => {
                    sendMsg(dataFromClient.msg.to, dataFromClient.type, data,
                        {
                            fromId: dataFromClient.msg.from,
                            from: `${data.from.firstName} ${data.from.secondName}`,
                            msg: `Пользователь %s отправил Вам сообщение!`,
                            type: EventsType.MSG
                        });
                    sendMsg(dataFromClient.msg.from, dataFromClient.type, data, null)
                });

            return;
        default:
            json.data = userActivity;
            break;
    }

    sendMessageToAllClients(json);
}

// Handle disconnection of a client
function handleClientDisconnection(message, userId) {
    const dataFromClient = JSON.parse(message.toString());
    const json = {type: Events.LOGOUT_EVENT};
    userActivity = userActivity.filter(it => it !== dataFromClient.id);
    json.data = userActivity;

    delete clients[userId];

    sendMessageToAllClients(json);
}

function sendMessageToAllClients(msg) {
    userActivity.forEach(user => {
        if (clients[user]) {
            clients[user].send(JSON.stringify(msg));
        }
    })
}

export function sendMsg(clientId, type, data, msg) {
    if (clients[clientId]) {
        clients[clientId].send(JSON.stringify({type: type, data: data, msg: msg}));
    }
}
