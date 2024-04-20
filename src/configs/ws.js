import {WebSocket, WebSocketServer} from 'ws';
import http from 'http';
// import {uuidV4} from "mongodb/src/utils.js";

export const server = http.createServer();
const wsServer = new WebSocketServer({server});
const port = 8000;



const clients = {};
const users = {};
let editorContent = null;
let userActivity = [];

// Handle new client connections
wsServer.on("connection", function handleNewConnection(connection) {
    const userId = '';
    console.log("Received a new connection");

    clients[userId] = connection;
    console.log(`${userId} connected.`);

    connection.on("message", (message) =>
        processReceivedMessage(message, userId),
    );
    connection.on("close", () => handleClientDisconnection(userId));
});

// Handle incoming messages from clients
function processReceivedMessage(message, userId) {
    const dataFromClient = JSON.parse(message.toString());
    const json = { type: dataFromClient.type };

    if (dataFromClient.type === 'USER_EVENT') {
        users[userId] = dataFromClient;
        userActivity.push(`${dataFromClient.username} joined to collaborate`);
        json.data = { users, userActivity };
    } else if (dataFromClient.type === 'CONTENT_CHANGE') {
        editorContent = dataFromClient.content;
        json.data = { editorContent, userActivity };
    }

    sendMessageToAllClients(json);
}


// Handle disconnection of a client
function handleClientDisconnection(userId) {
    console.log(`${userId} disconnected.`);
    const json = { type: 'USER_EVENT' };
    const username = users[userId]?.username || userId;
    userActivity.push(`${username} left the editor`);
    json.data = { users, userActivity };
    delete clients[userId];
    delete users[userId];
    sendMessageToAllClients(json);
}

function sendMessageToAllClients(msg) {
    console.log(msg)
}
