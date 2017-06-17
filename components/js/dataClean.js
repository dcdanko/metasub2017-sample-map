export const processCitiesData = rawData => {
  const cleanedData = rawData.map(rawCity => {
    const cleanCity = Object.assign({}, rawCity);
    if (cleanCity.id !== ""){
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
    cleanSample.time = new Date(cleanSample._submission_time);
    cleanSample.lat = cleanSample._geolocation[0];
    cleanSample.lon = cleanSample._geolocation[1];
    return cleanSample;
  });
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

export const addSampleDataToCities = ({citiesData, samplesData}) => {
  const getCurrentSamples = function(time){
    return this.features.filter(d => d.time <= time);
  };

  const getCurrentSampleCount = function(time){
    return this.getCurrentSamples(time).length;
  };

  const citiesDataWithSamples = citiesData.map((city, i) => {
      const cityWithSamples = Object.assign({}, city);

      if (cityWithSamples.live){
        const processedSamples = processSampleData(samplesData[i]);
        
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

export const summarizeCitiesData = ({data, metaDataFilter}) => {

  
  const summarizedCities = data.map(d => {
    if (d.live){
      const filteredFeatures = d.features.filter(feature => {
        if (!metaDataFilter.use){
          return true;
        }else{
          return feature[metaDataFilter.category] === metaDataFilter.value;
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
      sampleTotalsExtent,
      radiusScale: d3.scaleSqrt().domain(sampleTotalsExtent).range([4,50])
    });
  return summarizedCitiesData;
};

export const formatMetadataMenu = rawMetaData => {
  const uniqueCategories = d3.set(rawMetaData.filter(d => d.category !== "")
    .map(d => d.category)).values();
  // const processedMetadata = uniqueCategories.reduce((pv,cv) => {
  //   pv[cv] = rawMetaData.filter(d => d.category === cv);
  //   return pv;
  // }, {});
  const processedMetadata = uniqueCategories.map(d => ({
      category: d,
      category_label: rawMetaData.filter(dd => dd.category === d)[0].category_label,
      features: rawMetaData.filter(dd => dd.category === d)
    }));

  return processedMetadata;
};