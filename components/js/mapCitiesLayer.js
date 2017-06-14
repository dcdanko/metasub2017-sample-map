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
        .on("click", d => d.live && d.features.length > 0 ? onCityClick(d) : console.log(d))
        .on("mouseover", d => {console.log(d);});
    }

    this.updateTime();

    return this;
  });

citiesLayer.updateTime = function(){
    const {view, time} = this.props();
    // console.log("UPDATE MAP TIME");
    // console.log(time);
    //DON'T RESET SCALE, JUST GET SAMPLE COUNT

    
    if (view.view === "world"){
      const {overlayCircles, radiusScale} = this.props();
      overlayCircles.attrs({
        r: d => d.hasOwnProperty("sampleCount") ? radiusScale(d.getCurrentSampleCount(time)) : 2
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
        .on("mouseover", d => {console.log(d);});
      overlayCircles.exit().remove();
    }

  };

export default citiesLayer;