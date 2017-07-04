require("../scss/leaflet.css");
require("../scss/layout.scss");
require("../scss/map.scss");
require("../scss/timeline.scss");
require("../scss/backButton.scss");
require("../scss/metadataMenu.scss");
require("../scss/readout.scss");
//Promise polyfill
import Promise from "promise-polyfill"; 
if (!window.Promise) {
  window.Promise = Promise;
}

import mapOverlay from "./visualization-components/mapOverlay/mapOverlay";
import state from "./visualization-components/state";

//import loadData from "./dataLoad";
import map from "./map";

import citiesLayer from "./mapCitiesLayer";
import {summarizeCitiesData, distance, processCityData, formatmetadataMenu} from "./dataClean";
import timeline from "./timeline";
import menu from "./metadataMenu";
import button from "./backButton";
import readout from "./readout";

d3.json("https://metasub-kobo-wrapper-v2.herokuapp.com/", (error, data) => {
  console.log("NEW DATA");
  console.log(data);
  loadMetadata({citiesData:data, callback:draw})
});

function loadMetadata({citiesData, callback}){
  const dataPath = "https://s3-us-west-2.amazonaws.com/metasub2017/";
  d3.csv(dataPath + "data/metadata.csv", (error, metadata) =>{
    if (error){
      console.log(error);
      throw error;
    }else{

      const cityFeatureProto = {
        getCurrentSamples({time, metadataFilter}){
          if (metadataFilter.category === "" || metadataFilter.type === ""){
            //console.log(time);
            return this.features.filter(d => d.time <= time);
          }else{
            return this.features.filter(d => d.time <= time && d[metadataFilter.category] === metadataFilter.type);
          }
        },
        getCurrentSampleCount({time, metadataFilter}){

          return this.getCurrentSamples({time, metadataFilter}).length;
        } 
      };

      citiesData.forEach(city => {
        if (city.live){
          city.features.forEach(d => {
            d.time = new Date(d.end.slice(0,d.end.indexOf(".")));
            d.lat = d._geolocation[0];
            d.lon = d._geolocation[1];
          });
          Object.assign(city, cityFeatureProto);  
        }
      });

      callback({citiesData, metadata: formatmetadataMenu(metadata)});
    }
  });
}

//loadData(draw);
  


