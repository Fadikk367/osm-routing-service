import Server from './core/Server';
import Controller from 'core/Controller';
import RoutingController from './controllers/RoutingController';

const PORT = process.env.PORT || 8000;

const controllers: Controller[] = [
  new RoutingController(),
]

const server = new Server(controllers, PORT);

server.listen();
