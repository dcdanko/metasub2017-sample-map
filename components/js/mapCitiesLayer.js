import mapOverlayLayer from "./visualization-components/mapOverlay/mapOverlayLayer";
//import tooltip from "./visualization-components/tooltip/tooltip.js";

const citiesLayer = mapOverlayLayer()
  .type("Point")
  .name("cities")
  .render("Vector")

  .draw(function(){
    const {data, group, map} = this.props();

    group.append("g").selectAll(".city")
      .data(data.features)
      .enter()
      .append("circle")
      .attrs({
        class: "city",
        r: d => d.hasOwnProperty("sampleCount") ? data.radiusScale(d.sampleCount) : 2,
        fill:d => d.live ? "red" : "orange",
        cx: d => map.latLngToLayerPoint(d).x,
        cy: d => map.latLngToLayerPoint(d).y,
        cursor:"pointer"
      })
      .on("mouseover", d => {console.log(d);});

    return this;
  });

export default citiesLayer;