/**
 * Clamp a value between min and max.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

/**
 * Round a number to the nearest multiple of `step`.
 */
export function snapToNearest(value, step) {
  return Math.round(value / step) * step
}

/**
 * Deep-clone a plain array or object (JSON-safe).
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}
