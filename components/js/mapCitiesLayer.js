import mapOverlayLayer from "./visualization-components/mapOverlay/mapOverlayLayer";
import tooltip from "./visualization-components/tooltip/tooltip.js";

//const mapTooltip = tooltip().selection(d3.select(".leaflet-map-pane"));
//const getPositionOnPage = () => [d3.event.pageX, d3.event.pageY];

const formatCoordinates = d3.format(.7);

const citiesLayer = mapOverlayLayer()
  .type("Point")
  .name("cities")
  .render("Vector")
  .addPropMethods(["onCityClick", "view","time", "startTime", "radiusScale", "metadataFilter", "tooltip"])
  .draw(function(){
    const {data, group, view, map, onCityClick} = this.props();

    this._.mapTooltip = tooltip().selection(d3.select(map.getPanes().overlayPane));


    const {mapTooltip} = this.props();

    group.selectAll(".map__circle").remove();

    if (view.view === "world"){
      this._.overlayCircles = group.selectAll(".map__city-circle")
        .data(data.filter(d => d.live).sort(function(a,b){
          return b.sampleCount - a.sampleCount;
        }))
        .enter()
        .append("circle")
        //make setAttributes function to avoid code duplication

        .attrs({
          class: "map__city-circle map__circle",
          cx: d => map.latLngToLayerPoint(d).x,
          cy: d => map.latLngToLayerPoint(d).y,
          cursor:"pointer"
        })

        .classed("map__city-circle--inactive", false)
        .on("click", d => {
          mapTooltip.remove();
          d.live && d.features.length > 0 ? onCityClick(d) : console.log(d);
        })
        .on("touchstart", function(d) {

          mapTooltip.remove();
          d.live && d.features.length > 0 ? onCityClick(d) : console.log(d);

        })
        .on("mousemove", () => {
          //mapTooltip.position(getPositionOnPage()).update();
        })
        .on("mouseout", () => {
          mapTooltip.remove();
        });
      // this._.inactiveCircles = group.selectAll(".map__city-circle--inactive")
      //   .data(data.filter(d => !d.live))
      //   .enter()
      //   .append("circle")
      //   .attrs({
      //     class: "map__city-circle--inactive map__circle",
      //     r:2
      //   });
    }

    this.updateTime();

    return this;
  });

const formatTime =  d3.timeFormat("%m/%d/%Y");

citiesLayer.getGlobalSampleTotal = function(){
  const {overlayCircles} = this.props();
  return d3.sum(overlayCircles.data(), d => d._runningTotal);
};

citiesLayer.getCitySampleTotal = function(){
  const {overlayCircles} = this.props();
  return overlayCircles.data().length;
};

citiesLayer.updateTime = function(){
    const {view, time, startTime, metadataFilter, mapTooltip} = this.props();
    
    if (view.view === "world"){
      const {overlayCircles, radiusScale} = this.props();
      
      overlayCircles
      .each(d => {
        d._runningTotal = d.getCurrentSampleCount({time, metadataFilter});
      })
      .attrs({
        r: d => radiusScale(d._runningTotal)
      })
      .on("mouseover", function(d){
        //d3.select(this).style("fill","red");
          const circlePos = d3.select(this).node().getBBox();

          mapTooltip.position([circlePos.x + circlePos.width, circlePos.y + circlePos.height])
            .text([

              ["Location: ", `${d.name_full}`],
              ["Time Period: ", `${formatTime(startTime)} - ${formatTime(time)}`],
              ["Samples Taken: ", `${d._runningTotal}`]
            ])
            .draw();
        });
    }else if (view.view === "city"){
      const {data, group, map} = this.props();
      this._.overlayCircles = group.selectAll(".map__city-circle")
        .data(data.getCurrentSamples({time, metadataFilter}));
      const {overlayCircles} =this.props();

      overlayCircles
        .enter()
        .append("circle")
        .merge(overlayCircles)
        .attrs({
          class: "map__city-circle map__circle",
          r: 4,
          cx: d => map.latLngToLayerPoint(d).x,
          cy: d => map.latLngToLayerPoint(d).y,
          cursor:"pointer"
        })
        .on("mouseover", function(d){
          const circlePos = d3.select(this).node().getBBox();

          mapTooltip.position([circlePos.x + circlePos.width, circlePos.y + circlePos.height])
            .text([
              ["Location: ", `(${formatCoordinates(d.lat)}, ${formatCoordinates(d.lon)})`],
              ["Time Submitted: ", `${formatTime(d.time)}`],
              ["Sampling Place: ", `${d.sampling_place}`]
              
            ])
            .draw();
          console.log(d);
        })
        .on("mousemove", () => {
          //mapTooltip.position(getPositionOnPage()).update();
        })
        .on("mouseout", () => {
          mapTooltip.remove();
        });

      overlayCircles.exit().remove();
    }

  };

export default citiesLayer;