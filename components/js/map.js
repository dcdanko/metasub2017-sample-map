const getMap = function(){
  const map = L.map("sample-map-2017", {
    zoomControl: false
  }).fitBounds([[-60,-180],[72,180]]); 

  L.tileLayer("http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>",
  subdomains: "abcd",
  maxZoom: 19
}).addTo(map);



  return map;
};

export default getMap;