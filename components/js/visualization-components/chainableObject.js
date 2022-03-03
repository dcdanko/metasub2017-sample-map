class ChainableObject {
  constructor(fields) {
    this.setChainableProps(fields);
    this._ = {};
  }
  props() {
    return this._;
  }
  setChainableProps(fields) {
    fields.forEach((field) => {
      this[field] = function addGetterSetters(...args) {
        if (args.length === 0) {
          return this._[field];
        }
        this._[field] = args[0];
        return this;
      };
    });
  }
  defaultProps(defaultProps) {
    Object.assign(this._, defaultProps);
  }
}


export default ChainableObject;
