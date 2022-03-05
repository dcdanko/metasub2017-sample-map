import {getObjectWithPropMethods} from "../utils";

const props = getObjectWithPropMethods([
  "titleText",
  "readoutText",
  "textContainer",
  "position",
  "selection"
]);

const methods = {
  draw(){
    const {selection, titleText} = this.props();
    this._.textContainer = selection.append("div")
      .attr("class", "histogram__text")
      .styles({
        position:"absolute",
        "pointer-events":"none",
        // top: "15px",
        // left: "15px",
        "z-index":1500
      });

    const {textContainer} = this.props();

    this._.titleDiv = textContainer
      .append("div")
      .attr("class", "histogram__text--title")
      .text(titleText);

    this._.readoutDiv = textContainer
      .append("div")
      .attr("class", "histogram__text--readout");

    this.updatePosition();
    this.updateReadout();

    return this;
  },
  updatePosition(){
    const {textContainer, position} = this.props();
    textContainer.styles({
      bottom: `${position.bottom}px`,
      left: `${position.left}px`
    });
  },
  updateReadout(){
    const {readoutText, readoutDiv} = this.props();
    readoutDiv.text(readoutText);
  }
};

const textOverlay = () => {
  const defaultProps = {_:{
    titleText: "TITLE TEXT",
    readoutText: "Readout Text"
  }};
  return Object.assign(defaultProps, props, methods);
};

export default textOverlay;