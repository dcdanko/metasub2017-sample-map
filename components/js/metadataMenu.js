/* eslint-disable */

import {getObjectWithPropMethods} from "./visualization-components/utils";

const props = getObjectWithPropMethods([
  "selection",
  "data",
  //filteredData
  "position",
  "onClick",
  "metadataFilter",
  "currentFeatures",
  "time"
]);

const methods = {
  draw(){
    const {selection} = this.props();

    this._.titleContainer = selection.append("div")
      .attrs({
        class:"menu__title-container"
      });

    this._.menuContainer = selection.append("div")
      .attrs({
        class:"menu__container"
      });

    this.drawTitle();
    this.drawCategories();


    return this;
  },
  drawTitle(){
    const {titleContainer} = this.props();
    this._.menuTitle = titleContainer.append("div")
      .attrs({
        class: "menu__title"
      })
      .on("click", () => {
        const {isOpen} = this.props();
        this._.isOpen = !isOpen;
        this.updateOpenStatus();
      })
      .text("Filter Map by Metadata");
  },
  drawCategories(){
    const {menuContainer, data, onClick} = this.props();

    this._.menuRows = menuContainer
      .selectAll(".menu__row")
      .data(data)
      .enter()
      .append("div")
      .attrs({
        class:d => `menu__row-container menu__row-container--${d.category}`
      })
      .append("div")
      .attrs({
        class: d => `menu__row menu__row--${d.category}`
      })
      .on("click", d => {
        const {category, metadataFilter} = this.props();
        if (d.category !== category){
          this._.category = d.category;
          this.updateCategory();
          this.drawTypes();
          this.updateFilter();
        }else {
          this._.category = "";
          this.updateCategory();
          this.removeTypes();
        }
        if (metadataFilter.type !== ""){
          onClick({category: "", type: ""});
        }
        
      });

    this._.menuButtons = this._.menuRows
      .append("span")
      .attrs({
        class: "menu__button"
      })
      .text(d => d.category_label);

    this.updateOpenStatus();
    this.updateCategory();

  },
  removeTypes(){
    const {menuContainer} = this.props();
    menuContainer.selectAll(".menu__types-container").transition().duration(500).style("opacity",0).remove();
  },
  drawTypes(){
    const {menuContainer, currentFeatures, category, data, onClick} = this.props();
    this.removeTypes();
    //filter out all metadata types that are not present in current sample set
    const currentTypes = currentFeatures.map(d => d[category]);
    const types = data
      .filter(d => d.category === category)[0]
      .features
      .filter(d => currentTypes.includes(d.type));
    
   
    
    const menuContainerRect = this._.menuContainer.node().getBoundingClientRect();
    const topOffset = 10;

    this._.typesContainer = menuContainer
      //.select(`.menu__row-container--${category}`)
      .append("div")
      .attrs({
        class: "menu__types-container"
      })
      .styles({
        position: "absolute",
        left: `${menuContainerRect.width}px`,
        "max-height": `${menuContainerRect.height - topOffset}px`,
        top: `${topOffset}px`,
        opacity:0
      });

    this._.types = this._.typesContainer
      .selectAll(".menu__types-row")
      .data(types)
      .enter()
      .append("div")
      .attrs({
        class: d => `menu__types-row menu__types-row--${d.type}`
      })
      .text(d => `${d.type_label}`)
      .on("click", d => {
        const {metadataFilter} = this.props();
        
        if (metadataFilter.category === d.category && metadataFilter.type === d.type && metadataFilter.category !== ""){
          onClick({category: "", type: ""});
        }else{
          onClick({category: d.category, type: d.type});
        }
      });
      this.drawTypeCounts();
      this._.typesContainer.transition().duration(500).style("opacity",1);

  },
  drawTypeCounts(){
    const {currentFeatures, types, category} = this.props();
    const getTypeCount = type => currentFeatures
      .filter(d => d[category] === type).length;
    this._.typeCounts = types.append("span").text(d => ` (${getTypeCount(d.type)})`);
  },
  updateTime(){
    const {typeCounts, currentFeatures, time, category} = this.props();
    const getTypeCount = type => currentFeatures
      .filter(d => d[category] === type && d.time <= time).length;
    if (typeCounts !== undefined){
      typeCounts.text(d =>` (${getTypeCount(d.type)})`);
    }
  },
  updateOpenStatus(){
    const {menuContainer, isOpen} = this.props();
    //menuRows.classed("menu__row--off", isOpen ? false : true);
    menuContainer.classed("menu__container--off", isOpen ? false : true);
  },
  updateCategory(){
    const {menuRows, category} = this.props();
    menuRows.classed("menu__row--active", d => d.category === category ? true : false);
  },
  updateFilter(){
    const {types, metadataFilter} = this.props();
    if (types !== undefined){
      types.classed("menu__types-row--active", d => d.category === metadataFilter.category && d.type === metadataFilter.type);
    }
    
  },
  updateView(){
    //reset metadata
    const {metadataFilter} =this.props();
    this._.category = metadataFilter.category;
    this._.type = metadataFilter.type;
    this.removeTypes();
    this.updateCategory();
  }
};

const metadataMenu = () => {
  const defaultProps = {_:{
      position: {left: 25, top:100},
      padding: {left: 15, bottom:15, right:15, top:15},
      width:500,
      category: "",
      type: "",
      isOpen: true
    }
  };
  return Object.assign(defaultProps, props, methods);
};

export default metadataMenu;