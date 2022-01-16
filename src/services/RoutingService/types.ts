export interface LatLon {
  lat: number;
  lon: number;
}

export interface OSMTags {
  highway?: string;
  name?: string;
  surface?: string;
  oneway?: string;
}

export interface OSMNode {
  type: 'node',
  id: number;
  lat: number;
  lon: number;
}

export interface MapNode extends OSMNode {
  neighbours: OSMNode[];
}

export interface MapWay extends Omit<OSMWay, 'nodes'> {
  nodes: OSMNode[];
  length: number;
}

export interface OSMNodesMap {
  [key: string]: OSMNode;
}

export interface OSMWaysMap {
  [key: string]: OSMWay;
}

export interface AdjacencyList {
  [key: string]: MapNode;
}

export interface MapWaysMap {
  [key: string]: MapWay;
}

export interface OSMWay {
  type: 'way',
  id: number,
  nodes: number[],
  tags: OSMTags;
  length?: number;
}

export interface OverpassAPIResponse {
  elements: (OSMNode | OSMWay)[];
}