import { getObjectWithPropMethods } from '../utils';


const props = getObjectWithPropMethods(['padding', 'width', 'height', 'heightWidthRatio', 'svg', 'xValue', 'yValue', 'xScale', 'yScale', 'yAxis', 'data', 'bars', 'barSpacing', 'barWidth', 'updateCurrentValue', 'currentValue']);

const methods = {
  draw() {
    const { svg, data } = this.props();

    const bars = svg.append('g').selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attrs({
        class: 'bar',
        cursor: 'pointer',
        'pointer-events': 'auto',
      })
      .on('mouseover', (d) => { console.log(d); })
      .styles({

      });
    this.bars(bars);
    this.updateCurrentValue();
    return this;
  },

  setSize() {
    const { data, padding, width, height, barSpacing, bars, yValue, yScale } = this.props();
    const barWidth = ((width - padding.left - padding.right) / (data.length - 1)) - barSpacing;
    bars.attrs({
      width: barWidth,
      height: d => height - yScale(yValue(d)) - padding.top - padding.bottom,
      x: (d, i) => (barWidth + barSpacing) * i + padding.left,
      y: d => yScale(yValue(d)) + padding.top,
    });
  },
  updateSize() {
    this.setSize();
  },
  updateCurrentValue() {
    const { currentValue, bars } = this.props();
    bars.classed('bar--selected', d => d.date <= currentValue);
  },
};

const histogramBars = () => {
  const defaultProps = { _: {
    barSpacing: 2,
  } };
  return Object.assign(defaultProps, props, methods);
};

export default histogramBars;
