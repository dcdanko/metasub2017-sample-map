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



  const mapContainer = d3.select("#sample-map-2017")
    .styles({
      position: "relative",
      // width:"100%",
      // height:"80vh",
      // background:"black"
  });

  d3.select("#map")
    .styles({
      width:"100%",
      height:"80vh",
      background:"black"
    })

  const mapState = state()
    .defaultValues({
      width: mapContainer.node().getBoundingClientRect().width,
      view: {view: "world"},
      time: summarizedCitiesData.timeExtent[1]
    });



  //extract mapContainer id from mapContainer.node(), send to map module as argument
  const sampleMap = map();

  citiesLayer
    .view(mapState.view())
    .radiusScale(summarizedCitiesData.radiusScale)
    .onCityClick(d => {
      mapState.update({view:{view: "city", city: d.id}});
    })
    .data(summarizedCitiesData.features);



  const d3Overlay = mapOverlay()
    .coordinateBounds([[90,-180],[-90,180]])
    //.coordinateBounds([[42.96, -78.94], [42.832, -78.782]])
    .addVectorLayer(citiesLayer)
    .addTo(sampleMap);

  syncOverlayWithBasemap({map:sampleMap, d3Overlay});



  //send summarized line dataset to 
  const mapTimeline = timeline()
    .data(summarizedCitiesData.sampleFrequency)
    .drag(newTime => mapState.update({time: newTime}))
    .xScale(summarizedCitiesData.xScale)
    .yScale(summarizedCitiesData.yScale)
    .width(mapState.width())
    .time(mapState.time())
    .selection(mapContainer)
    .draw();

  console.log(summarizedCitiesData);


  mapState.registerCallback({
    width(){
      const {width} = this.props();
      mapTimeline
        .width(width)
        .updateSize();
    },
    time(){
      const {time} = this.props();
      mapTimeline
        .time(time)
        .updateTime();

    },
    view(){
      const {view} = this.props();
      const svgPadding = .1;

      citiesLayer.view(view);

      if (view.view === "city"){
        const selectedCity = summarizedCitiesData.features.filter(d => d.id === view.city)[0];

        const latExtent = d3.extent(selectedCity.samples, d => d.lat);
        const lonExtent = d3.extent(selectedCity.samples, d => d.lon);
        const newBounds = [[latExtent[1], lonExtent[0]], [latExtent[0], lonExtent[1]]];

        mapTimeline
          .data(selectedCity.sampleFrequency)
          .xScale(selectedCity.xScale)
          .yScale(selectedCity.yScale)
          .updateView();

        sampleMap.fitBounds(newBounds);

        d3Overlay
          .coordinateBounds(newBounds.map((d,i) => i === 0 ? [d[0] + svgPadding, d[1] - svgPadding] : [d[0] - svgPadding, d[1] + svgPadding]))
          //WHY DO I NEED EXTRA UPDATE FOR SINGLE POINT?????
          .update();  

        
        citiesLayer
          .data(selectedCity.samples)
          .draw();
        //UPDATE TIME
      }else if (view.view === "world"){
        d3Overlay.coordinateBounds([[90,-180],[-90,180]])
          .update();

        citiesLayer
          .data(summarizedCitiesData.features)
          .draw();
        //UPDATE TIME
      }
    }
  });
  //mapState.update({view:{view: "city", city: "104862"}});

  d3.select(window).on("resize", () => {
    mapState.update({width: mapContainer.node().getBoundingClientRect().width});
  });

}

function syncOverlayWithBasemap({map, d3Overlay}){
  map.on("zoomstart",() => d3Overlay.hide());
  map.on("zoomend",() => d3Overlay.show());
  map.on("moveend", () => d3Overlay.update());
}