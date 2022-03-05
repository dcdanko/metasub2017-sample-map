import ChainableObject from './chainableObject';

class State extends ChainableObject {
  constructor(defaultValues) {
    super(['callbacks', ...Object.keys(defaultValues)]);

    this._ = {
      callbacks: {},
    };

    Object.keys(defaultValues).forEach((field) => {
      this._.callbacks[field] = [];
    });

    Object.assign(this._, defaultValues);
  }
  registerCallback(newCallbacks) {
    const { callbacks } = this.props();
    Object.keys(newCallbacks).forEach((field) => {
      callbacks[field].push(newCallbacks[field]);
    });
    return this;
  }
  update(newValues) {
    const { callbacks } = this.props();
    const changedFields = Object.keys(newValues);
    // update values
    changedFields.forEach(field => this[field](newValues[field]));
    // fire callbacks
    changedFields.forEach((field) => {
      if (callbacks[field].length > 0) {
        callbacks[field].forEach(callback => callback.call(this));
      }
    });

    return this;
  }
}


export default State;
