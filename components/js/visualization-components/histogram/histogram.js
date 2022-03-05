import { getObjectWithPropMethods } from '../utils';
import slider from '../slider/slider';
import bars from './bars';
import axes from '../axes';
// import titleTextOverlay from "./titleTextOverlay";

const props = getObjectWithPropMethods([
  'selection',
  'position',
  'padding',
  'width',

  'heightWidthRatio',
  'xValue',
  'yValue',
  'data',
  'bars',
  'barWidth',
  'drag',
  'date',
  'background',
  'textMargin',
  'title',
  'textReadout',
]);


const methods = {
  drawSVG() {
    const { selection, position } = this.props();
    this._.svg = selection.append('svg')
      .styles({
        position: 'absolute',
        'z-index': 900,
        left: `${position.left}px`,
        bottom: `${position.bottom}px`,
        'pointer-events': 'none',
      });

    const { svg } = this.props();

    this._.background = svg.append('rect')
      .attrs({
        class: 'histogram_background',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
  },
  drawBars() {
    const { svg, data, yValue, date } = this.props();
    this._.bars = bars().data(data)
        .currentValue(date)
        .svg(svg)
        .yValue(yValue)
        .draw();
  },
  setBarSize() {
    const { bars, padding, width, height, yScale } = this.props();
    bars.padding(padding)
        .width(width)
        .height(height)
        .yScale(yScale)
        .setSize();
  },
  drawAxes() {
    const { svg } = this.props();
    this._.axes = axes()
      .svg(svg)
      .draw();
  },
  // drawText(){
  //   const {selection, height, padding, textMargin} = this.props();
  //   this._.titleTextOverlay = titleTextOverlay()
  //     .selection(selection)
  //     .position({
  //       bottom: height - padding.top - textMargin.top,
  //       left: padding.left + textMargin.left
  //     })
  //     .titleText("Kit Submissions per Week")
  //     .draw();
  // },

  setAxesSize() {
    const { axes, yScale, padding, xScale, height } = this.props();
    axes.padding(padding)
      .height(height)
      .yScale(yScale)
      .xScale(xScale)
      .setSize();
  },

  drawSlider() {
    const { svg, drag, date } = this.props();

    this._.slider = slider()
      .currentValue(date)
      .drag(drag)
      .svg(svg)
      .draw();
  },
  setSliderSize() {
    const { slider, xScale, height, padding } = this.props();
    slider
        .padding(padding)
        .height(height)
        .xScale(xScale)
        .setSliderSize();
  },
  setHeightFromRatio() {
    const { width, heightWidthRatio } = this.props();
    this._.height = (width * heightWidthRatio);
  },

  setScales() {
    const { data, xValue, yValue, xScale, yScale, height, width, padding } = this.props();

    xScale
      .domain(d3.extent(data, d => xValue(d)))
      .range([padding.left, width - padding.right])
      .clamp(true);

    yScale
      .domain(d3.extent(data, d => yValue(d)))
      .range([height - padding.top - padding.bottom, 0]);
  },

  setSVGSize() {
    const { svg, width, height, background } = this.props();
    svg.styles({
      width: `${width}px`,
      height: `${height}px`,
    });
    background.styles({
      width: `${width}px`,
      height: `${height}px`,
    });
  },


  addTo(selection) {
    this._.selection = selection;

    this.setHeightFromRatio();
    this.drawSVG();
    this.setScales();
    this.drawBars();
    this.drawAxes();
    this.drawSlider();
    // this.drawText();

    this.resizeComponents();
    return this;
  },
  resizeComponents() {
    this.setSVGSize();
    this.setBarSize();
    this.setAxesSize();
    this.setSliderSize();
  },
  updateSize() {
    this.setHeightFromRatio();
    this.setScales();

    this.resizeComponents();
  },
  updateDate() {
    const { date, slider, bars } = this.props();
    slider
      .currentValue(date)
      .updateCurrentValue();
    bars
      .currentValue(date)
      .updateCurrentValue();

    // titleTextOverlay
    //   .readoutText("something new")
    //   .updateReadout();
  },
};

const histogram = () => {
  const defaultProps = { _: {
    position: { left: 0, bottom: 0 },
    padding: { left: 0, bottom: 0, right: 0, top: 0 },
    textMargin: { left: 10, top: 15 },
    width: 800,
    heightWidthRatio: 0.2,
    xScale: d3.scaleTime(),
    yScale: d3.scaleLinear(),
  },
  };
  return Object.assign(defaultProps, props, methods);
};

export default histogram;
