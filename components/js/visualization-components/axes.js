import Props from './props';

const props = new Props([
  'selection',
  'yScale',
  'xScale',
  'padding',
  'yAxis',
  'xAxis',
  'height',
  'yAxisTicks',
  'hasYAxis',
  'xAxisTickFormat',
]);

props.setDefaultValues({
  yAxisTicks: 4,
  hasYAxis: true,
});


const getAxisLeft = ({ yScale, yAxisTicks }) => {
  let ticks;

  if (yScale.domain()[1] < yAxisTicks) {
    ticks = yScale.domain()[1];
  } else {
    ticks = yAxisTicks;
  }

  return d3.axisLeft(yScale).tickFormat(d3.format('d')).ticks(ticks);
};

const getAxisBottom = ({ xScale, xAxisTickFormat }) => {
  if (xAxisTickFormat !== undefined) {
    if (xScale.range()[1] <= 767) {
      return d3.axisBottom(xScale).tickFormat(xAxisTickFormat).ticks(4);
    }
    return d3.axisBottom(xScale).tickFormat(xAxisTickFormat);
  }
  if (xScale.range()[1] <= 767) {
    return d3.axisBottom(xScale).ticks(4);
  }
  return d3.axisBottom(xScale);
};

class Axes {
  constructor() {
    props.addTo(this);
  }
  draw() {
    const { selection, hasYAxis } = this.props();
    if (hasYAxis) {
      this._.yAxis = selection.append('g');
    }
    this._.xAxis = selection.append('g');
    return this;
  }
  setSize() {
    const { yAxis,
      yScale,
      padding,
      height,
      xAxis,
      xScale,
      yAxisTicks,
      hasYAxis,
      xAxisTickFormat,
    } = this.props();
    if (hasYAxis) {
      yAxis
      .attrs({
        transform: `translate(${padding.left},${0})`,
      })
      .call(getAxisLeft({ yScale, yAxisTicks }));
    }

    xAxis
      .attrs({
        transform: `translate(${0},${height - padding.bottom})`,
      })
      .call(getAxisBottom({ xScale, xAxisTickFormat }));
  }
  updateAxes() {
    const { xAxis,
      yAxis,
      xScale,
      yScale,
      yAxisTicks,
      hasYAxis,
      xAxisTickFormat,
    } = this.props();
    if (hasYAxis) {
      yAxis
        .transition()
        .duration(500)
        .call(getAxisLeft({ yScale, yAxisTicks }));
    }

    xAxis
      .transition()
      .duration(500)
      .call(getAxisBottom({ xScale, xAxisTickFormat }));
  }
}


export default Axes;
