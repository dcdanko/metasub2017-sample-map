const loadScreen = {
  remove() {
    d3.select('#data-loading')
      .style('opacity', 1)
      .transition()
      .duration(500)
      .style('opacity', 0)
      .remove();
  },
};

export default loadScreen;
