const getMap = function(bounds){
  const map = L.map("map", {
    zoomControl: false
  }).fitBounds(bounds); 

  L.tileLayer("http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>",
  subdomains: "abcd",
  maxZoom: 19
}).addTo(map);



  return map;
};

export default getMap;