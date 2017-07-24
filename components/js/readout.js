import ChainableObject from './visualization-components/chainableObject';

class Readout extends ChainableObject {
  constructor() {
    super([
      'position',
      'total',
      'metadataFilter',
      'location',
      'time',
      'startTime',
      'selection',
    ]);
    this.defaultProps({
      position: { left: 0, bottom: 150 },
      total: 0,
      location: 'Worldwide',
    });
  }
  draw() {
    const { selection } = this.props();

    this._.readoutText = selection.append('div')
      .attrs({
        class: 'map-readout',
      });

    this.update();
    return this;
  }
  update() {
    // add time, starttime...
    const { readoutText, total, location, position } = this.props();
    let samplesTaken;
    if (total === 1) {
      samplesTaken = 'Sample Taken';
    } else {
      samplesTaken = 'Samples Taken';
    }
    readoutText.styles({
      bottom: `${position.bottom + 10}px`,
    })
    .text(`${total} ${samplesTaken} ${location}`);
  }
}


export default Readout;
