import {getObjectWithPropMethods} from "./visualization-components/utils";
import axes from "./visualization-components/histogram/axes";

import slider from "./visualization-components/slider/slider";

const props = getObjectWithPropMethods([
  "selection",
  "data",
  "width",
  "time",
  "drag",
  "xValue",
  "yValue",
  "xScale",
  "yScale"
]);

const methods = {
  draw(){
    this.drawSVG();
    this.setHeightFromRatio();
    this.setScales();
    this.drawAxes();

    this.updateSize();

    
    

    return this;
  },
  drawSVG(){
    const {selection} = this.props();
    this._.svg = selection.append("svg")
    .styles({
        position: "absolute",
        "z-index":900,
        left: `${0}px`,
        bottom: `${0}px`,
        "pointer-events":"none",
        background:"darkgrey"
      });
  },
  drawAxes(){
    const {svg} = this.props();
    this._.axes = axes()
      .selection(svg)
      .draw();
  },
  drawLine(){

  },
  drawSlider(){

  },

  resizeSVG(){
    const {svg, height, width} = this.props();
    svg.styles({
      width: `${width}px`,
      height: `${height}px`
    });
  },
  setScales(){
    const {xScale, yScale, height, width, padding} = this.props();
    xScale.range([padding.left, width - padding.right]);
    yScale.range([height - padding.bottom, padding.top]);
  },
  resizeAxes(){
    const {axes, yScale, padding, xScale, height} = this.props();
    axes.padding(padding)
      .height(height)
      .yScale(yScale)
      .xScale(xScale)
      .setSize();
  },
  resizeLine(){

  },
  setHeightFromRatio(){
    const {heightWidthRatio, width} = this.props();
    this._.height = heightWidthRatio * width;
  },
  updateSize(){
    this.setHeightFromRatio();
    this.setScales();
    this.resizeSVG();
    this.resizeAxes();
  },
  updateView(){

  }
};

const timeline = () => {
  const defaultProps = {_:{
      position: {left: 0, bottom:0},
      padding: {left: 35, bottom:30, right:15, top:10},
      textMargin: {left:10, top:15},
      width:800,
      heightWidthRatio:.2,
      xScale: d3.scaleTime(),
      yScale: d3.scaleLinear()
    }
  };
  return Object.assign(defaultProps, props, methods);
};

export default timeline;