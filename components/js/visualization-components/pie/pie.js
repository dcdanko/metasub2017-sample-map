import {getObjectWithPropMethods} from "../utils";
import {innerPieText, outerPieText} from "./pieText";

const props = getObjectWithPropMethods(["width", "colorRange", "data", "text", "textBlock", "title"]);

const methods = {
  addTo(selection){
    const {data} = this.props();
    this._.selection = selection;
    this._.selectedSlice = Math.floor(Math.random() * data.length);

    this.setDimensions();
    this.drawLayers();
    this.setSVGSize();
    this.drawPie();
    this.drawText();
    this.drawTextBlock();

    return this;
  },
  drawTextBlock(){
    const {textBlock, textBlockGroup, data, selectedSlice} = this.props();

      this._.outerText = outerPieText()
        .selectedSlice(data[selectedSlice])
        .text(textBlock)
        .addTo(textBlockGroup);
    
  },
  drawText(){
    const {textPosition, textBoxWidth, textGroup, selectedSlice, data, title, text} = this.props();

    this._.innerText = innerPieText()
      .position(textPosition)
      .width(textBoxWidth)
      .selectedSlice(data[selectedSlice])
      .title(title)
      .text(text)
      .addTo(textGroup);

  },
  drawLayers(){
    const {selection} = this.props();

    this._.svg = selection.append("svg")
			.attrs({
        position:"relative",
				class: "pieSVG"
			});

    this._.pieGroup = this._.svg.append("g");

    this._.textGroup = selection.append("div")
      .attr("class", "pieText")
      .styles({
        position:"absolute"
      });

    this._.textBlockGroup = selection.append("div");
  },
  setSVGSize(){
    const {svg, width, pieGroup} = this.props();

    svg.attrs({
      width: width,
			height: width
    });

    pieGroup.attr("transform", `translate(${width/2},${width/2})`);
  },
  
  setDimensions(){
    const toRadians  = angle => angle * (Math.PI / 180);

    const {width} = this.props();
    this._.padding = width * .03;
    this._.outerRadius = (width / 2) - this._.padding * 2;
    this._.innerRadius = this._.outerRadius / 1.5;

    const {outerRadius, innerRadius, padding} = this.props();

    this._.textPosition = outerRadius - innerRadius * Math.cos(toRadians(45)) + padding*2;
    this._.textBoxWidth = innerRadius * Math.cos(toRadians(45)) * 2;

    const pieChart = d3.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius);
    
    this._.pieChart = pieChart;
    
    this._.arcTween = function(finish){
      const i = d3.interpolate({startAngle: 0, endAngle: 0},finish);
      this._current = i(0);
      return function(d){
        return pieChart(i(d));
      };
    };
  },
  moveSlice(){
    const {pieGroup, selectedSlice, mouseoverSlice} = this.props();
    pieGroup.selectAll("path.pie")
      .transition()
      .duration(100)
      .attr("transform", function(d,i){
				if (i === selectedSlice || i === mouseoverSlice){
					return "translate(0,0)scale(1.1)";
				}else{
					return "translate(0,0)scale(1)";
				}
			});	
  },
  drawPie(){
    const {pieGroup, data, colorRange, arcTween} = this.props();

    const colorScale = d3.scaleLinear().domain([0,1]).range(colorRange);
    const colorArray = [colorScale(0), colorScale(.2), colorScale(.4), colorScale(.6), colorScale(.8), colorScale(1)];

    const arcs = d3.pie().value(d => d.count);
    const pieData = arcs(data);

    this._.pie = pieGroup.selectAll("path")
      .data(pieData)
      .enter()
      .append("path")
      .attrs({
        fill: (d,i) => colorArray[i%colorArray.length],
        class: "pie",
        cursor:"pointer",
        "pointer-events":"none"
      });

    this._.pie
      .on("mouseover", (d,i) => {
        this._.mouseoverSlice = i;
        this.moveSlice();
      })
      .on("mouseout", () => {
        this._.mouseoverSlice = undefined;
        this.moveSlice();
      })
      .on("click", (d,i) => {
        this._.selectedSlice = i;
        this.moveSlice();
        this.updateText();
      });

    this._.pie
      .each(function(d){this._current = d;})
      .transition()
      .duration(1000)
      .attrTween("d",arcTween)
      .on("end", (d,i) => {
        if (i === pieData.length - 1){
          this._.pie.attr("pointer-events", "auto");
          this.moveSlice();
        }
      });
  },
  updateText(){
    const {innerText, outerText, selectedSlice, data} = this.props();

    innerText.selectedSlice(data[selectedSlice])
      .updateText();

    outerText.selectedSlice(data[selectedSlice])
      .updateText();

  },
  updateSize(){
    this.setDimensions();
    this.setSVGSize();
    const {pie, pieChart, innerText, textPosition, textBoxWidth} = this.props();

    pie.attr("d", pieChart);
    innerText.position(textPosition)
      .width(textBoxWidth)
      .setPosition();
  }
};

const pie = () => {
  const defaultProps = {_:{
    textBlock: []
  }};
  return Object.assign(defaultProps, props, methods);
};

export default pie;