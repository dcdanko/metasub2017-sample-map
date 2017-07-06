



const getTimeExtent = points => d3.extent(points, d => d.time)
  .map((d,i) => i === 0 ? d3.timeHour.floor(d) : d3.timeHour.ceil(d));

const getSampleFrequencyExtent = sampleFrequency => d3.extent(sampleFrequency, d => d.length);

const getXScale = timeExtent => d3.scaleTime().domain(timeExtent);

const getYScale = sampleFrequencyExtent => d3.scaleSqrt()
  .domain(sampleFrequencyExtent);

const getSampleFrequency = ({samples, xScale}) => {
  const hourBins = d3.timeHours(
    d3.timeHour.offset(xScale.domain()[0], -1), 
    d3.timeHour.offset(xScale.domain()[1], 1));
  
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
  const processedmetadata = uniqueCategories.map(d => ({
      category: d,
      category_label: rawmetadata.filter(dd => dd.category === d)[0].category_label,
      features: rawmetadata.filter(dd => dd.category === d)
    })).filter(d => d.category_label !== "");

  return processedmetadata;
};

export const processData = ({citiesData, metadata, callback}) => {
  const cityFeatureProto = {
    getCurrentSamples({time, metadataFilter}){
      if (metadataFilter.category === "" || metadataFilter.type === ""){
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
};