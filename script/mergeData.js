/* 
There is the script to merge the data of election with the data of GeoJSON
First we calcul the percentage and made color for the map
Then the merge to create a new GeoJSON file

TODO 
- create directly a .js file for the map html
- is a beautiful csv/ods file usefull?
**/

let XLSX = require('xlsx');
let geoJsonBaseCountiesInfo = require('../data/geoJson_usa_counties_5m.json');
const fs = require('fs');

console.log('Convert the MIT USA result data to data for myself');

const workbook = XLSX.readFile('./data/leip_natl_data.csv');

const fileJson = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1']);

let newJsonArray = new Array();

for (const e of fileJson) {
  // We just want the county
  if (e['Geographic Subtype'] == 'County') {
    // I want FIPS in the GEO ID Format
    let FIPS = e.FIPS;
    if (FIPS.toString().length == 4) {
      FIPS = '0' + FIPS;
    }
    FIPS = '0500000US' + FIPS;

    const totalVote = e['Total Vote'];
    const BidenTotalVote = e['Joseph R. Biden Jr.'];
    const TrumpTotalVote = e['Donald J. Trump'];

    // now the percentage of vote
    const BidenPercentageVote = BidenTotalVote / totalVote * 100;
    const TrumpPercentageVote = TrumpTotalVote / totalVote * 100;

    // and the R (red, for republican), G (nope), B (blue, for democrat) value to form purple code
    const RGB = `rgb(${(TrumpPercentageVote / 100 * 255).toFixed(0)},0,${(BidenPercentageVote / 100 * 255).toFixed(0)})`;

    newJsonArray.push({
      countyName: e['Geographic Name'],
      FIPS,
      totalVote,
      TrumpTotalVote,
      TrumpPercentageVote,
      BidenTotalVote,
      BidenPercentageVote,
      RGB
    });
  }
}

// And now... merge the geoJson data and this elect data to have a new geoJson
const oldGeoJsonArray = geoJsonBaseCountiesInfo.features;

// For the moment, the elect data is not so good, there is error with the FIPS who is a bad ID
for (const e of oldGeoJsonArray) {
  // const index = newJsonArray.findIndex(x => x.FIPS == e.properties.GEO_ID);
  const index = newJsonArray.findIndex(x => x.countyName == e.properties.NAME);
  if (index > -1) {
    const element = newJsonArray[index];
    e.properties.totalVote = element.totalVote;
    e.properties.TrumpTotalVote = element.TrumpTotalVote;
    e.properties.TrumpPercentageVote = element.TrumpPercentageVote;
    e.properties.BidenTotalVote = element.BidenTotalVote;
    e.properties.BidenPercentageVote = element.BidenPercentageVote;
    e.properties.RGB = element.RGB;
  }
}

const newGeoJsonArray = JSON.parse(JSON.stringify(oldGeoJsonArray));
const newGeoJson = {
  "type": "FeatureCollection",
  "features": newGeoJsonArray
}

// And finally... extract that!
fs.writeFile('./data/geoJsonMergeWithName.json', JSON.stringify(newGeoJson), (err) => {
  if (!err) {
    console.log('file created');
  } else {
    console.log(err);
  }
});
