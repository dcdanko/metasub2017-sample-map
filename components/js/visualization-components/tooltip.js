import ChainableObject from './chainableObject';

class Tooltip extends ChainableObject {
  constructor() {
    super(['selection', 'text', 'position', 'div']);
    this.defaultProps({
      styles: {
        tooltip: {
          color: 'black',
          'font-weight': 'normal',
          'font-size': '.8em',
          'line-height': '1.5em',
          background: 'rgba(255,255,255,.7)',
          'padding-left': '10px',
          'padding-right': '10px',
          'padding-top': '4px',
          'padding-bottom': '4px',
          'border-radius': '5px',
          'min-width': '250px',
        },
        titles: { 'font-weight': 'bold' },
      },
    });
  }
  styles(...args) {
    const customStyles = args[0];
    if (args.length === 0) {
      return this._.styles;
    }
    Object.assign(this._.styles.tooltip, customStyles.tooltip);
    Object.assign(this._.styles.titles, customStyles.titles);
    return this;
  }
  draw() {
    const { selection, text, position, styles } = this.props();
    this._.div = selection.append('div')
    // .classed("tooltip", true)
    .styles({
      position: 'absolute',
      left: `${position[0]}px`,
      top: `${position[1]}px`,
      'pointer-events': 'none',
      'z-index': 950,
      class: 'tooltip',
      opacity: 0,
    })
    .styles(styles.tooltip);

    const { div } = this.props();

    div.selectAll('.tooltip-text-row')
      .data(text)
      .enter()
      .append('div')
      // .classed("tooltip-text-row", true)
      .each(function tooltipTextRow(d) {
        d3.select(this)
          .append('span')
          .classed('tooltip__title', true)
          .styles(styles.titles)
          .text(d[0]);
        d3.select(this).append('span').text(d[1]);
      });

    div.transition().duration(0)
        .style('opacity', 1);

    return this;
  }
  update() {
    const { div, position } = this.props();
    div.styles({
      left: `${position[0]}px`,
      top: `${position[1]}px`,
    });
    return this;
  }
  remove() {
    const { div } = this.props();
    if (div !== undefined) {
      div.transition().duration(0).style('opacity', 0).remove();
    }
  }
}

export default Tooltip;
