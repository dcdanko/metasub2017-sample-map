require("../scss/map.scss");

import map from "./map";
import mapOverlay from "./visualization-components/mapOverlay/mapOverlay";
import citiesLayer from "./mapCitiesLayer";
import {processCitiesData, processSampleData,summarizeCitiesData} from "./data";


d3.queue()
  .defer(d3.csv, "data/cities.csv")
  .defer(d3.json, "data/boundShape.geojson")
  .await((error, rawCityData, boundShape) => {
    if (error) throw error;
    const citiesData = processCitiesData(rawCityData);
    loadSampleData({citiesData, boundShape});
});

function loadSampleData({citiesData, boundShape}){
  let position = 0;
  const totalCities = citiesData.length;
  const advancePositionOrDraw = () => {
    position++;
    if (position === totalCities){
      draw({citiesData, boundShape});
    }
  };
  const getSampleData = city => {
    d3.json(city.path, citySamples => {
        city.samples = processSampleData(citySamples);
        city.sampleCount = city.samples.length;
        city.minTime = d3.min(city.samples, sample => sample.time);
        city.maxTime = d3.max(city.samples, sample => sample.time);
        advancePositionOrDraw();
      });
  };
  citiesData.forEach(city => {
    if (city.live){
      getSampleData(city);
    }else{
      advancePositionOrDraw();
    }
  });
}


function draw({citiesData}){

  const summarizedCitiesData = summarizeCitiesData(citiesData);

  console.log("summary",summarizedCitiesData);

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
    .addVectorLayer(citiesLayer)
    .addTo(sampleMap);

  syncOverlayWithBasemap({map:sampleMap, d3Overlay});

}

function syncOverlayWithBasemap({map, d3Overlay}){
  map.on("zoomstart",() => d3Overlay.hide());
  map.on("zoomend",() => d3Overlay.show());
  map.on("moveend", () => d3Overlay.update());
}