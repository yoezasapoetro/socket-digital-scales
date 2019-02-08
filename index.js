const config = require('./config')(process.env.NODE_ENV);
const http = require(`http`).createServer();
const io = require(`socket.io`)(http);
const serverPort = config('socket_port');

let devices = [];
let users = [];

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        devices = devices.splice(devices.indexOf(socket.id), 1);

        io.emit('console_list', devices);
    });

    socket.on('console_connect', ({ deviceId, deviceName }) => {
        devices.push({
            socketId: socket.id,
            deviceId,
            deviceName
        });
        io.emit('console_list', devices);
    });

    socket.on('console_transmit_data', (data) => {
        io.to(`${data.consoleSocketId}`).emit('console_request_data', data);
    });

    socket.on('console_response_data', ({ userSocketId, data }) => {
        io.to(`${userSocketId}`).emit('transmit_data', data);
    });

    socket.on('console_list', (data) => {
        io.emit('console_list', devices);
    });
});

http.listen(serverPort, () => {
    console.log(`Listening on *:${serverPort}`);
});