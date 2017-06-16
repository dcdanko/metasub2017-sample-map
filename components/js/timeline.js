import {getObjectWithPropMethods} from "./visualization-components/utils";
import axes from "./visualization-components/histogram/axes";
import line from "./visualization-components/lineChart/line";
import slider from "./visualization-components/slider/slider";

const props = getObjectWithPropMethods([
  "selection",
  "data",
  "width",
  "position",
  "time",
  "drag",
  "xValue",
  "yValue",
  "xScale",
  "yScale"
]);

const methods = {
  drawSVG(){
    const {selection} = this.props();
    this._.svg = selection.append("svg")
    .attrs({
      class:"timeline"
    })
    .styles({
        position: "absolute",
        "z-index":900,
        left: `${0}px`,
        bottom: `${0}px`,
        "pointer-events":"none"
      });
  },
  drawAxes(){
    const {svg} = this.props();
    this._.axes = axes()
      .selection(svg)
      .draw();
    const {xAxis, yAxis} = this._.axes.props();
    xAxis.attr("class", "timeline__axis");
    yAxis.attr("class", "timeline__axis");
  },
  updateAxes(){
    const {axes, xScale, yScale} = this.props();
      axes
        .xScale(xScale)
        .yScale(yScale)
        .updateAxes();
  },
  drawLine(){
    const {svg, xScale, yScale, data} = this.props();
    this._.line = line()
      .data(data)
      .xValue(d => d.x1)
      .yValue(d => d.length)
      .xScale(xScale)
      .yScale(yScale)
      .selection(svg)
      .draw();
  },
  updateLine(){
    const {line, xScale, yScale, data} = this.props();
    line
      .data(data)
      .xScale(xScale)
      .yScale(yScale)
      .draw();
  },
  resizeLine(){
    const {line, yScale, xScale} = this.props();
    line.xScale(xScale)
      .yScale(yScale)
      .resize();
  },
  drawSlider(){
    const {svg, drag, time} = this.props();
    this._.slider = slider()
      .currentValue(time)
      .drag(drag)
      .selection(svg)
      .draw();
  },
  updateSliderTime(){
    const {slider, time} =this.props();
    slider
      .currentValue(time)
      .updateCurrentValue();
  },

  resizeSlider(){
    const {slider, xScale, height, padding} = this.props();
    slider
      .padding(padding)
      .height(height)
      .xScale(xScale)
      .setSliderSize();
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
    xScale.range([padding.left, width - padding.right]).clamp(true);
    yScale.range([height - padding.bottom, padding.top]);
  },
  resizeAxes(){
    const {axes, yScale, padding, xScale, height} = this.props();
    axes.padding(padding)
      //WHY HEIGHT? SHOULD THIS BE PADDING? POSITION?
      .height(height)
      .yScale(yScale)
      .xScale(xScale)
      .setSize();
  },

  setHeightFromRatio(){
    const {heightWidthRatio, width, minHeight} = this.props();
    if (heightWidthRatio * width > minHeight){
      this._.height = heightWidthRatio * width;
    }else{
      this._.height = minHeight;
    }
    

  },
  draw(){
    this.drawSVG();
    this.setHeightFromRatio();
    this.setScales();
    this.drawAxes();
    this.drawLine();
    this.drawSlider();

    this.updateSize();

    return this;
  },
  updateSize(){
    this.setHeightFromRatio();
    this.setScales();
    this.resizeSVG();
    this.resizeAxes();
    this.resizeLine();
    this.resizeSlider();
  },
  updateView(){
    console.log("UPDATE VIEW");
    this.setScales();
    this.updateAxes();
    this.updateLine();
    this.resizeSlider();
  },
  updateTime(){
    this.updateSliderTime();
  }
};

const timeline = () => {
  const defaultProps = {_:{
      position: {left: 0, bottom:0},
      padding: {left: 35, bottom:40, right:15, top:10},
      textMargin: {left:10, top:15},
      width:800,
      minHeight: 200,
      heightWidthRatio:.2,
      xScale: d3.scaleTime(),
      yScale: d3.scaleLinear()
    }
  };
  return Object.assign(defaultProps, props, methods);
};

export default timeline;