

import { getObjectWithPropMethods } from './visualization-components/utils';
import Axes from './visualization-components/histogram/axes';
import Line from './visualization-components/lineChart/line';
import Slider from './visualization-components/slider/slider';

const props = getObjectWithPropMethods([
  'selection',
  'data',
  'width',
  'height',
  'position',
  'time',
  'drag',
  'xValue',
  'yValue',
  'xScale',
  'yScale',
  'padding',
]);

const methods = {
  drawSVG() {
    const { selection } = this.props();
    this._.svg = selection.append('svg')
    .attrs({
      class: 'timeline',
    })
    .styles({
      position: 'absolute',
      'z-index': 900,
      left: `${0}px`,
      bottom: `${0}px`,
      'pointer-events': 'none',
    });
  },
  drawYAxisLabel() {
    const { svg, padding } = this.props();
    svg.append('text').attrs({
      x: padding.left + 30,
      y: 30,
      class: 'timeline__label',
    })
    .text('samples per hour');
  },
  drawAxes() {
    const { svg } = this.props();
    this._.axes = Axes()
      .selection(svg)
      .draw();
    const { xAxis, yAxis } = this._.axes.props();
    xAxis.attr('class', 'timeline__axis');
    yAxis.attr('class', 'timeline__axis');
  },
  updateAxes() {
    const { axes, xScale, yScale } = this.props();
    axes
        .xScale(xScale)
        .yScale(yScale)
        .updateAxes();
  },
  drawLine() {
    const { svg, xScale, yScale, data } = this.props();
    this._.line = Line()
      .data(data)
      .xValue(d => d.x1)
      .yValue(d => d.length)
      .xScale(xScale)
      .yScale(yScale)
      .selection(svg.append('g'))
      .draw();
  },
  updateLine() {
    const { line, xScale, yScale, data } = this.props();
    line
      .data(data)
      .xScale(xScale)
      .yScale(yScale)
      .draw();
  },
  resizeLine() {
    const { line, yScale, xScale } = this.props();
    line.xScale(xScale)
      .yScale(yScale)
      .resize();
  },
  drawSlider() {
    const { svg, drag, time } = this.props();
    this._.slider = Slider()
      .currentValue(time)
      .drag(drag)
      .selection(svg)
      .draw();
  },
  updateSliderTime() {
    const { slider, time } = this.props();
    slider
      .currentValue(time)
      .updateCurrentValue();
  },

  resizeSlider() {
    const { slider, xScale, height, padding } = this.props();
    slider
      .padding(padding)
      .height(height)
      .xScale(xScale)
      .setSliderSize();
  },

  resizeSVG() {
    const { svg, height, width } = this.props();
    svg.styles({
      width: `${width}px`,
      height: `${height}px`,
    });
  },
  setScales() {
    const { xScale, yScale, height, width, padding } = this.props();
    xScale.range([padding.left, width - padding.right]).clamp(true);
    yScale.range([height - padding.bottom, padding.top]);
  },
  resizeAxes() {
    const { axes, yScale, padding, xScale, height } = this.props();
    axes.padding(padding)
      // WHY HEIGHT? SHOULD THIS BE PADDING? POSITION?
      .height(height)
      .yScale(yScale)
      .xScale(xScale)
      .setSize();
  },

  setHeightFromRatio() {
    const { heightWidthRatio, width, minHeight } = this.props();
    if (heightWidthRatio * width > minHeight) {
      this._.height = heightWidthRatio * width;
    } else {
      this._.height = minHeight;
    }
  },
  draw() {
    this.drawSVG();
    this.setHeightFromRatio();
    this.setScales();
    this.drawAxes();
    this.drawLine();
    this.drawSlider();
    this.drawYAxisLabel();

    this.updateSize();

    return this;
  },
  updateSize() {
    this.setHeightFromRatio();
    this.setScales();
    this.resizeSVG();
    this.resizeAxes();
    this.resizeLine();
    this.resizeSlider();
  },
  updateView() {
    console.log('UPDATE VIEW');
    this.setScales();
    this.updateAxes();
    this.updateLine();
    this.resizeSlider();
  },
  updateTime() {
    this.updateSliderTime();
  },
};

const timeline = () => {
  const defaultProps = { _: {
    position: { left: 0, bottom: 0 },
    padding: { left: 65, bottom: 40, right: 65, top: 10 },
    textMargin: { left: 10, top: 15 },
    width: 800,
    minHeight: 150,
    heightWidthRatio: 0.15,
    xScale: d3.scaleTime(),
    yScale: d3.scaleLinear(),
  },
  };
  return Object.assign(defaultProps, props, methods);
};

export default timeline;
