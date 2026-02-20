import { distance } from './vector.js';

/**
 * Circle-to-circle collision check
 */
export function circlesCollide(a, b) {
  return distance(a, b) < a.radius + b.radius;
}
