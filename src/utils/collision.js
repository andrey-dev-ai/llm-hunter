import { distanceSq } from './vector.js';

/**
 * Circle-to-circle collision check (uses squared distance — no sqrt)
 */
export function circlesCollide(a, b) {
  const minDist = a.radius + b.radius;
  return distanceSq(a, b) < minDist * minDist;
}
