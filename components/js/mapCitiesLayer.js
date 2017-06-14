import mapOverlayLayer from "./visualization-components/mapOverlay/mapOverlayLayer";
//import tooltip from "./visualization-components/tooltip/tooltip.js";

const citiesLayer = mapOverlayLayer()
  .type("Point")
  .name("cities")
  .render("Vector")
  .addPropMethods(["onCityClick", "view","time", "radiusScale"])
  .draw(function(){
    const {data, group, view, map,  onCityClick} = this.props();

    group.selectAll(".map__circle").remove();

    if (view.view === "world"){
      this._.overlayCircles = group.selectAll(".map__city-circle")
        .data(data)
        .enter()
        .append("circle")
        //make setAttributes function to avoid code duplication
        .attrs({
          class: "map__city-circle map__circle",
          //r: d => d.hasOwnProperty("sampleCount") ? radiusScale(d.sampleCount) : 2,
          cx: d => map.latLngToLayerPoint(d).x,
          cy: d => map.latLngToLayerPoint(d).y,
          cursor:"pointer"
        })
        .classed("map__city-circle--inactive", d => d.live ? false : true)
        .on("click", onCityClick);
    }else if (view.view === "city"){
      this._.overlayCircles = group.selectAll(".map__city-circle")
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

    this.updateTime();

    return this;
  });

citiesLayer.updateTime = function(){
    const {data, overlayCircles, radiusScale, view, time} = this.props();
    // console.log("UPDATE MAP TIME");
    // console.log(time);
    //DON'T RESET SCALE, JUST GET SAMPLE COUNT

    
    if (view.view === "world"){
      overlayCircles.attrs({
        r: d => d.hasOwnProperty("sampleCount") ? radiusScale(d.getCurrentSampleCount(time)) : 2
      });
    }

  };

export default citiesLayer;