import fs from 'fs';

import {createAdjacencyListFromOSMData, dijkstra, distanceInKilometers, } from './utils';
import type {AdjacencyList, MapNode, OverpassAPIResponse} from './types';
import { RouteQuery } from '../../middlewares/parseRouteingQuery';
import { ArrayQueue } from '../../collections/PriorityQueue';

export interface Point {
  lat: number;
  lon: number;
}


interface RoutingResponse {
  distance: number;
  calculationTime: number;
  coordinates: {
    lat: number; 
    lng: number;
  }[];
}

class RoutingService {
  private adjacencyList: AdjacencyList;
  private bounds: [[number,number], [number, number]];

  private static instance: RoutingService | null = null;

  private constructor() {
    const raw = fs.readFileSync('./src/data/geodata.json');
    console.log('file read');
    const overpassQueryResponse = JSON.parse(raw.toString()) as OverpassAPIResponse;
    console.log('parsed JSON');
    this.adjacencyList = createAdjacencyListFromOSMData(overpassQueryResponse);
    this.bounds = [
      [50.618538570096796,23.03936004638672],
      [50.81114153614715,23.463363647460938]
    ]
    console.log('adj matrix created');
  }

  static getInstance(): RoutingService {
    if (!this.instance) {
      this.instance = new RoutingService();
    }

    return this.instance;
  }

  route(query: RouteQuery): RoutingResponse {
    const startNode = this.findNearestNode(query.from);
    const endNode = this.findNearestNode(query.to);
    const queue = new ArrayQueue<MapNode>();
    const startTime = Date.now();
    const {dist, prev} = dijkstra(this.adjacencyList, startNode.id, endNode.id, queue);
    const endTime = Date.now();
  
    const path = [this.adjacencyList[endNode.id]];
    let prevId = prev[endNode.id];
  
    while (prevId) {
      path.unshift(this.adjacencyList[prevId]);
      prevId = prev[prevId];
    }

    const polyline = path.map(point => ({lat: point.lat, lng: point.lon}));

    return {
      calculationTime: endTime - startTime,
      distance: dist[endNode.id],
      coordinates: polyline,
    };
  }

  getBounds() {
    return this.bounds;
  }

  findNearestNode(point: Point): MapNode {
    let mindistance = Number.POSITIVE_INFINITY;
    let nearestNodeId = -1;

    for (const node of Object.values(this.adjacencyList)) {
      const distance = distanceInKilometers(point, node);
      if (distance < mindistance) {
        mindistance = distance;
        nearestNodeId = node.id;
      }
    }

    return this.adjacencyList[nearestNodeId];
  }

  isPointWithinBounds(point: Point): boolean {
    const isLatWithinRange = point.lat > this.bounds[0][0] && point.lat < this.bounds[1][0];
    const isLonWithinRange = point.lon > this.bounds[0][1] && point.lon < this.bounds[1][1];

    return isLatWithinRange && isLonWithinRange;
  }
}

export default RoutingService;
