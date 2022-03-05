class Props {
  constructor(fields) {
    this.addProps = function addProps(newFields) {
      newFields.forEach((field) => {
        this[field] = function addGetterSetters(...args) {
          if (args.length === 0) {
            return this._[field];
          }
          this._[field] = args[0];
          return this;
        };
      });
    };


    this.addProps(fields);

    this.props = function props() {
      return this._;
    };

    this.defaultValues = {};
  }
  setDefaultValues(defaults) {
    Object.assign(this.defaultValues, defaults);
    return this;
  }
  addTo(target) {
    const localProps = Object.assign({}, this.defaultValues);
    Object.assign(target, { _: localProps }, this);
  }
}

export default Props;
