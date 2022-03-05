import Props from './props';

const props = new Props([
  'selection',
  'data',
  'xScale',
  'yScale',
  'xValue',
  'yValue',
]);


class Line {
  constructor() {
    props.addTo(this);
  }
  draw() {
    const { selection, data } = this.props();
    selection.selectAll('.timeline__line')
      .transition()
      .duration(500)
      .attrs({
        opacity: 0,
      })
      .remove();

    selection.selectAll('.timeline__area')
      .transition()
      .duration(500)
      .attrs({
        opacity: 0,
      })
      .remove();

    this._.lineGenerator = d3.line();
    this._.areaGenerator = d3.area();

    this._.line = selection.append('path')
      .datum(data)
      .attrs({
        class: 'timeline__line',
        opacity: 0,
      });

    this._.area = selection.append('path')
      .datum(data)
      .attrs({
        class: 'timeline__area',
        opacity: 0,
      });

    this.resize();

    this._.line.transition()
      .duration(500)
      .attrs({
        opacity: 1,
      });


    this._.area.transition()
      .duration(500)
      .attrs({
        opacity: 1,
      });


    return this;
  }
  resize() {
    const {
      line,
      area,
      xScale,
      yScale,
      xValue,
      yValue,
      lineGenerator,
      areaGenerator,
    } = this.props();

    lineGenerator
      .x(d => xScale(xValue(d)))
      .y(d => yScale(yValue(d)));

    areaGenerator
      .x(d => xScale(xValue(d)))
      .y1(d => yScale(yValue(d)))
      .y0(yScale(0));

    line.attrs({
      d: lineGenerator,
    });

    area.attrs({
      d: areaGenerator,
    });
  }
}

export default Line;