function draw({citiesData, metadata}){
  console.log("data loaded 2");
  d3.select("#data-loading").style("opacity",1).transition().duration(500).style("opacity",0).remove();
  const worldBounds = [[90,-180],[-80,180]];
  const defaultMetadata = {category: "", type: ""};
  //const defaultMetadata2 = {category:"sampling_place", type:"seat"};

  const summarizedCitiesData = summarizeCitiesData({data:citiesData, metadataFilter:defaultMetadata});

  // summarizedCitiesData = summarizeCitiesData({data:citiesData, metadataFilter:defaultMetadata2});
  // summarizedCitiesData = summarizeCitiesData({data:citiesData, metadataFilter:defaultMetadata});
  
  //const worldBounds = [[80,-180],[-80,180]];



  const mapContainer = d3.select("#sample-map-2017");


  const mapState = state()
    .defaultValues({
      data: summarizedCitiesData,
      filteredData: summarizedCitiesData,
      width: mapContainer.node().getBoundingClientRect().width,
      view: {view: "world", city:""},
      metadataFilter: defaultMetadata,
      time: summarizedCitiesData.timeExtent[1],
      totalSamples: 0
    });

  if (mapState.width() >= 992){
    summarizedCitiesData.radiusScale.range([4,30]);
  }else{
    summarizedCitiesData.radiusScale.range([4,20]);
  }

  //extract mapContainer id from mapContainer.node(), send to map module as argument
  const sampleMap = map(worldBounds);

  citiesLayer
    .metadataFilter(defaultMetadata)
    .view(mapState.view())
    .radiusScale(summarizedCitiesData.radiusScale)
    .startTime(summarizedCitiesData.timeExtent[0])
    .time(mapState.time())
    .onCityClick(d => {
      mapState.update({
        //metadataFilter: Object.assign({},defaultMetadata, {view:"city"}),
        metadataFilter: defaultMetadata,
        view:{view: "city", city: d.id}, 
        time: d.timeExtent[1]//thismight not work
      });
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
  console.log(summarizedCitiesData);

  const metadataMenu = menu()
    .currentFeatures(summarizedCitiesData.allSamples)
    .selection(mapContainer)
    .metadataFilter(defaultMetadata)
    .data(metadata)

    .onClick(newMetadataFilter => mapState.update({
      //data: summarizeCitiesData({data:citiesData, metadataFilter:newMetadataFilter}),
        metadataFilter:newMetadataFilter}))
    .draw();

  const backButton = button()
    .selection(mapContainer)
    .onClick(() => mapState.update({
      metadataFilter: defaultMetadata,
      view:{view: "world"},
      time: summarizedCitiesData.timeExtent[1]
    }));

  //readout--view, metadataFilter, total, time (start/finish)

  // console.log(summarizedCitiesData.allSamples.length);
  // console.log(mapTimeline.height(), mapTimeline.padding());

  const mapReadout = readout()
    .selection(mapContainer)
    .position({
      bottom: mapTimeline.height()
    })
    .total(summarizedCitiesData.allSamples.length)
    .metadataFilter(mapState.metadataFilter())
    .time(mapState.time())
    .startTime(summarizedCitiesData.timeExtent[0])
    .location("Worldwide")
    .draw();

  mapState.registerCallback({
    metadataFilter(){
      const {metadataFilter, view} = this.props();


      let filteredData = summarizeCitiesData({data:citiesData, metadataFilter:metadataFilter});
      // citiesLayer.data(filteredData.features);

      if (view.view === "city"){
        filteredData = filteredData.features.filter(d => d.id === view.city)[0];
      }

      citiesLayer.metadataFilter(metadataFilter);
      
      metadataMenu
        .metadataFilter(metadataFilter)
        .updateFilter();

      //readout--filteredData.getTotal()...
      //could calculate here, update 'totals' variable in cities layer

      mapTimeline
        .data(filteredData.sampleFrequency)
        .xScale(filteredData.xScale)
        .yScale(filteredData.yScale)
        .updateView();

      mapState
        .update({time: filteredData.timeExtent[1]});
    },
    width(){
      const {width} = this.props();
      // if (width >= 992){
      //   summarizedCitiesData.radiusScale.range([4,30]);
      // }else{
      //   summarizedCitiesData.radiusScale.range([4,20]);
      // }
      mapTimeline
        .width(width)
        .updateSize();

      mapReadout.position({bottom: mapTimeline.height()})
        .update();

    },
    time(){
      const {time, view} = this.props();
      mapTimeline
        .time(time)
        .updateTime();

      citiesLayer
        .time(time)
        .updateTime();

      if (view.view === "world"){
        mapReadout.total(citiesLayer.getGlobalSampleTotal());
        console.log();
      }else if (view.view === "city"){
        mapReadout.total(citiesLayer.getCitySampleTotal());
      }
      mapReadout.update();

    },
    view(){
      const {view, data} = this.props();
      console.log(view);
      const svgPadding = .1;

      citiesLayer.view(view);
      //DEFINE DATA SUBSET HERE?

      if (view.view === "city"){
        const selectedCity = summarizedCitiesData.features.filter(d => d.id === view.city)[0];
        const pointsInView = selectedCity.features.filter(d => {
            const distanceFromCenter = distance(parseFloat(selectedCity.lat), parseFloat(selectedCity.lon), d.lat, d.lon);
            return distanceFromCenter < 500;
        });

        mapReadout
          .location(`in ${selectedCity.name_full}`)
          .update();

        const latExtent = d3.extent(pointsInView, d => d.lat);
        const lonExtent = d3.extent(pointsInView, d => d.lon);
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

        metadataMenu.currentFeatures(selectedCity.features);
      }else if (view.view === "world"){

        mapReadout
          .location("Worldwide")
          .update();

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

        metadataMenu.currentFeatures(summarizedCitiesData.allSamples);
      }
      metadataMenu.updateView();
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