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

wss.on('connection', (ws) => {

    wss.broadcast = function broadcast(data) {
        wss.clients.forEach(function each (client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        })
    }

    const broadcastUserCount = () => {
        let userCount = {
            type: 'userCount',
            numOfUsers: wss.clients.size
        }
        console.log('userCount: ', userCount);
        wss.broadcast(JSON.stringify(userCount));
    }
    broadcastUserCount();

    ws.on('message', function incomingMessage(event) {
        const ID = uuidv1();
        let parsedData = JSON.parse(event);
        if (parsedData){

            if (parsedData.type === 'postMessage') {
                parsedData.type = 'incomingMessage'
                parsedData.id = ID;
                wss.broadcast(JSON.stringify(parsedData));
                console.log("Data broadcasted");
            }
            else if (parsedData.type === 'postNotification') {
                parsedData.type = 'incomingNotification'
                parsedData.id = ID;
                wss.broadcast(JSON.stringify(parsedData));
                console.log("Data broadcasted");
            }
            else {
                console.log('Data type is neither postMessage nor postNotification');
            }
        } else {
            console.log('There is no data to be parsed')
        }

    });


  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
      broadcastUserCount();
      console.log('Client disconnected')
    }
  );
});