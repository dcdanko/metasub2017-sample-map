const getMap = function(){
  const map = L.map("sample-map-2017").fitBounds([[-60,-180],[72,180]]); 

  L.tileLayer("http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
    }).addTo(map);

  return map;
};

export default getMap;