import Props from './props';

const props = new Props([
  'width',
  'height',
  'selection',
  'xScale',
  'xAxis',
  'slider',
  'handle',
  'drag',
  'currentValue',
  'handleAttrs',
  'padding',
]);

props.setDefaultValues({
  handleAttrs: {
    class: 'slider-circle',
    'pointer-events': 'none',
    r: 8,
    fill: 'black',
    stroke: 'white',
    'stroke-width': 2,
  },
});

class Slider {
  constructor() {
    props.addTo(this);
  }
  draw() {
    this.drawSlider();
    this.drawHandle();
    return this;
  }

  drawSlider() {
    const { selection } = this.props();
    const slider = selection.append('g')
      .append('line')
      .attrs({
        class: 'track_overlay',
        'stroke-width': 50,
        opacity: '0',
        stroke: 'red',
        'pointer-events': 'stroke',
        cursor: 'pointer',
      });

    this.slider(slider);
  }
  drawHandle() {
    const { selection, handleAttrs } = this.props();

    const handle = selection.append('circle')
      .attrs(handleAttrs);
    this.handle(handle);
  }
  setHandlePosition() {
    const { currentValue, xScale, handle, height, padding } = this.props();
    const xPos = xScale(currentValue);
    handle.attrs({
      cx: xPos,
      cy: height - padding.bottom,
    });
  }
  updateCurrentValue() {
    this.setHandlePosition();
  }
  setSliderSize() {
    this.setTrackSize();
    this.setHandlePosition();
  }

  setTrackSize() {
    const { height, padding, slider, xScale, drag } = this.props();

    slider.attrs({
      x1: xScale.range()[0],
      x2: xScale.range()[1],
      transform: `translate(${0},${height - padding.bottom})`,
    })
    .call(d3.drag()
      .on('start.interrupt', () => {
        slider.interrupt();
      })
      .on('start drag', () => {
        const newDate = xScale.invert(d3.event.x);
        drag(newDate);
      }));
  }
}

export default Slider;
