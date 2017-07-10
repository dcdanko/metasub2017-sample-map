

import constants from './constants';

const { worldBounds } = constants;

const distance = (lat1, lon1, lat2, lon2, unit) => {
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let dist = (Math.sin(radlat1) * Math.sin(radlat2)) +
    (Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta));
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit === 'K') {
    dist *= 1.609344;
  }
  if (unit === 'N') {
    dist *= 0.8684;
  }
  return dist;
};

const getNewBounds = (selectedCity) => {
  const pointsInView = selectedCity.features.filter((d) => {
    const distanceFromCenter = distance(parseFloat(selectedCity.lat),
      parseFloat(selectedCity.lon), d.lat, d.lon);
    return distanceFromCenter < 500;
  });
  const latExtent = d3.extent(pointsInView, d => d.lat);
  const lonExtent = d3.extent(pointsInView, d => d.lon);
  return [[latExtent[1], lonExtent[0]], [latExtent[0], lonExtent[1]]];
};

const updateCityView = function updateCityViews() {
  const { view, data, components } = this.props();
  const { citiesLayer,
    mapReadout,
    mapTimeline,
    d3Overlay,
    sampleMap,
    backButton,
    metadataMenu,
  } = components;
  const selectedCity = data.features.filter(d => d.id === view.city)[0];
  const newBounds = getNewBounds(selectedCity);
  const svgPadding = 0.1;

  mapReadout
      .location(`in ${selectedCity.name_full}`)
      .update();

  mapTimeline
      .data(selectedCity.sampleFrequency)
      .xScale(selectedCity.xScale)
      .yScale(selectedCity.yScale)
      .updateView();

  d3Overlay
      .coordinateBounds(newBounds.map((d, i) => {
        if (i === 0) {
          return [d[0] + svgPadding, d[1] - svgPadding];
        }
        return [d[0] - svgPadding, d[1] + svgPadding];
      }));

  sampleMap.fitBounds(newBounds);

  citiesLayer
      .data(selectedCity)
      .draw();

  backButton.draw();

  metadataMenu.currentFeatures(selectedCity.features);
};

const updateWorldView = function updateWorldView() {
  const { data, components } = this.props();
  const { citiesLayer,
    mapReadout,
    mapTimeline,
    d3Overlay,
    sampleMap,
    backButton,
    metadataMenu,
  } = components;
  mapReadout
      .location('Worldwide')
      .update();

  d3Overlay
      .coordinateBounds(worldBounds)
      .update();

  citiesLayer
      .data(data.features)
      .draw();

  mapTimeline
      .data(data.sampleFrequency)
      .xScale(data.xScale)
      .yScale(data.yScale)
      .updateView();

  sampleMap.fitBounds(worldBounds);
  backButton.remove();
  metadataMenu.currentFeatures(data.allSamples);
};


const updateView = function updateView() {
  const { view, components } = this.props();
  const { citiesLayer, metadataMenu } = components;
  citiesLayer.view(view);
  metadataMenu.updateView();

  if (view.view === 'city') {
    updateCityView.call(this, view);
  } else if (view.view === 'world') {
    updateWorldView.call(this);
  }
};


export default updateView;
