const mapContainer = d3.select('#sample-map');

mapContainer.getWidth = function getWidth() {
  return this.node().getBoundingClientRect().width;
};

export default mapContainer;
