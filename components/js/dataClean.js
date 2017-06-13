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

const getSampleFrequencyExtent = sampleFrequency => d3.extent(sampleFrequency, d => d.length);
const getXScale = timeExtent => d3.scaleTime().domain(timeExtent.map(d => d3.timeHour(d)));
const getYScale = sampleFrequencyExtent => d3.scaleSqrt().domain(sampleFrequencyExtent);

const getSampleFrequency = ({samples, xScale, timeExtent}) => {

  const hourBins = d3.timeHours(d3.timeHour.offset(timeExtent[0], -1), d3.timeHour.offset(timeExtent[1], 1));

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
        const xScale = getXScale(timeExtent);
        const sampleFrequency = getSampleFrequency({samples: processedSamples, xScale, timeExtent});
        const sampleFrequencyExtent = getSampleFrequencyExtent(sampleFrequency);
        const yScale =getYScale(sampleFrequencyExtent);

        Object.assign(cityWithSamples, {
          samples: processedSamples,
          sampleCount: processedSamples.length,
          timeExtent,
          sampleFrequency,
          sampleFrequencyExtent,
          xScale,
          yScale
        });

        //GET SAMPLES PER HOUR, GET CURRENT SAMPLES

      }

      return cityWithSamples;
    });
  return citiesDataWithSamples;
};



export const summarizeCitiesData = citiesData => {

  const sampleTotalsExtent = d3.extent(citiesData, d => d.sampleCount);


  const allSamples = citiesData.filter(d => d.live).reduce((pv,cv) => {
    const samples = [...pv, ...cv.samples];
    return samples;
  }, []);

  const timeExtent = d3.extent(allSamples, d => d.time);
  const xScale = getXScale(timeExtent);
  const sampleFrequency = getSampleFrequency({samples:allSamples, xScale, timeExtent});
  const sampleFrequencyExtent = getSampleFrequencyExtent(sampleFrequency);
  const yScale =getYScale(sampleFrequencyExtent);

  const summarizedCitiesData = {
    features: citiesData,
    timeExtent,
    sampleFrequency,
    sampleFrequencyExtent,
    sampleTotalsExtent,
    xScale,
    yScale,
    radiusScale: d3.scaleSqrt().domain(sampleTotalsExtent).range([4,50])
  };
  return summarizedCitiesData;
};