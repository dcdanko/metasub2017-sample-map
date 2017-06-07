import mapOverlayLayer from "./visualization-components/mapOverlay/mapOverlayLayer";
//import tooltip from "./visualization-components/tooltip/tooltip.js";

const citiesLayer = mapOverlayLayer()
  .type("Point")
  .name("cities")
  .render("Vector")
  .addPropMethods(["map"])
  .draw(function(){
    const {data, group, geo,map} = this.props();
    console.log(map);
    group.append("g").selectAll(".city")
      .data(data)
      .enter()
      .append("circle")
      .attrs({
        class: "city",
        r:5,
        fill:"red",
        cx: d => map.latLngToLayerPoint(d).x,
      cy: d => map.latLngToLayerPoint(d).y
      });

    return this;
  });

export default citiesLayer;