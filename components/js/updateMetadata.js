import {summarizeCitiesData} from "./dataClean";

const updateMetadata = function(){
    console.log("UPDATE METADATA");
    const {metadataFilter, rawCitiesData, view, components} = this.props();
    const {citiesLayer, metadataMenu, mapTimeline } = components;
    
    let filteredData = summarizeCitiesData({data:rawCitiesData, metadataFilter:metadataFilter});

    if (view.view === "city"){
      filteredData = filteredData.features.filter(d => d.id === view.city)[0];
    }

    citiesLayer.metadataFilter(metadataFilter);
    
    metadataMenu
      .metadataFilter(metadataFilter)
      .updateFilter();

    mapTimeline
      .data(filteredData.sampleFrequency)
      .xScale(filteredData.xScale)
      .yScale(filteredData.yScale)
      .updateView();
    

    this.update({time: filteredData.timeExtent[1]});
};

export default updateMetadata;