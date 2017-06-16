import mapOverlayLayer from "./visualization-components/mapOverlay/mapOverlayLayer";
import tooltip from "./visualization-components/tooltip/tooltip.js";

const mapTooltip = tooltip().selection(d3.select("body"));
const getPositionOnPage = () => [d3.event.pageX, d3.event.pageY];

const citiesLayer = mapOverlayLayer()
  .type("Point")
  .name("cities")
  .render("Vector")
  .addPropMethods(["onCityClick", "view","time", "startTime", "radiusScale"])
  .draw(function(){
    const {data, group, view, map, onCityClick} = this.props();

    group.selectAll(".map__circle").remove();

    if (view.view === "world"){
      this._.overlayCircles = group.selectAll(".map__city-circle")
        .data(data.filter(d => d.live))
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
        
        .on("mousemove", () => {
          mapTooltip.position(getPositionOnPage()).update();
        })
        .on("mouseout", () => {
          mapTooltip.remove();
        });
      this._.inactiveCircles = group.selectAll(".map__city-circle--inactive")
        .data(data.filter(d => !d.live))
        .enter()
        .append("circle")
        .attrs({
          class: "map__city-circle--inactive map__circle",
          r:2
        });
    }

    this.updateTime();

    return this;
  });

const formatTime =  d3.timeFormat("%m/%d/%Y");

citiesLayer.updateTime = function(){
    const {view, time, startTime} = this.props();
    
    if (view.view === "world"){
      const {overlayCircles, radiusScale} = this.props();
      overlayCircles.attrs({
        r: d => radiusScale(d.getCurrentSampleCount(time))
      })
      .on("mouseover", (d) => {
          console.log(d);
          mapTooltip.position(getPositionOnPage())
            .text([
              ["Location: ", `${d.name_full}`],
              ["Time Period: ", `${formatTime(startTime)} - ${formatTime(time)}`],
              ["Samples Taken: ", `${d.getCurrentSampleCount(time)}`]
            ])
            .draw();
        });
    }else if (view.view === "city"){
      const {data, group, map} = this.props();
      this._.overlayCircles = group.selectAll(".map__city-circle")
        .data(data.getCurrentSamples(time));
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
        .on("mouseover", d => {
          mapTooltip.position(getPositionOnPage())
            .text([
              ["Sampling Place: ", `${d.sampling_place}`],
              ["Time Submitted: ", `${formatTime(d.time)}`]
            ])
            .draw();
        })
        .on("mousemove", () => {
          mapTooltip.position(getPositionOnPage()).update();
        })
        .on("mouseout", () => {
          mapTooltip.remove();
        });

      overlayCircles.exit().remove();
    }

  };

export default citiesLayer;