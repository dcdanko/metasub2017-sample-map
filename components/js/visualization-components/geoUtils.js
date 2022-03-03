export const toRadians = degrees => (Math.PI * degrees) / 180;
export const toDegrees = radians => (radians * 180) / Math.PI;

export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);
  const a = (Math.sin(Δφ / 2) * Math.sin(Δφ / 2)) +
          (Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
};

export const getBearing = (lat1, lon1, lat2, lon2) => {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const λ1 = toRadians(lon1);
  const λ2 = toRadians(lon2);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = (Math.cos(φ1) * Math.sin(φ2)) -
    (Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1));
  const brng = Math.atan2(y, x);
  return brng;
};

export const getPosFromStartDistanceAndBearing = (lat1, lon1, distance, bearing) => {
  const R = 6371e3;
  const φ1 = toRadians(lat1);
  const λ1 = toRadians(lon1);
  const d = distance;
  const φ2 = Math.asin((Math.sin(φ1) * Math.cos(d / R)) +
    (Math.cos(φ1) * Math.sin(d / R) * Math.cos(bearing)));
  const λ2 = λ1 + Math.atan2(Math.sin(bearing) * Math.sin(d / R) * Math.cos(φ1),
    Math.cos(d / R) - (Math.sin(φ1) * Math.sin(φ2)));
  return [toDegrees(φ2), toDegrees(λ2)];
};

export const getPathBetweenTwoPoints = (
  lat1,
  lon1,
  lat2,
  lon2,
  bearing,
  segmentLength = 100000,
) => {
  const totalDistance = getDistance(lat1, lon1, lat2, lon2);
  const numSegments = Math.floor(totalDistance / segmentLength);

  const points = new Array(numSegments)
    .fill(0)
    .map((d, i) => {
      const distance = (i + 1) * segmentLength;
      const point = getPosFromStartDistanceAndBearing(
        lat1,
        lon1,
        distance,
        bearing,
      );
      return [point[1], point[0]];
    });
  return points;
};

export const getPathFromPointDistanceBearing = (
  lat1,
  lon1,
  totalDistance,
  bearing,
  segmentLength = 100000,
) => {
  const numSegments = Math.floor(totalDistance / segmentLength);

  const points = new Array(numSegments)
    .fill(0)
    .map((d, i) => {
      const distance = (i + 1) * segmentLength;
      const point = getPosFromStartDistanceAndBearing(
        lat1,
        lon1,
        distance,
        bearing,
      );
      return [point[1], point[0]];
    });
  return points;
};
