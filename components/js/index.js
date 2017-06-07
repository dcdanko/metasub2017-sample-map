import map from "./map";
import mapOverlay from "./visualization-components/mapOverlay/mapOverlay";

d3.queue()
  .defer(d3.json, "http://metasub-kobo-wrapper.herokuapp.com/")
  .defer(d3.csv, "data/cities.csv")
  .defer(d3.json, "data/boundShape.geojson")
  .await((error, rawSampleData, cityLocationsAndNames, boundShape) => {
    if (error) throw error;
    draw({rawSampleData, cityLocationsAndNames, boundShape});
});

function draw({rawSampleData, cityLocationsAndNames, boundShape}){

  console.log("cities", cityLocationsAndNames);
  console.log("samples", rawSampleData.map(d => d._geolocation));
  console.log(boundShape);


  d3.select("#sample-map-2017")
    .styles({
      position: "relative",
      width:"100%",
      height:"80vh",
      background:"grey"
  });

  const sampleMap = map();

  const d3Overlay = mapOverlay()
    .boundShape(boundShape)
    .addTo(sampleMap);

  syncOverlayWithBasemap({map:sampleMap, d3Overlay});

}

function syncOverlayWithBasemap({map, d3Overlay}){
  map.on("zoomstart",() => d3Overlay.hide());
  map.on("zoomend",() => d3Overlay.show());
  map.on("moveend", () => d3Overlay.update());
}