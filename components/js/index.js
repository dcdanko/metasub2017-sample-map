d3.queue()
  .defer(d3.json, "http://metasub-kobo-wrapper.herokuapp.com/")
  .await((error, rawSampleData) => {
    if (error) throw error;
    draw({rawSampleData});
});

function draw({rawSampleData}){
  d3.select("#sample-map-2017")
    .styles({
      position: "relative",
      width:"100%",
      height:"80vh",
      background:"grey"
  });



  console.log(rawSampleData.map(d => d._geolocation));

  const map = L.map("sample-map-2017").fitWorld(); 



  L.tileLayer("http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
  }).addTo(map);
}