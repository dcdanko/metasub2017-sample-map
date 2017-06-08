import map from "./map";
import mapOverlay from "./visualization-components/mapOverlay/mapOverlay";
import citiesLayer from "./mapCitiesLayer";
import {processCitiesData, summarizeCitiesData} from "./data";


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
  citiesData.forEach(city => {
    if (city.live){
      d3.json(city.path, citySamples => {
        city.samples = citySamples;
        city.sampleCount = citySamples.length;
        position++;
        if (position === citiesData.length){
          draw({citiesData, boundShape});
        }
      });
    }else{
      position++;
      if (position === citiesData.length){
        draw({citiesData, boundShape});
      }
    }
  });
}

function draw({citiesData, boundShape}){

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
    .data(citiesData);

  const d3Overlay = mapOverlay()
    .boundShape(boundShape)
    .addVectorLayer(citiesLayer)
    .addTo(sampleMap);

  syncOverlayWithBasemap({map:sampleMap, d3Overlay});

}

function syncOverlayWithBasemap({map, d3Overlay}){
  map.on("zoomstart",() => d3Overlay.hide());
  map.on("zoomend",() => d3Overlay.show());
  map.on("moveend", () => d3Overlay.update());
}