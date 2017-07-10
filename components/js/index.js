import Promise from 'promise-polyfill';
import mapOverlay from './visualization-components/mapOverlay/mapOverlay';
import state from './visualization-components/state';
import map from './map';
import citiesLayer from './mapCitiesLayer';
import { summarizeCitiesData, processData } from './dataClean';
import timeline from './timeline';
import menu from './metadataMenu';
import button from './backButton';
import readout from './readout';
import updateView from './updateView';
import updateMetadata from './updateMetadata';
import constants from './constants';

require('../scss/leaflet.css');
require('../scss/layout.scss');
require('../scss/map.scss');
require('../scss/timeline.scss');
require('../scss/backButton.scss');
require('../scss/metadataMenu.scss');
require('../scss/readout.scss');

if (!window.Promise) {
  window.Promise = Promise;
}

const dataPath = 'https://metasub-kobo-wrapper-v2.herokuapp.com/';
const { worldBounds } = constants;
const defaultMetadata = { category: '', type: '' };

const removeLoadText = () => {
  d3.select('#data-loading')
    .style('opacity', 1)
    .transition()
    .duration(500)
    .style('opacity', 0)
    .remove();
};

const syncOverlayWithBasemap = ({ sampleMap, d3Overlay }) => {
  sampleMap.on('zoomstart', () => d3Overlay.hide());
  sampleMap.on('zoomend', () => d3Overlay.show());
  sampleMap.on('moveend', () => d3Overlay.update());
};

const draw = ({ citiesData, metadata }) => {
  removeLoadText();

  const summarizedCitiesData = summarizeCitiesData({
    data: citiesData,
    metadataFilter: defaultMetadata,
  });
  const mapContainer = d3.select('#sample-map-2017');


  const mapState = state()
    .defaultValues({
      data: summarizedCitiesData,
      rawCitiesData: citiesData,
      filteredData: summarizedCitiesData,
      width: mapContainer.node().getBoundingClientRect().width,
      view: { view: 'world', city: '' },
      metadataFilter: defaultMetadata,
      time: summarizedCitiesData.timeExtent[1],
      totalSamples: 0,
      components: {},
    });

  if (mapState.width() >= 992) {
    summarizedCitiesData.radiusScale.range([4, 30]);
  } else {
    summarizedCitiesData.radiusScale.range([4, 20]);
  }

  // extract mapContainer id from mapContainer.node(), send to map module as argument
  const sampleMap = map(worldBounds);

  citiesLayer
    .metadataFilter(defaultMetadata)
    .view(mapState.view())
    .radiusScale(summarizedCitiesData.radiusScale)
    .startTime(summarizedCitiesData.timeExtent[0])
    .time(mapState.time())
    .onCityClick((d) => {
      mapState.update({
        metadataFilter: defaultMetadata,
        view: { view: 'city', city: d.id },
        time: d.timeExtent[1],
      });
    })
    .data(summarizedCitiesData.features);

  const d3Overlay = mapOverlay()
    .coordinateBounds(worldBounds)
    .addVectorLayer(citiesLayer)
    .addTo(sampleMap);

  syncOverlayWithBasemap({ sampleMap, d3Overlay });

  const mapTimeline = timeline()
    .data(summarizedCitiesData.sampleFrequency)
    .drag(newTime => mapState.update({ time: newTime }))
    .xScale(summarizedCitiesData.xScale)
    .yScale(summarizedCitiesData.yScale)
    .width(mapState.width())
    .time(mapState.time())
    .selection(mapContainer)
    .draw();

  const metadataMenu = menu()
    .currentFeatures(summarizedCitiesData.allSamples)
    .selection(mapContainer)
    .metadataFilter(defaultMetadata)
    .data(metadata)
    .time(mapState.time())
    .onClick(newMetadataFilter => mapState.update({
      metadataFilter: newMetadataFilter,
    }))
    .draw();

  const backButton = button()
    .selection(mapContainer)
    .onClick(() => mapState.update({
      metadataFilter: defaultMetadata,
      view: { view: 'world' },
      time: summarizedCitiesData.timeExtent[1],
    }));

  const mapReadout = readout()
    .selection(mapContainer)
    .position({
      bottom: mapTimeline.height(),
    })
    .total(summarizedCitiesData.allSamples.length)
    .metadataFilter(mapState.metadataFilter())
    .time(mapState.time())
    .startTime(summarizedCitiesData.timeExtent[0])
    .location('Worldwide')
    .draw();

  mapState.update({
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

  mapState.registerCallback({
    metadataFilter: updateMetadata,
    width() {
      const { width } = this.props();
      mapTimeline
        .width(width)
        .updateSize();
      mapReadout.position({ bottom: mapTimeline.height() })
        .update();
    },
    time() {
      const { time, view } = this.props();
      mapTimeline
        .time(time)
        .updateTime();

      // metadataMenu
      //   .time(time)
      //   .updateTime();

      citiesLayer
        .time(time)
        .updateTime();

      if (view.view === 'world') {
        mapReadout.total(citiesLayer.getGlobalSampleTotal());
      } else if (view.view === 'city') {
        mapReadout.total(citiesLayer.getCitySampleTotal());
      }
      mapReadout.update();
    },
    view: updateView,
  });

  d3.select(window).on('resize', () => {
    mapState.update({ width: mapContainer.node().getBoundingClientRect().width });
  });
};

d3.json(dataPath, (error, data) => {
  const { citiesData, metadata } = data;
  processData({ citiesData, metadata, callback: draw });
});
