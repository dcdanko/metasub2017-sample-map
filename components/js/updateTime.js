const updateTime = function updateTime() {
  const { time, view, components } = this.props();
  const { mapTimeline, citiesLayer, mapReadout } = components;
  mapTimeline
    .time(time)
    .updateTime();

  citiesLayer
    .time(time)
    .updateTime();

  if (view.view === 'world') {
    mapReadout.total(citiesLayer.getGlobalSampleTotal());
  } else if (view.view === 'city') {
    mapReadout.total(citiesLayer.getCitySampleTotal());
  }
  mapReadout.update();
};

export default updateTime;
