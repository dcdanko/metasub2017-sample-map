import { getObjectWithPropMethods } from "./visualization-components/utils";

import {slider} from "./visualization-components/slider/slider";

const props = getObjectWithPropMethods([
  "selection",
  "data",
  "width",
  "time"
]);

const methods = {
  draw(){
    //set height from ratio, drawSVG, setScales, drawLines, drawAxes, drawSlider
    this.drawSVG();
    
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
  resizeSVG(){
    const {svg, height, width} = this.props();
    svg.styles({
      width: `${width}px`,
      height: `${height}px`
    });
  },
  setHeightFromRatio(){
    const {heightWidthRatio, width} = this.props();
    this._.height = heightWidthRatio * width;
  },
  updateSize(){
    this.setHeightFromRatio();
    this.resizeSVG();
  }
};

const timeline = () => {
  const defaultProps = {_:{
      position: {left: 0, bottom:0},
      padding: {left: 0, bottom:0, right:0, top:0},
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