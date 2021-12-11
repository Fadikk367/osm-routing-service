import Server from './core/Server';

const PORT = process.env.PORT || 8000;

const server = new Server([], PORT);

server.listen();
