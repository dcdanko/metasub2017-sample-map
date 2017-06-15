require("../scss/layout.scss");
require("../scss/map.scss");
require("../scss/timeline.scss");
require("../scss/backButton.scss");
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
import button from "./backButton";




loadData(draw);
  


function draw({citiesData, metaData}){
  console.log(metaData);
  const defaultMetadata = {category: "", value: "", use:false};

  // const defaultMetadata = {category:"sampling_place", value:"seat", use:true};

  const summarizedCitiesData = summarizeCitiesData({data:citiesData, metadataFilter:defaultMetadata});
  const worldBounds = [[90,-180],[-80,180]];
  //const worldBounds = [[80,-180],[-80,180]];
  console.log(summarizedCitiesData);


  const mapContainer = d3.select("#sample-map-2017");


  const mapState = state()
    .defaultValues({
      width: mapContainer.node().getBoundingClientRect().width,
      view: {view: "world", city:""},
      metadata: defaultMetadata,
      time: summarizedCitiesData.timeExtent[1]
    });



  //extract mapContainer id from mapContainer.node(), send to map module as argument
  const sampleMap = map(worldBounds);

  citiesLayer
    .view(mapState.view())
    .radiusScale(summarizedCitiesData.radiusScale)
    .time(mapState.time())
    .onCityClick(d => {
      mapState.update({view:{view: "city", city: d.id}, time: d.timeExtent[1]});
      //mapState.update();
    })
    .data(summarizedCitiesData.features);



  const d3Overlay = mapOverlay()
    .coordinateBounds(worldBounds)
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

  const backButton = button()
    .selection(mapContainer)
    .onClick(() => mapState.update({
      view:{view: "world"},
      time: summarizedCitiesData.timeExtent[1]
    }));


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

      citiesLayer
        .time(time)
        .updateTime();

    },
    view(){
      const {view} = this.props();
      const svgPadding = .1;

      citiesLayer.view(view);
      //DEFINE DATA SUBSET HERE?

      if (view.view === "city"){
        const selectedCity = summarizedCitiesData.features.filter(d => d.id === view.city)[0];

        const latExtent = d3.extent(selectedCity.features, d => d.lat);
        const lonExtent = d3.extent(selectedCity.features, d => d.lon);
        const newBounds = [[latExtent[1], lonExtent[0]], [latExtent[0], lonExtent[1]]];

        mapTimeline
          .data(selectedCity.sampleFrequency)
          .xScale(selectedCity.xScale)
          .yScale(selectedCity.yScale)
          .updateView();

        d3Overlay
          .coordinateBounds(newBounds.map((d,i) => i === 0 ? [d[0] + svgPadding, d[1] - svgPadding] : [d[0] - svgPadding, d[1] + svgPadding]));

        sampleMap.fitBounds(newBounds);
        
        citiesLayer
          .data(selectedCity)
          .draw();

        backButton.draw();
      }else if (view.view === "world"){
        d3Overlay
          .coordinateBounds(worldBounds)
          .update();

        citiesLayer
          .data(summarizedCitiesData.features)
          .draw();

        mapTimeline
          .data(summarizedCitiesData.sampleFrequency)
          .xScale(summarizedCitiesData.xScale)
          .yScale(summarizedCitiesData.yScale)
          .updateView();

        sampleMap.fitBounds(worldBounds);

        backButton.remove();
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