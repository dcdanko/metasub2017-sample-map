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

export const processSampleData = rawSamples => {
  const cleanSamples = rawSamples.map(d => {
    const cleanSample = Object.assign({}, d);
    cleanSample.time = new Date(cleanSample._submission_time);
    return cleanSample;
  });
  return cleanSamples;
};

export const addSampleDataToCities = ({citiesData, samplesData}) => {
  console.log(citiesData);
  const citiesDataWithSamples = citiesData.map((city, i) => {
      const cityWithSamples = Object.assign({}, city);

      if (cityWithSamples.live){
        cityWithSamples.samples = processSampleData(samplesData[i]);
        cityWithSamples.sampleCount = cityWithSamples.samples.length;
        cityWithSamples.minTime = d3.min(cityWithSamples.samples, sample => sample.time);
        cityWithSamples.maxTime = d3.max(cityWithSamples.samples, sample => sample.time);
      }

      return cityWithSamples;
    });
  return citiesDataWithSamples;
};

export const summarizeCitiesData = citiesData => {
  //start date, end date, max samples, min samples

  const minSampleCount = d3.min(citiesData, d => d.sampleCount);
  const maxSampleCount = d3.max(citiesData, d => d.sampleCount);
  const minTime = d3.min(citiesData, d => d.minTime);
  const maxTime = d3.max(citiesData, d => d.maxTime);
   

  const summarizedCitiesData = {
    minSampleCount,
    maxSampleCount,
    minTime,
    maxTime,
    features: citiesData,
    radiusScale: d3.scaleSqrt().domain([minSampleCount, maxSampleCount]).range([4,50])

  };
  return summarizedCitiesData;
};