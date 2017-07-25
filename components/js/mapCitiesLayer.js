import MapOverlayLayer from './visualization-components/mapOverlay/mapOverlayLayer';
import Tooltip from './visualization-components/tooltip';


const formatCoordinates = d3.format(0.7);

const citiesLayer = new MapOverlayLayer()
  .type('Point')
  .name('cities')
  .render('Vector')
  .addPropMethods(['onCityClick', 'view', 'time', 'startTime', 'radiusScale', 'metadataFilter', 'tooltip'])
  .draw(function draw() {
    const { data, group, view, map, onCityClick } = this.props();

    this._.mapTooltip = new Tooltip().selection(d3.select(map.getPanes().overlayPane));


    const { mapTooltip } = this.props();

    group.selectAll('.map__circle').remove();

    if (view.view === 'world') {
      this._.overlayCircles = group.selectAll('.map__city-circle')
        .data(data.filter(d => d.live).sort((a, b) => b.sampleCount - a.sampleCount))
        .enter()
        .append('circle')
        // make setAttributes function to avoid code duplication

        .attrs({
          class: 'map__city-circle map__circle',
          cx: d => map.latLngToLayerPoint(d).x,
          cy: d => map.latLngToLayerPoint(d).y,
          cursor: 'pointer',
        })

        .classed('map__city-circle--inactive', false)
        .on('click', (d) => {
          mapTooltip.remove();
          if (d.live && d.features.length > 0) {
            onCityClick(d);
          }
          // d.live && d.features.length > 0 ? onCityClick(d) : console.log(d);
        })
        .on('touchstart', (d) => {
          mapTooltip.remove();
          if (d.live && d.features.length > 0) {
            onCityClick(d);
          }
        })
        .on('mousemove', () => {
          // mapTooltip.position(getPositionOnPage()).update();
        })
        .on('mouseout', () => {
          mapTooltip.remove();
        });
    }

    this.updateTime();

    return this;
  });

const formatTime = d3.timeFormat('%m/%d/%Y');

citiesLayer.getGlobalSampleTotal = function getGlobalSampleTotal() {
  const { overlayCircles, runningTotal } = this.props();
  const total = d3.sum(overlayCircles.nodes(), d => runningTotal.get(d));
  return total;
  // return d3.sum(overlayCircles.data(), d => d.runningTotal);
};

citiesLayer.getCitySampleTotal = function getCitySampleTotal() {
  const { overlayCircles } = this.props();

  return overlayCircles.data().length;
};

citiesLayer.updateTime = function updateTime() {
  const { view, time, startTime, metadataFilter, mapTooltip } = this.props();

  if (view.view === 'world') {
    const { overlayCircles, radiusScale } = this.props();
    this._.runningTotal = d3.local();
    const { runningTotal } = this.props();

    overlayCircles
        .each(function setRunningTotal(d) {
          runningTotal.set(this, d.getCurrentSampleCount({ time, metadataFilter }));
        })
        .attrs({
          r: function getRadius() {
            return radiusScale(runningTotal.get(this));
          },
        })
        .on('mouseover', function mouseover(d) {
          // d3.select(this).style("fill","red");
          const circlePos = d3.select(this).node().getBBox();

          mapTooltip.position([circlePos.x + circlePos.width, circlePos.y + circlePos.height])
              .text([

                ['Location: ', `${d.name_full}`],
                ['Time Period: ', `${formatTime(startTime)} - ${formatTime(time)}`],
                ['Samples Taken: ', `${runningTotal.get(this)}`],
              ])
              .draw();
        });
  } else if (view.view === 'city') {
    const { data, group, map } = this.props();
    this._.overlayCircles = group.selectAll('.map__city-circle')
        .data(data.getCurrentSamples({ time, metadataFilter }), d => d.id);

    this._.overlayCircles
        .enter()
        .append('circle')
        .merge(this._.overlayCircles)
        .attrs({
          class: 'map__city-circle map__circle',
          r: 4,
          cx: d => map.latLngToLayerPoint(d).x,
          cy: d => map.latLngToLayerPoint(d).y,
          cursor: 'pointer',
        })
        .on('mouseover', function mouseover(d) {
          const circlePos = d3.select(this).node().getBBox();
          mapTooltip.position([circlePos.x + circlePos.width, circlePos.y + circlePos.height])
            .text([
              ['Location: ', `(${formatCoordinates(d.lat)}, ${formatCoordinates(d.lon)})`],
              ['Time Submitted: ', `${formatTime(d.time)}`],
              ['Location Name: ', `${d.location}`],
              ['Location Type: ', `${d.location_type}`],
              ['Ground Level: ', `${d.ground_level}`],
              ['Sampling Place: ', `${d.sampling_place}`],
              ['Sampling Type: ', `${d.sampling_type}`],
              ['Setting: ', `${d.setting}`],
              ['Surface Material: ', `${d.surface_material}`],
              ['Surface Sampling Protocol: ', `${d.surface_sampling_protocol}`],

            ])
            .draw();
          if (d.attachments.length > 0) {
            mapTooltip.div().append('div').styles({
              'margin-top': '5px',
              'font-weight': 'bold',
            }).text('CLICK TO VIEW IMAGE');
          }
        })
        .on('click', (d) => {
          if (d.attachments.length > 0) {
            const imgPath = `https://kc.kobotoolbox.org/attachment/original?media_file=${d.attachments[0].filename}`;
            window.open(imgPath, '_blank');
          }
        })
        .on('mouseout', () => {
          mapTooltip.remove();
        });

    this._.overlayCircles.exit().remove();
    this._.overlayCircles = group.selectAll('.map__city-circle');
  }
};

export default citiesLayer;
