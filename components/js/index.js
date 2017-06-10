//Promise polyfill
import Promise from "promise-polyfill"; 
if (!window.Promise) {
  window.Promise = Promise;
}

require("../scss/map.scss");

import map from "./map";
import mapOverlay from "./visualization-components/mapOverlay/mapOverlay";
import citiesLayer from "./mapCitiesLayer";
import {processCitiesData, addSampleDataToCities, summarizeCitiesData} from "./data";


new Promise((resolve, reject) => {
  d3.csv("data/cities.csv", (error, data) => {
    if (error){
      reject(error);
    }else{
      resolve(data);
    }
  });
}).then(rawCityData => {
    loadSampleData({citiesData: processCitiesData(rawCityData)});
  })
  .catch(error => {console.log(error);});

const getSampleDataPromise = cityPath => new Promise((resolve, reject) => {
  d3.json(cityPath, (error, data) => {
    if (error){
      reject(error);
    }else{
      resolve(data);
    }
  });
});

function loadSampleData({citiesData}){
  
  const sampleDataPromises = citiesData
    .map(city => {
      if (city.live){
        return getSampleDataPromise(city.path);
      }else{
        return [];
      }
    });

  Promise.all(sampleDataPromises).then(samplesData => {
    const citiesDataWithSamples = addSampleDataToCities({citiesData, samplesData});
    draw({citiesData: citiesDataWithSamples});
  })
  .catch(error => {console.log(error);});
}

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