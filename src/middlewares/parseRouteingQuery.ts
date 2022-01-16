import {RequestHandler} from 'express';

interface GeoPoint {
  lat: number;
  lon: number;
}

enum Algorithm {
  Dijkstra = 'DIJKSTRA',
}

enum Implementation {
  Plain = 'PLAIN',
  BinaryHeap = 'BINARY_HEAP',
  FibonacciHeap = 'FIBONACCI_HEAP',
}



export interface RouteQuery {
  from: GeoPoint;
  to: GeoPoint;
  algorithm: Algorithm;
  implementation: Implementation;
}

interface Dict {
  [key: string]: string;
}

export const parseRoutingQuery: RequestHandler = (req, res, next) => {
  const rawQuery = req.query as Dict;

  const fromString = rawQuery.from;
  const toString = rawQuery.to;

  const validateCoordinates = /^\d+\.\d+,\d+\.\d+$/;

  const isFromValid = validateCoordinates.test(fromString);
  if (!isFromValid) {
    next(new Error('Invalid from parameter format!'));
    return;
  }

  const isToValid = validateCoordinates.test(toString);
  if (!isToValid) {
    next(new Error('Invalid to parameter format!'));
    return;
  }

  if (!isImplementationKey(rawQuery.implementation)) {
    next(new Error('Unsupported implementation parameter'));
    return;
  }

  const [fromLat, fromLng] = fromString.split(',').map(v => parseFloat(v));
  const [toLat, toLng] = toString.split(',').map(v => parseFloat(v));
  const implementation = Implementation[rawQuery.implementation];

  req.body = {
    from: {
      lat: fromLat,
      lon: fromLng,
    },
    to: {
      lat: toLat,
      lon: toLng,
    },
    algorithm: Algorithm.Dijkstra,
    implementation,
  };

  next();
}

function isImplementationKey(param: string): param is keyof typeof Implementation {
  return Object.keys(Implementation).includes(param);
}