// create base layers
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

// Create a baseMaps object.
let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
    };


// Create our map, giving it the streetmap and earthquakes layers to display on load.
let myMap = L.map("map", {
center: [
    37.09, -95.71
],
zoom: 4,
layers: [street]
});



// API endpoint for all earthquakes 2.5+ in the last 30 days
let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson';

// GET request to query url using d3
d3.json(url).then(function(data) {
    //console log data to test
    console.log(data);
    createFeatures(data);
});

// Function to create earthquakes layer
//data markers: magnitude of earthquake by size; depth of earthquakes by color
//popups: additional information about earthuqake

function createFeatures(earthquakeData) {

    //create a GeoJSON layer that contains the features array on the earthquakeData object and run onEachFeature once for each data in the array
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup(`Place: ${feature.properties.place}<br>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}`);
        },
        pointToLayer: function(geoJsonPoint, latlng) {
            //calculate color based on depth of earthquake
            let depth = geoJsonPoint.geometry.coordinates[2];
            let color;
            if (depth < 10) {
                color = 'darkgreen';
            } else if (depth <30) {
                color = 'green';
            } else if (depth <50) {
                color = 'yellow';
            } else if (depth < 70) {
                color = 'orange';
            } else if (depth < 90) {
                color = 'red';
            } else {
                color = 'darkred';
            }

            //create marker with varying colors and radius based on magnitude
            let circleMarker = L.circle(latlng, {
                radius: geoJsonPoint['properties']['mag']*30000,
                fillColor: color,
                color: 'black',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.5
            });
            return circleMarker;
        }
    }).addTo(myMap);
    return earthquakes;
};



//define legend colors and labels
let legendColors = ['darkgreen', 'green', 'yellow', 'orange', 'red', 'darkred'];
let legendLabels = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];


//create legend
let legend = L.control({position: 'bottomright'});

legend.onAdd = function(map) {
    let div = L.DomUtil.create('div', 'info legend');
    let labels = []

    // Add legend title
    div.innerHTML += '<strong>Depth</strong><br>';

    // Loop through legend colors and labels to generate HTML for legend
    for (let i = 0; i < legendColors.length; i++) {
        div.innerHTML +=
            '<i style="background:' + legendColors[i] + '"></i> ' +
            legendLabels[i] + '<br>';
    }

    return div;
};

// Add legend to map
legend.addTo(myMap);


