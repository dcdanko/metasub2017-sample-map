import {getObjectWithPropMethods} from "../utils";


const props = getObjectWithPropMethods(["selectedSlice","text"]);

const innerTextProps = getObjectWithPropMethods(["width", "position", "title"]);

const methods = {
  updateText(){
    const {container} = this.props();

    container.selectAll(".pie__row").remove();
    
    this.drawText();

  },
  drawText(){
    const {container, text, selectedSlice} = this.props();

    container.selectAll(".pie__row")
      .data(text)
      .enter()
      .append("div")
      .attr("class", "pie__text pie__row")
      .each(function(d){
        d3.select(this)
          .selectAll("span")
          .data(d)
          .enter()
          .append("span")
          .classed("pie__text--bold", (d,i) => i === 0 ? true : false)
          .text(textItem => {
            if (typeof textItem === "function"){
              return textItem(selectedSlice);
            }else{
              return textItem;
            }
          });
      });
  }
};

const outerTextMethods = {
  addTo(container){
    this._.container = container;
    this.drawText();
    return this;
  }
  
};

const innerTextMethods = {
  addTo(container){
    this._.container = container;
    this.setPosition();
    this.drawTitle();
    this.drawText();

    return this;
  },
  drawTitle(){
    const {container, title} = this.props();
    container.append("div")
			.attr("class", "pie__title pie__text")
			.styles({
				"margin-bottom":"15px",
				"text-align": "center",
				"line-height":"25px"
			})
			.text(title);
  },

  
  setPosition(){
    const {container, position, width} = this.props();
    container.styles({
      left: `${position}px`,
      top: `${position}px`,
      width: `${width}px`,
      height: `${width}px`,
      padding: "5px"
    });
  }
};

export const innerPieText = () => {
  const defaultProps = {_:{}};
  return Object.assign(defaultProps, props, methods, innerTextProps, innerTextMethods);
};

export const outerPieText = () => {
  const defaultProps = {_:{}};
  return Object.assign(defaultProps, props, methods, outerTextMethods);
};

export default innerPieText;