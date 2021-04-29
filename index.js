const app = require("./app")
const connection = require("./db/connection")

const server = require("http").createServer(app)
const io = require("socket.io")(server)

io.on('connection', socket => {
    console.log('Uzytkownik dolaczyl')

    socket.on('Stwórz albo dołącz', room => {
        console.log('Stwórz lub dołącz do pokoju', room)
        const myRoom = io.sockets.adapter.rooms[room] || { length: 0 }
        const numClients = myRoom.length
        console.log(room, 'ma', numClients, 'klientów')

        if (numClients == 0) {
            socket.join(room)
            socket.emit('stworzono', room)
        } else if (numClients == 1) {
            socket.join(room)
            socket.emit('dolaczono', room)
        } else {
            socket.emit('full', room)
        }
    })

    socket.on('przygotowano', room => {
        socket.broadcast.to(room).emit('przygotowano')
    })

    socket.on('candidate', event => {
        socket.broadcast.to(event.room).emit('candidate', event)
    })

    socket.on('oferta', event => {
        socket.broadcast.to(event.room).emit('oferta', event.sdp)
    })

    socket.on('odpowiedz', event => {
        socket.broadcast.to(event.room).emit('odpowiedz', event.sdp)
    })

})

server.listen(3000, function () {

    connection.connect()
    console.log("Running server on port 3000");

    process.on('SIGTERM', () => {
        connection.end()
    })

});