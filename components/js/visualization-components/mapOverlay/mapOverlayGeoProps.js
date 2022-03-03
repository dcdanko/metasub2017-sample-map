import Props from '../props';

const props = new Props([
  'map',
  'transform',
  'vectorPath',
  'canvasPath',
  'canvasContext',
]);

class Geo {
  constructor() {
    props.addTo(this);
  }
  setTransformAndPath() {
    const { canvasContext, map } = this.props();

    const projectPoint = function projectPoint(x, y) {
      const point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    };
    this.transform(d3.geoTransform({ point: projectPoint }));
    this.vectorPath(d3.geoPath().projection(this.transform()));
    this.canvasPath(d3.geoPath().projection(this.transform()).context(canvasContext));
    return this;
  }
}


export default Geo;
