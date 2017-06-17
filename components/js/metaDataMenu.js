import {getObjectWithPropMethods} from "./visualization-components/utils";

const props = getObjectWithPropMethods([
  "selection",
  "data",
  "position",
  "onClick",
  "metaDataFilter",
  "metaDataCategory"
]);

const methods = {
  draw(){
    const {selection, data, position, metaDataFilter} = this.props();

    this._.menuContainer = selection.append("div")
      .attrs({
        class:"menu__container"
      });

    this.drawTitle();
    this.drawCategories();

    return this;
  },
  drawTitle(){
    const {menuContainer} = this.props();
  },
  drawCategories(){
    const {menuContainer, data} = this.props();
    console.log(data);
    this._.menuRows = this._.menuContainer
      .selectAll(".menu__row")
      .data(data)
      .enter()
      .append("div")
      .attrs({
        class: d => `menu__row menu__row--${d}`
      });

    this._.menuButtons = this._.menuRows
      .append("span")
      .attrs({
        class: "menu__button"
      })
      .text(d => d.category_label);
  },
  drawTypes(){

  },
  updateMetaData(){

  }
};

const metaDataMenu = () => {
  const defaultProps = {_:{
      position: {left: 25, top:100},
      padding: {left: 15, bottom:15, right:15, top:15},
      width:500
    }
  };
  return Object.assign(defaultProps, props, methods);
};

export default metaDataMenu;