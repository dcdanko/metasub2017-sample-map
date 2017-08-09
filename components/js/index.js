import MapOverlay from './visualization-components/mapOverlay/mapOverlay';
import State from './visualization-components/state';
import Button from './visualization-components/button';
import Readout from './readout';
import Timeline from './timeline';
import MetadataMenu from './metadataMenu';
import Map from './map';
import citiesLayer from './mapCitiesLayer';
import mapContainer from './mapContainer';
import constants from './constants';
import loadScreen from './loadScreen';
import updateView from './updateView';
import updateMetadata from './updateMetadata';
import updateWidth from './updateWidth';
import updateTime from './updateTime';
import { summarizeCitiesData, processData } from './dataClean';


require('../scss/leaflet.css');
require('../scss/layout.scss');
require('../scss/map.scss');
require('../scss/timeline.scss');
require('../scss/backButton.scss');
require('../scss/metadataMenu.scss');
require('../scss/readout.scss');

const { dataPath } = constants;

const draw = ({ citiesData, metadata }) => {
  const { worldBounds, defaultMetadata } = constants;

  loadScreen.remove();

  const summarizedCitiesData = summarizeCitiesData({
    data: citiesData,
    metadataFilter: defaultMetadata,
    width: mapContainer.getWidth(),
  });

  const state = new State({
    data: summarizedCitiesData,
    rawCitiesData: citiesData,
    width: mapContainer.getWidth(),
    view: { view: 'world', city: '' },
    metadataFilter: defaultMetadata,
    time: summarizedCitiesData.timeExtent[1],
    totalSamples: 0,
    components: {},
  });

  const sampleMap = Map({ bounds: worldBounds });

  citiesLayer
    .metadataFilter(defaultMetadata)
    .view(state.view())
    .radiusScale(summarizedCitiesData.radiusScale)
    .startTime(summarizedCitiesData.timeExtent[0])
    .time(state.time())
    .onCityClick((d) => {
      state.update({
        metadataFilter: defaultMetadata,
        view: { view: 'city', city: d.id },
        time: d.timeExtent[1],
      });
    })
    .data(summarizedCitiesData.features);

  const d3Overlay = new MapOverlay()
    .coordinateBounds(worldBounds)
    .addVectorLayer(citiesLayer)
    .addTo(sampleMap);


  const mapTimeline = new Timeline()
    .data(summarizedCitiesData.sampleFrequency)
    .drag(newTime => state.update({ time: newTime }))
    .xScale(summarizedCitiesData.xScale)
    .yScale(summarizedCitiesData.yScale)
    .width(state.width())
    .time(state.time())
    .selection(mapContainer)
    .draw();

  const metadataMenu = new MetadataMenu()
    .currentFeatures(summarizedCitiesData.allSamples)
    .selection(mapContainer)
    .metadataFilter(defaultMetadata)
    .data(metadata)
    .time(state.time())
    .onClick(newMetadataFilter => state.update({
      metadataFilter: newMetadataFilter,
    }))
    .draw();

  const backButton = new Button()
    .selection(mapContainer)
    .className('back-button')
    .text('Back')
    .onClick(() => state.update({
      metadataFilter: defaultMetadata,
      view: { view: 'world' },
      time: summarizedCitiesData.timeExtent[1],
    }));

  const mapReadout = new Readout()
    .selection(mapContainer)
    .position({
      bottom: mapTimeline.height(),
    })
    .total(summarizedCitiesData.allSamples.length)
    .metadataFilter(state.metadataFilter())
    .time(state.time())
    .startTime(summarizedCitiesData.timeExtent[0])
    .location('Worldwide')
    .draw();

  state.update({
    components: {
      citiesLayer,
      mapReadout,
      mapTimeline,
      d3Overlay,
      sampleMap,
      backButton,
      metadataMenu,
    },
  });

  state.registerCallback({
    metadataFilter: updateMetadata,
    width: updateWidth,
    time: updateTime,
    view: updateView,
  });

  d3.select(window).on('resize', () => {
    state.update({ width: mapContainer.getWidth() });
  });
};

// load sample data, metadata fields
d3.json(dataPath, (error, data) => {
  const { citiesData, metadata } = data;
  processData({ citiesData, metadata, callback: draw });
});
