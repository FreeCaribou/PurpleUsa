// where is the real center of USA? without take in count Alaska and island
// zoom 4 must be also good, but to far for me
let mymap = L.map('purpleUsaMap').setView([40.149336, -98.079624], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: `Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> 
    contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>`
}).addTo(mymap);

function geoJsonStyle(feature) {
  return {
    fillColor: feature.properties.RGB,
    weight: 0.5,
    opacity: 1,
    color: 'white',
    dashArray: '4',
    fillOpacity: 0.7
  };
}

function onEachFeature(feature, layer) {
  layer.on({
    click: onClickCounties
  });
}

// add the GeoJSON data
L.geoJson(newStatesDataName, { style: geoJsonStyle, onEachFeature: onEachFeature }).addTo(mymap);


// method that we will use to update the control based on feature properties passed
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

info.update = function (props) {
  var text = 'Click on a state';
  if (props) {
    var text = '<b>' + props.NAME + '</b>';
    if (props.BidenPercentageVote && props.TrumpPercentageVote) {
      var text = text + '<br />Biden: ' + props.BidenTotalVote + ' votes / ' + props.BidenPercentageVote.toFixed(2) + '%'
        + '<br />Trump: ' + props.TrumpTotalVote + ' votes / ' + props.TrumpPercentageVote.toFixed(2) + '%';
    } else {
      var text = text + '<br />There is an error with the data (see source)';
    }
  }

  this._div.innerHTML = '<h4>USA election detail</h4>' + text;
};

info.addTo(mymap);

function onClickCounties(e) {
  console.log('counties', e.target.feature.properties.NAME, e.target.feature.properties);
  info.update(e.target.feature.properties);
}


// the legend
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
    grades = ['rgb(255,0,0)', 'rgb(191,0,64)', 'rgb(127,0,127)', 'rgb(64,0,191)', 'rgb(0,0,255)', 'rgb(0,0,0)', 'rgb(255,255,255)'],
    labels = ['Trump 100%', 'Trump 75%', '50/50', 'Biden 75%', 'Biden 100%', 'Greenland (Geo data joke)', 'Merge error'];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + grades[i] + '"></i> ' +
      labels[i] + (grades[i + 1] ? '<br>' : '');
  }

  return div;
};

legend.addTo(mymap);



