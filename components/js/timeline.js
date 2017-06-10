import { getObjectWithPropMethods } from "./visualization-components/utils";

const props = getObjectWithPropMethods([
  "selection"
]);

const methods = {
  draw(){
    const {selection} = this.props();
    selection.append("svg")
    .styles({
        position: "absolute",
        "z-index":900,
        left: `${0}px`,
        bottom: `${0}px`,
        width: `${selection.node().getBoundingClientRect().width}px`,
        height: "100px",
        "pointer-events":"none",
        background:"darkgrey"
      });
    return this;
  },
  setSize(){

  }
};

const timeline = () => {
  const defaultProps = {_:{}};
  return Object.assign(defaultProps, props, methods);
};

export default timeline;