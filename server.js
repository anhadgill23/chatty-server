// server.js

const express = require('express');
const WebSocket = require('ws');
const SocketServer = WebSocket.Server;
const uuidv1 = require('uuid/v1');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {

    ws.on('message', function incomingMessage(event) {
        let parsedData = JSON.parse(event);
        if (parsedData){
            parsedData.id = uuidv1();
            wss.broadcast(JSON.stringify(parsedData));
            console.log("Data broadcasted");
        } else {
            console.log('There is no data to be parsed')
        }
    });

    wss.broadcast = function broadcast(data) {
        wss.clients.forEach(function each (client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        })
    }

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => console.log('Client disconnected'));
});