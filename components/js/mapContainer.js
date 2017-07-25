const mapContainer = d3.select('#sample-map-2017');

mapContainer.getWidth = function getWidth() {
  return this.node().getBoundingClientRect().width;
};

export default mapContainer;
