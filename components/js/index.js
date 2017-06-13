require("../scss/map.scss");
require("../scss/timeline.scss");
//Promise polyfill
import Promise from "promise-polyfill"; 
if (!window.Promise) {
  window.Promise = Promise;
}

import mapOverlay from "./visualization-components/mapOverlay/mapOverlay";
import state from "./visualization-components/state";

import loadData from "./dataLoad";
import map from "./map";

import citiesLayer from "./mapCitiesLayer";
import {summarizeCitiesData} from "./dataClean";
import timeline from "./timeline";




loadData
  .then(citiesDataWithSamples => {
    console.log("DATA LOADED");
    draw({citiesData: citiesDataWithSamples});
  })
  .catch(error => {
    console.log(error);
    throw error;
  });

function draw({citiesData}){
  const summarizedCitiesData = summarizeCitiesData(citiesData);

  console.log(summarizedCitiesData);

  const mapContainer = d3.select("#sample-map-2017")
    .styles({
      position: "relative",
      width:"100%",
      height:"80vh",
      background:"black"
  });

  const mapState = state()
    .defaultValues({
      width: mapContainer.node().getBoundingClientRect().width,
      view: {view: "world"},
      time: summarizedCitiesData.minTime
    });



  //extract mapContainer id from mapContainer.node(), send to map module as argument
  const sampleMap = map();

  citiesLayer
    .data(summarizedCitiesData);

  const d3Overlay = mapOverlay()
    .coordinateBounds([[90,-180],[-90,180]])
    //.coordinateBounds([[42.96, -78.94], [42.832, -78.782]])
    .addVectorLayer(citiesLayer)
    .addTo(sampleMap);

  syncOverlayWithBasemap({map:sampleMap, d3Overlay});



  //send summarized line dataset to 
  const mapTimeline = timeline()
    .data(summarizedCitiesData.sampleFrequency)
    .xScale(summarizedCitiesData.xScale)
    .yScale(summarizedCitiesData.yScale)
    .width(mapState.width())
    .time(mapState.time())
    .selection(mapContainer);

  mapTimeline.draw();

  mapState.registerCallback({
    width(){
      const {width} = this.props();
      mapTimeline
        .width(width)
        .updateSize();
    },
    time(){
      const {time} = this.props();
      mapTimeline.time(time)
        .updateTime();
    }
  });

  d3.select(window).on("resize", () => {
    mapState.update({width: mapContainer.node().getBoundingClientRect().width});
  });

}

function syncOverlayWithBasemap({map, d3Overlay}){
  map.on("zoomstart",() => d3Overlay.hide());
  map.on("zoomend",() => d3Overlay.show());
  map.on("moveend", () => d3Overlay.update());
}