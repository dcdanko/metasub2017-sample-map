//Promise polyfill
import Promise from "promise-polyfill"; 
if (!window.Promise) {
  window.Promise = Promise;
}

require("../scss/map.scss");

import loadData from "./dataLoad";
import map from "./map";
import mapOverlay from "./visualization-components/mapOverlay/mapOverlay";
import citiesLayer from "./mapCitiesLayer";
import {summarizeCitiesData} from "./dataClean";


loadData.then(citiesDataWithSamples => {
      draw({citiesData: citiesDataWithSamples});
    })
    .catch(error => {console.log(error);});

function draw({citiesData}){

  const summarizedCitiesData = summarizeCitiesData(citiesData);

  d3.select("#sample-map-2017")
    .styles({
      position: "relative",
      width:"100%",
      height:"80vh",
      background:"grey"
  });

  const sampleMap = map();

  citiesLayer
    .data(summarizedCitiesData);

  const d3Overlay = mapOverlay()
    //.boundShape(boundShape)
    .coordinateBounds([[90,-180],[-90,180]])
    //.coordinateBounds([[42.96, -78.94], [42.832, -78.782]])
    .addVectorLayer(citiesLayer)
    .addTo(sampleMap);

  syncOverlayWithBasemap({map:sampleMap, d3Overlay});

}

function syncOverlayWithBasemap({map, d3Overlay}){
  map.on("zoomstart",() => d3Overlay.hide());
  map.on("zoomend",() => d3Overlay.show());
  map.on("moveend", () => d3Overlay.update());
}