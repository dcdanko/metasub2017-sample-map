import Props from '../props';
import Geo from './mapOverlayGeoProps';

const props = new Props([
  'map',
  'overlayPane',
  'canvas',
  'svg',
  'svgGroup',
  'svgPadding',
  'vectorLayers',
  'geo',
  'boundShape',
  'coordinateBounds',
  'rasterLayers',
  'selectedLayers',
]);

props.setDefaultValues({
  vectorLayers: [],
  rasterLayers: [],
  selectedLayers: 'all',
  svgPadding: 0,
});

class MapOverlay {
  constructor() {
    props.addTo(this);
  }
  draw({ group, layers, map }) {
    const { geo, overlayPane, svg } = this.props();

    if (layers.length > 0) {
      layers.forEach((d) => {
        d.geo(geo)
          .pane(overlayPane)
          .map(map)
          .refreshMap(this.update.bind(this))
          .svg(svg)
          .group(group);
        this.drawIfSelected(d);
      });
    }
  }
  drawIfSelected(layer) {
    const { selectedLayers } = this.props();
    if (selectedLayers === 'all' || selectedLayers.includes(layer.name())) {
      layer.draw();
    }
  }
  updateSelectedLayers(newSelected) {
    const { selectedLayers, vectorLayers } = this.props();
    // get type (vector/raster) and name, add/remove based on these attributes
    newSelected.forEach((newLayer) => {
      if (!selectedLayers.includes(newLayer)) {
        vectorLayers.filter(d => d.name() === newLayer)[0].draw();
      }
    });
    selectedLayers.forEach((oldLayer) => {
      if (!newSelected.includes(oldLayer)) {
        vectorLayers.filter(d => d.name() === oldLayer)[0].remove();
      }
    });
    this.update();
    this.selectedLayers(newSelected);
  }
  drawBaseLayers() {
    const { map } = this.props();

    this.overlayPane(d3.select(map.getPanes().overlayPane));

    this.svg(this.overlayPane().append('svg').attr('class', 'd3-svg-overlay'));

    this.canvas(this.overlayPane()
      .append('canvas')
      .attr('class', 'leaflet-zoom-hide d3-raster-overlay')
      .style('pointer-events', 'none'));
    this.svgGroup(this.svg().append('g').attr('class', 'leaflet-zoom-hide d3-vector-overlay d3-vector-overlay--path'));
  }
  addVectorLayer(newLayer) {
    this._.vectorLayers.push(newLayer);
    return this;
  }
  addRasterLayer(newLayer) {
    this._.rasterLayers.push(newLayer);
    return this;
  }
  getLayerNames() {
    const { vectorLayers, rasterLayers } = this.props();
    return [...vectorLayers.map(d => d.name()), ...rasterLayers.map(d => d.name())];
  }
  addTo(map) {
    this.map(map);
    this.drawBaseLayers();
    this.geo(new Geo()
      .map(this.map())
      // make this this.canvas()?
      .canvasContext(d3.select('.d3-raster-overlay').node().getContext('2d'))
      .setTransformAndPath());

    const { svgGroup, vectorLayers } = this.props();

    this.draw({ group: svgGroup, layers: vectorLayers, map });
    this.update();
    this.syncWithBasemap();
    return this;
  }
  syncWithBasemap() {
    const { map } = this.props();
    map.on('zoomstart', () => this.hide());
    map.on('zoomend', () => this.show());
    map.on('moveend', () => this.update());
  }
  hide() {
    const { overlayPane } = this.props();
    // changed to 'classed' instead of opacity
    overlayPane.style('opacity', 0);
  }
  show() {
    const { overlayPane } = this.props();
    overlayPane.style('opacity', 1);
  }
  static reposition({ selection, topLeft, bottomRight }) {
    selection
      .attrs({
        width: `${bottomRight[0] - topLeft[0]}px`,
        height: `${bottomRight[1] - topLeft[1]}px`,
      })
      .styles({
        left: `${topLeft[0]}px`,
        top: `${topLeft[1]}px`,
      });
  }
  getBounds() {
    const { boundShape, coordinateBounds, map, svgPadding } = this.props();
    if (boundShape !== undefined) {
      return Geo.vectorPath().bounds(boundShape);
    } else if (coordinateBounds !== undefined) {
      const paddedBounds = coordinateBounds.map((d, i) => {
        if (i === 0) {
          return [d[0] + svgPadding, d[1] - svgPadding];
        }
        return [d[0] - svgPadding, d[1] + svgPadding];
      });
      return [
        [map.latLngToLayerPoint(paddedBounds[0]).x,
          map.latLngToLayerPoint(paddedBounds[0]).y],
        [map.latLngToLayerPoint(paddedBounds[1]).x,
          map.latLngToLayerPoint(paddedBounds[1]).y],
      ];
    }

    return [
      [map.latLngToLayerPoint([90, -180]).x, map.latLngToLayerPoint([90, -180]).y],
      [map.latLngToLayerPoint([-90, 180]).x, map.latLngToLayerPoint([-90, 180]).y],
    ];
  }
  update() {
    const { svgGroup, geo, svg, canvas, map } = this.props();
    // ADD CODE TO PROCESS RASTER LAYERS HERE...
    // const {canvasContext, canvasPath} = geo.properties();
    // this.draw({group: canvas, layers: rasterLayers});
    const bounds = this.getBounds();
    const topLeft = bounds[0];
    const bottomRight = bounds[1];

    MapOverlay.reposition({ selection: svg, topLeft, bottomRight });
    svgGroup.attr('transform', `translate(${-topLeft[0]},${-topLeft[1]})`);

    svgGroup.selectAll('path').attr('d', geo.vectorPath());
    svgGroup.selectAll('circle').attrs({
      cx: d => map.latLngToLayerPoint(d).x,
      cy: d => map.latLngToLayerPoint(d).y,
    });
    svgGroup.selectAll('text').attrs({
      x: d => map.latLngToLayerPoint(d).x + 5,
      y: d => map.latLngToLayerPoint(d).y - 5,
    });

    MapOverlay.reposition({ selection: canvas, topLeft, bottomRight });
    // canvasContext.translate(-topLeft[0], -topLeft[1]);
    // canvasContext.beginPath();
    // canvasPath(data.boroughBoundaries);
    // canvasContext.lineWidth = '1.5';
    // canvasContext.strokeStyle = 'red';
    // canvasContext.fillStyle = 'blue';
    // canvasContext.stroke();
    // canvasContext.fill();
  }
}


export default MapOverlay;
