import Props from '../props';

const props = new Props([
  'geo',
  'group',
  'pane',
  'data',
  'type',
  'render',
  'name',
  'map',
  'svg',
  'refreshMap',
]);


class OverlayLayer {
  constructor() {
    props.addTo(this);
  }
  draw(drawMethod) {
    Object.assign(this, { draw: drawMethod });
    return this;
  }
  update(updateMethod) {
    Object.assign(this, { update: updateMethod });
    return this;
  }
  remove(removeMethod) {
    Object.assign(this, { remove: removeMethod });
    return this;
  }
  addPropMethods(propNames) {
    this.addProps(propNames);
    return this;
  }
}

export default OverlayLayer;
