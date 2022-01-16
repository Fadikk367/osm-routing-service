import { PriorityQueue } from 'collections/PriorityQueue/types';
import { AdjacencyList, OSMWaysMap, OSMNode, OSMWay, OSMNodesMap, LatLon, MapNode, OverpassAPIResponse } from './types';

const LATITUDE_DEGREE_IN_KILOMETERS = 110.574;
const LONGITUDE_DEGREE_IN_KILOMETERS = 111.320;

export function createAdjacencyListFromOSMData(overpassResponse: OverpassAPIResponse) {
  const { nodes, ways } = splitElementsByType(overpassResponse.elements);

  const adjacencyList: AdjacencyList = {};
  
  Object.values(nodes).forEach(node =>{
    adjacencyList[node.id] = {
      ...node,
      neighbours: findNodeNeighbours(node, ways, nodes),
    }
  });

  return adjacencyList;
}


function findNodeNeighbours(node: OSMNode, ways: OSMWaysMap, nodes: OSMNodesMap): OSMNode[] {
  const neighbours = new Set<OSMNode>();

  for (const way of Object.values(ways)) {
    const nodesCount = way.nodes.length;
    const nodeIndex = way.nodes.findIndex(nodeId => nodeId === node.id);
    
    switch(nodeIndex) {
      case -1:
        break;
      case 0:
        neighbours.add(nodes[way.nodes[nodeIndex + 1]]);
        break;
      case nodesCount - 1:
        neighbours.add(nodes[way.nodes[nodeIndex - 1]]);
        break;
      default:
        neighbours.add(nodes[way.nodes[nodeIndex - 1]]);
        neighbours.add(nodes[way.nodes[nodeIndex + 1]]);
        break;
    }
  }

  return Array.from(neighbours);
}

function splitElementsByType(elements: (OSMNode | OSMWay)[]) {
  const nodes: OSMNodesMap = {};
  const ways: OSMWaysMap = {};

  for (let i = 0; i < elements.length; i++) {
    const candidate = elements[i];
    if (candidate.type == 'node') {
      nodes[candidate.id] = candidate;
    } else if (candidate.type == 'way') {
      ways[candidate.id] = candidate;
    }
  }

  return { nodes, ways };
}


export function distanceInKilometers(pointA: LatLon, pointB: LatLon) {
  const latDifference = pointB.lat - pointA.lat;
  const lonDifference = pointB.lon - pointA.lon;

  const horizonalDistance = latDifference * LATITUDE_DEGREE_IN_KILOMETERS;
  const verticalDistance = lonDifference * LONGITUDE_DEGREE_IN_KILOMETERS * Math.cos(radians(latDifference));

  return Math.sqrt(
    Math.pow(horizonalDistance, 2) + 
    Math.pow(verticalDistance, 2)
  );
}

function radians(degrees: number) {
  return degrees * Math.PI / 180;
}

export function dijkstra(graph: AdjacencyList, sourceId: number, targetId: number, queue: PriorityQueue<MapNode>) {
  const dist: {[key: string]: number} = {};
  const prev: {[key: string]: number | null} = {};
  dist[sourceId] = 0;

  for (const node of Object.values(graph)) {
    if (node.id !== sourceId) {
      dist[node.id] = Number.POSITIVE_INFINITY;
      prev[node.id] = null;
    }

    queue.add(node, dist[node.id]);
  }
  
  while (queue.isNotEmpty()) {
    const [nearest, _] = queue.pop();

    if (nearest.id === targetId) {
      return {prev, dist};
    }

    for (const neighbour of graph[nearest.id].neighbours) {
      const distance = dist[nearest.id] + distanceInKilometers(nearest, neighbour);
      if (distance < dist[neighbour.id]) {
        dist[neighbour.id] = distance;
        prev[neighbour.id] = nearest.id;
        queue.decreasePriority(neighbour as MapNode, distance);
      }
    }
  }

  return {dist, prev};
}

function popNearestNode(arr: [MapNode, number][]) {
  if (arr.length === 1) {
    return arr.splice(0, 1)[0];
  }

  let minIndex = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i][1] < arr[minIndex][1]) {
      minIndex = i;
    }
  }

  return arr.splice(minIndex, 1)[0];
}

function decreaseDistance(arr: [MapNode, number][], node: OSMNode, newDistance: number) {
  const v = arr.find(([e, _]) => e.id === node.id);
  if (v) {
    v[1] = newDistance;
  }
}