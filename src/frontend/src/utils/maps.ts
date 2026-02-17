/**
 * Utility functions for generating external map search URLs
 */

/**
 * Builds a Google Maps search URL for a given query
 * @param query - The search query (place name, destination, etc.)
 * @returns URL-encoded Google Maps search link
 */
export function buildMapsSearchUrl(query: string): string {
  const encodedQuery = encodeURIComponent(query);
  return `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
}

/**
 * Builds a map search URL for a destination
 * @param destination - The destination name
 * @returns URL-encoded map search link
 */
export function buildDestinationMapUrl(destination: string): string {
  return buildMapsSearchUrl(destination);
}

/**
 * Builds a map search URL for a place within a destination
 * @param placeName - The name of the place
 * @param destination - The destination name
 * @returns URL-encoded map search link combining place and destination
 */
export function buildPlaceMapUrl(placeName: string, destination: string): string {
  const query = `${placeName}, ${destination}`;
  return buildMapsSearchUrl(query);
}
