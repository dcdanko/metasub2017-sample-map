import {processCitiesData, addSampleDataToCities} from "./dataClean";


const loadData = new Promise((resolve, reject) => {
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

    return Promise.all(sampleDataPromises).then(samplesData => addSampleDataToCities({citiesData, samplesData}));
  });


export default loadData;