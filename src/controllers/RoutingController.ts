import { Request, Response, NextFunction } from "express";

import Controller from "../core/Controller";
import RoutingService from '../services/RoutingService';

import {parseRoutingQuery} from '../middlewares/parseRouteingQuery';
import { RouteQuery } from "../middlewares/parseRouteingQuery";

class RoutingController extends Controller {
  private routingService = RoutingService.getInstance();

  constructor() {
    super('route');
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this.router.get('/', parseRoutingQuery, this.calculateRoute);
    this.router.get('/bounds', this.getSupportedMapBounds);
  }

  private calculateRoute = async (req: Request<any, any, RouteQuery>, res: Response, next: NextFunction) => {
    const query = req.body;
  
    try {
      const isStartPointWithinBounds = this.routingService.isPointWithinBounds(query.from);
      if (!isStartPointWithinBounds) {
        throw new Error('Start point outside supported bounds');
      }
      const isDestPointWithinBounds = this.routingService.isPointWithinBounds(query.to);
      if (!isDestPointWithinBounds) {
        throw new Error('End point outside supported bounds');
      }

      const route = this.routingService.route(query);
      res.json(route);
    } catch(err) {
      res.status(400).json({message: (err as any).message})
    }
  }

  private getSupportedMapBounds = async (req: Request, res: Response, next: NextFunction) => {
    res.json({
      bounds: this.routingService.getBounds(),
    });
  }
}

export default RoutingController;
