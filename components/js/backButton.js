/* eslint-disable */

import {getObjectWithPropMethods} from "./visualization-components/utils";

const props = getObjectWithPropMethods([
  "selection",
  "onClick"
]);

const methods = {
  draw(){
    const {selection, onClick} = this.props();
    selection.append("span")
      .attrs({
        class: "back-button"
      })
      .on("click", onClick)
      .text("Back");
    return this;
  },
  remove(){
    const {selection} = this.props();
    selection.selectAll(".back-button").remove();
  }
};

const button = () => {
  const defaultProps = {_:{

    }
  };
  return Object.assign(defaultProps, props, methods);
};

export default button;