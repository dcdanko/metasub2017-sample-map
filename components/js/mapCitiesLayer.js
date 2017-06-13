import mapOverlayLayer from "./visualization-components/mapOverlay/mapOverlayLayer";
//import tooltip from "./visualization-components/tooltip/tooltip.js";

const citiesLayer = mapOverlayLayer()
  .type("Point")
  .name("cities")
  .render("Vector")

  .draw(function(){
    const {data, group, map} = this.props();


    group.append("g").selectAll(".map__city-circle")
      .data(data.features)
      .enter()
      .append("circle")
      .attrs({
        class: "map__city-circle",
        r: d => d.hasOwnProperty("sampleCount") ? data.radiusScale(d.sampleCount) : 2,
        cx: d => map.latLngToLayerPoint(d).x,
        cy: d => map.latLngToLayerPoint(d).y,
        cursor:"pointer"
      })
      .classed("map__city-circle--inactive", d => d.live ? false : true)
      .on("mouseover", d => {console.log(d);});

    return this;
  });

export default citiesLayer;