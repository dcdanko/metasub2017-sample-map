import mapOverlayLayer from "./visualization-components/mapOverlay/mapOverlayLayer";
//import tooltip from "./visualization-components/tooltip/tooltip.js";

const citiesLayer = mapOverlayLayer()
  .type("Point")
  .name("cities")
  .render("Vector")
  .addPropMethods(["onCityClick", "view", "radiusScale", "updateTime"])
  .draw(function(){
    const {data, group, radiusScale, view, map, onCityClick} = this.props();

    group.selectAll(".map__circle").remove();

    if (view.view === "world"){
      group.selectAll(".map__city-circle")
        .data(data)
        .enter()
        .append("circle")
        //make setAttributes function to avoid code duplication
        .attrs({
          class: "map__city-circle map__circle",
          r: d => d.hasOwnProperty("sampleCount") ? radiusScale(d.sampleCount) : 2,
          cx: d => map.latLngToLayerPoint(d).x,
          cy: d => map.latLngToLayerPoint(d).y,
          cursor:"pointer"
        })
        .classed("map__city-circle--inactive", d => d.live ? false : true)
        .on("click", onCityClick);
    }else if (view.view === "city"){
      group.selectAll(".map__city-circle")
        .data(data)
        .enter()
        .append("circle")
        .attrs({
          class: "map__city-circle map__circle",
          r: 4,
          cx: d => map.latLngToLayerPoint(d).x,
          cy: d => map.latLngToLayerPoint(d).y,
          cursor:"pointer"
        })
        .on("mouseover", d => {console.log(d);});
    }

    

    return this;
  });

export default citiesLayer;