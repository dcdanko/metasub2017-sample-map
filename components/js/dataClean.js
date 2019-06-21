const getTimeExtent = points => d3.extent(points, d => d.time)
  .map((d, i) => {
    if (i === 0) {
      return d3.timeHour.floor(d);
    }
    return d3.timeHour.ceil(d);
  });

const getSampleFrequencyExtent = sampleFrequency => d3.extent(sampleFrequency, d => d.length);

const getXScale = timeExtent => d3.scaleTime().domain(timeExtent);

const getYScale = sampleFrequencyExtent => d3.scaleSqrt()
  .domain(sampleFrequencyExtent);

const getSampleFrequency = ({ samples, xScale }) => {
  const hourBins = d3.timeHours(
    d3.timeHour.offset(xScale.domain()[0], -1),
    d3.timeHour.offset(xScale.domain()[1], 1));

  const histogram = d3.histogram()
    .value(d => d.time)
    .domain(d3.extent(hourBins))
    .thresholds(xScale.ticks(hourBins.length));

  return histogram(samples);
};

const getSummary = (points) => {
  const timeExtent = getTimeExtent(points);
  const xScale = getXScale(timeExtent);
  const sampleFrequency = getSampleFrequency({ samples: points, xScale });
  const sampleFrequencyExtent = getSampleFrequencyExtent(sampleFrequency);
  const yScale = getYScale(sampleFrequencyExtent);
  return {
    timeExtent,
    xScale,
    yScale,
    sampleFrequency,
    sampleFrequencyExtent,
  };
};


const summarizeCity = features => Object.assign(
  getSummary(features),
  { sampleCount: features.length },
);

export const summarizeCitiesData = ({ data, metadataFilter, width }) => {
  const summarizedCities = data.map((d) => {
    if (d.live) {
      const filteredFeatures = d.features.filter((feature) => {
        if (metadataFilter.category === '') {
          return true;
        }
        return feature[metadataFilter.category] === metadataFilter.type;
      });

      const summarizedCity = Object.assign(
        summarizeCity(filteredFeatures),
        d,
        { features: filteredFeatures },
      );

      return summarizedCity;
    }
    return d;
  });

  const sampleTotalsExtent = d3.extent(summarizedCities, d => d.sampleCount);


  const allSamples = summarizedCities.filter(d => d.live).reduce((pv, cv) => {
    const samples = [...pv, ...cv.features];
    return samples;
  }, []);

  const radiusScale = d3.scaleSqrt().domain(sampleTotalsExtent).range([4, 30]);

  if (width < 992) {
    radiusScale.range([4, 20]);
  }

  const summarizedCitiesData = Object.assign(getSummary(allSamples), {
    features: summarizedCities,
    allSamples,
    radiusScale,
  });
  return summarizedCitiesData;
};

export const formatmetadataMenu = (rawmetadata) => {
  const uniqueCategories = d3.set(rawmetadata.filter(d => d.category !== '')
    .map(d => d.category)).values();
  const processedmetadata = uniqueCategories.map(d => ({
    category: d,
    category_label: rawmetadata.filter(dd => dd.category === d)[0].category_label,
    features: rawmetadata.filter(dd => dd.category === d),
  })).filter(d => d.category_label !== '');

  return processedmetadata;
};

export const processData = ({ citiesData, metadata, callback }) => {
  const cityFeatureProto = {
    getCurrentSamples({ time, metadataFilter }) {
      if (metadataFilter.category === '' || metadataFilter.type === '') {
        return this.features.filter(d => d.time <= time);
      }
      return this.features.filter(d => d.time <= time &&
        d[metadataFilter.category] === metadataFilter.type);
    },
    getCurrentSampleCount({ time, metadataFilter }) {
      return this.getCurrentSamples({ time, metadataFilter }).length;
    },
  };

  const cleanCitiesData = citiesData.map((city) => {
    const cityCopy = Object.assign({}, city);
    if (city.live) {
      cityCopy.features = (city.features || [])
        .filter(feature => Object.prototype.hasOwnProperty.call(feature, 'end'))
        .map((feature) => {
          const featureCopy = Object.assign({}, feature);
          featureCopy.time = new Date(feature.end.slice(0, feature.end.indexOf('.')));
          featureCopy.lat = feature._geolocation[0]; // eslint-disable-line no-underscore-dangle
          featureCopy.lon = feature._geolocation[1]; // eslint-disable-line no-underscore-dangle
          featureCopy.attachments =
            feature._attachments; // eslint-disable-line no-underscore-dangle
          featureCopy.id = feature._id; // eslint-disable-line no-underscore-dangle
          return featureCopy;
        });
    }
    Object.assign(cityCopy, cityFeatureProto);
    return cityCopy;
  });

  callback({ citiesData: cleanCitiesData, metadata: formatmetadataMenu(metadata) });
};
