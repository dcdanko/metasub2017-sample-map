import {distance} from "./dataClean";
import constants from "./constants";
const {worldBounds} = constants;

const getNewBounds = selectedCity => {
  const pointsInView = selectedCity.features.filter(d => {
  const distanceFromCenter = distance(parseFloat(selectedCity.lat), parseFloat(selectedCity.lon), d.lat, d.lon);
      return distanceFromCenter < 500;
  });
  const latExtent = d3.extent(pointsInView, d => d.lat);
  const lonExtent = d3.extent(pointsInView, d => d.lon);
  return [[latExtent[1], lonExtent[0]], [latExtent[0], lonExtent[1]]];
};

const getUpdateView = ({
    citiesLayer, 
    summarizedCitiesData, 
    mapReadout,
    mapTimeline,
    d3Overlay,
    sampleMap,
    backButton,
    metadataMenu
}) =>  {
  const updateCityView = view => {
    const selectedCity = summarizedCitiesData.features.filter(d => d.id === view.city)[0];
    const newBounds = getNewBounds(selectedCity);
    const svgPadding = .1;

    mapReadout
      .location(`in ${selectedCity.name_full}`)
      .update();

    

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
  };

  const updateWorldView = () => {
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
  };


  const updateView = function(){
    const {view} = this.props();
    
      citiesLayer.view(view);
      metadataMenu.updateView();

      if (view.view === "city"){
        updateCityView(view);
      }else if (view.view === "world"){
        updateWorldView();
      }
      
  };
  return updateView;
};

export default getUpdateView;