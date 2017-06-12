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
    return cleanSample;
  });
  return cleanSamples;
};

const getSampleFrequency = ({samples, timeExtent}) => {
  const xScale = d3.scaleTime().domain(timeExtent.map(d => d3.timeHour(d)));
  //const xScale = d3.scaleTime().domain(timeExtent);

  const hourBins = d3.timeHours(d3.timeHour.offset(timeExtent[0], -1), d3.timeHour.offset(timeExtent[1], 1));

  //console.log(d3.timeHour(timeExtent[0]), d3.timeHour(timeExtent[1]));




  const histogram = d3.histogram()
    .value(d => d.time)
    .domain(timeExtent)
    .thresholds(xScale.ticks(hourBins.length));

  return histogram(samples);
};

export const addSampleDataToCities = ({citiesData, samplesData}) => {

  const citiesDataWithSamples = citiesData.map((city, i) => {
      const cityWithSamples = Object.assign({}, city);

      if (cityWithSamples.live){
        const processedSamples = processSampleData(samplesData[i]);
        const timeExtent = d3.extent(processedSamples, d => d.time);
        const sampleFrequency = getSampleFrequency({samples: processedSamples, timeExtent});
        console.log(sampleFrequency);
        //GET SAMPLES PER HOUR, GET CURRENT SAMPLES
        cityWithSamples.samples = processedSamples;
        cityWithSamples.sampleCount = cityWithSamples.samples.length;
        //extent instead?
        // cityWithSamples.minTime = d3.min(cityWithSamples.samples, sample => sample.time);
        // cityWithSamples.maxTime = d3.max(cityWithSamples.samples, sample => sample.time);

      }

      return cityWithSamples;
    });
  return citiesDataWithSamples;
};



export const summarizeCitiesData = citiesData => {

  const sampleCountExtent = d3.extent(citiesData, d => d.sampleCount);

  const allSamples = citiesData.filter(d => d.live).reduce((pv,cv) => {
    const samples = [...pv, ...cv.samples];
    return samples;
  }, []);

  const timeExtent = d3.extent(allSamples, d => d.time);
  const sampleFrequency = getSampleFrequency({samples:allSamples, timeExtent});
  console.log(sampleFrequency.length);

  const summarizedCitiesData = {
    features: citiesData,
    sampleFrequency,
    sampleCountExtent,
    timeExtent,
    radiusScale: d3.scaleSqrt().domain(sampleCountExtent).range([4,50])
  };
  return summarizedCitiesData;
};