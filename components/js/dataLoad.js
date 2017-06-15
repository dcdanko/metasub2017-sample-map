import {processCitiesData, addSampleDataToCities, formatMetadataMenu} from "./dataClean";

const loadData = callback => {
  new Promise((resolve, reject) => {

    d3.csv("data/cities.csv", (error, data) => {
        if (error){
          reject(error);
        }else{
          resolve(data);
        }
      });
    })
  .then(rawCityData => processCitiesData(rawCityData))
  .then(citiesData => {
    const getSampleDataPromise = cityPath => new Promise((resolve, reject) => {
      d3.json(cityPath, (error, data) => {
        if (error){
          reject(error);
        }else{
          resolve(data);
        }
      });
    });
    
    const sampleDataPromises = citiesData
      .map(city => {
        if (city.live){
          return getSampleDataPromise(city.path);
        }else{
          return [];
        }
      });

    return Promise.all(sampleDataPromises)
      .then(samplesData => addSampleDataToCities({citiesData, samplesData}));
  })
  .then(citiesDataWithSamples => {
    console.log("DATA LOADED");
    loadMetadata({citiesData: citiesDataWithSamples, callback});
  })
  .catch(error => {
    console.log(error);
    throw error;
  });
};


function loadMetadata({citiesData, callback}){
  d3.csv("data/metadata.csv", (error, metaData) =>{
    if (error){
      console.log(error);
      throw error;
    }else{
      callback({citiesData, metaData: formatMetadataMenu(metaData)});
    }
  });
}


export default loadData;