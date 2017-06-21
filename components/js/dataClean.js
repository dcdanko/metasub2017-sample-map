export const processCitiesData = rawData => {
  const cleanedData = rawData.map(rawCity => {
    const cleanCity = Object.assign({}, rawCity);
    if (cleanCity.id !== ""){
      //cleanCity.path = `http://localhost:3000/${cleanCity.id}`;
      cleanCity.path = `https://metasub-kobo-wrapper.herokuapp.com/${cleanCity.id}`;
      cleanCity.live = true;
    }else{
      cleanCity.live = false;
    }
    return cleanCity;
  });
  return cleanedData;
};

const processSampleData = rawSamples => {
  const cleanSamples = rawSamples.map(d => {
    const cleanSample = Object.assign({}, d);
    //cleanSample.time = new Date(cleanSample._submission_time);
    cleanSample.time = new Date(cleanSample.end.slice(0,cleanSample.end.indexOf(".")));
    cleanSample.lat = cleanSample._geolocation[0];
    cleanSample.lon = cleanSample._geolocation[1];
    return cleanSample;
  }); //add filter here?
  return cleanSamples;
};
const getTimeExtent = points => d3
          .extent(points, d => d.time)
          .map((d,i) => i === 0 ? d3.timeHour.floor(d) : d3.timeHour.ceil(d));
const getSampleFrequencyExtent = sampleFrequency => d3.extent(sampleFrequency, d => d.length);
const getXScale = timeExtent => d3.scaleTime().domain(timeExtent);
const getYScale = sampleFrequencyExtent => d3.scaleSqrt()
  .domain(sampleFrequencyExtent);

const getSampleFrequency = ({samples, xScale}) => {


  const hourBins = d3.timeHours(
    d3.timeHour.offset(xScale.domain()[0], -1), 
    d3.timeHour.offset(xScale.domain()[1], 1));

  // const hourBins = d3.timeHours(xScale.domain()[0], xScale.domain()[1]);
  
  const histogram = d3.histogram()
    .value(d => d.time)
    .domain(d3.extent(hourBins))
    .thresholds(xScale.ticks(hourBins.length));

  return histogram(samples);
};

const getSummary = points => {
    const timeExtent = getTimeExtent(points);
    const xScale = getXScale(timeExtent);
    const sampleFrequency = getSampleFrequency({samples: points, xScale});
    const sampleFrequencyExtent = getSampleFrequencyExtent(sampleFrequency);
    const yScale =getYScale(sampleFrequencyExtent);
    return {
      timeExtent,
      xScale,
      yScale,
      sampleFrequency,
      sampleFrequencyExtent
    };
  };

export const distance = (lat1, lon1, lat2, lon2, unit) => {
  const radlat1 = Math.PI * lat1/180;
  const radlat2 = Math.PI * lat2/180;
  const theta = lon1-lon2;
  const radtheta = Math.PI * theta/180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180/Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit==="K") { 
    dist = dist * 1.609344; 
  }
  if (unit==="N") { 
    dist = dist * 0.8684; 
  }
  return dist;
}

export const addSampleDataToCities = ({citiesData, samplesData}) => {
  const getCurrentSamples = function({time, metadataFilter}){
    if (metadataFilter.category === "" || metadataFilter.type === ""){
      return this.features.filter(d => d.time <= time);
    }else{
      return this.features.filter(d => d.time <= time && d[metadataFilter.category] === metadataFilter.type);
    }
    
  };

  const getCurrentSampleCount = function({time, metadataFilter}){
    return this.getCurrentSamples({time, metadataFilter}).length;
  };

  const citiesDataWithSamples = citiesData.map((city, i) => {
      const cityWithSamples = Object.assign({}, city);
      //console.log(cityWithSamples);
      if (cityWithSamples.live){
        //filter out outlier points
        const processedSamples = processSampleData(samplesData[i]);

        //   .filter(d => {
        //     const distanceFromCenter = distance(parseFloat(cityWithSamples.lat), parseFloat(cityWithSamples.lon), d.lat, d.lon);
        //     return distanceFromCenter < 500;
        // });
        
        Object.assign(cityWithSamples, 
          {
            features: processedSamples,
            
            getCurrentSamples,
            getCurrentSampleCount
          }
        );

      }

      return cityWithSamples;
    });

  return citiesDataWithSamples;
};

const summarizeCity = features => {
  return Object.assign(getSummary(features), {sampleCount: features.length});
};

export const summarizeCitiesData = ({data, metadataFilter}) => {


  const summarizedCities = data.map(d => {
    if (d.live){
      const filteredFeatures = d.features.filter(feature => {
        if (metadataFilter.category === ""){
          return true;
        }else{
          return feature[metadataFilter.category] === metadataFilter.type;
        }
      });

      const summarizedCity =Object.assign(summarizeCity(filteredFeatures),d,{features: filteredFeatures} );

      return summarizedCity;
    }else{
      return d;
    }
  });

  const sampleTotalsExtent = d3.extent(summarizedCities, d => d.sampleCount);


  const allSamples = summarizedCities.filter(d => d.live).reduce((pv,cv) => {
    const samples = [...pv, ...cv.features];
    return samples;
  }, []);



  const summarizedCitiesData = Object.assign(getSummary(allSamples),{
      features: summarizedCities,
      allSamples: allSamples,
      radiusScale: d3.scaleSqrt().domain(sampleTotalsExtent).range([4,20])
    });
  return summarizedCitiesData;
};

export const formatmetadataMenu = rawmetadata => {
  const uniqueCategories = d3.set(rawmetadata.filter(d => d.category !== "")
    .map(d => d.category)).values();
  // const processedmetadata = uniqueCategories.reduce((pv,cv) => {
  //   pv[cv] = rawmetadata.filter(d => d.category === cv);
  //   return pv;
  // }, {});
  const processedmetadata = uniqueCategories.map(d => ({
      category: d,
      category_label: rawmetadata.filter(dd => dd.category === d)[0].category_label,
      features: rawmetadata.filter(dd => dd.category === d)
    })).filter(d => d.category_label !== "");

  return processedmetadata;
};