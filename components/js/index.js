import map from "./map";
import mapOverlay from "./visualization-components/mapOverlay/mapOverlay";
import citiesLayer from "./mapCitiesLayer";
import {processCitiesData} from "./data";


d3.queue()
  // .defer(d3.json, "http://metasub-kobo-wrapper.herokuapp.com/102154")
  // .defer(d3.json, "http://metasub-kobo-wrapper.herokuapp.com/104862")
  .defer(d3.csv, "data/cities.csv")
  .defer(d3.json, "data/boundShape.geojson")
  .await((error, rawCityData, boundShape) => {
    if (error) throw error;
    const cityData = processCitiesData(rawCityData);
    loadSampleData({cityData, boundShape});
    //console.log(cityData);
    //draw({cityLocationsAndNames, boundShape});
});

function loadSampleData({cityData, boundShape}){
  let position = 0;
  cityData.forEach(city => {
    if (city.live){
      d3.json(city.path, citySamples => {
        city.samples = citySamples;
        position++;
        if (position === cityData.length){
          draw({cityData, boundShape});
        }
      });
    }else{
      position++;
      if (position === cityData.length){
        draw({cityData, boundShape});
      }
    }
  });
}

function draw({cityData, boundShape}){



  d3.select("#sample-map-2017")
    .styles({
      position: "relative",
      width:"100%",
      height:"80vh",
      background:"grey"
  });

  const sampleMap = map();



  citiesLayer
    .data(cityData);

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