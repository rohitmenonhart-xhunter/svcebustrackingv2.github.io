const firebaseConfig = {
  apiKey: "AIzaSyD3Cl5s1E5VduZ5u1pg52-gWmJ4lA85-9c",
  authDomain: "bus-live--location.firebaseapp.com",
  databaseURL: "https://bus-live--location-default-rtdb.firebaseio.com",
  projectId: "bus-live--location",
  storageBucket: "bus-live--location.appspot.com",
  messagingSenderId: "783576863521",
  appId: "1:783576863521:web:66d867caa3c5256aa1e460",
  measurementId: "G-ZRME8PEXMJ"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const customIcon = L.icon({
  iconUrl: 'bus-marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const markers = {};
const previousLocations = {};

function initMap() {
  const map = L.map("map").setView([13.003065, 79.970555], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  db.ref("BusLocations").on("value", (snapshot) => {
    mapMarkers(snapshot.val());
  });

  // ...

// ...

function mapMarkers(locations) {
  for (const busNumber in markers) {
    map.removeLayer(markers[busNumber]);
  }

  if (locations) {
    for (const busNumber in locations) {
      const location = locations[busNumber].Location;
      const { latitude, longitude } = location;

      if (previousLocations[busNumber]) {
        const previousLocation = previousLocations[busNumber];
        const currentLatLng = L.latLng(latitude, longitude);
        previousLocations[busNumber] = { latitude, longitude, timestamp: Date.now(), latLng: currentLatLng };
      } else {
        const currentLatLng = L.latLng(latitude, longitude);
        previousLocations[busNumber] = { latitude, longitude, timestamp: Date.now(), latLng: currentLatLng };
      }

      markers[busNumber] = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

      // Event listener for bus markers
      // Event listener for bus markers
// Declare a variable to store the current route control
// Declare a variable to store the last clicked marker
let lastClickedMarker = null;
// Declare a variable to store the route control for each marker
let routeControls = {};

// Event listener for bus markers
markers[busNumber].on('click', function (e) {
  const busLatLng = e.latlng;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
        const distance = userLatLng.distanceTo(busLatLng);

        // Assume a constant speed of 20 meters per second (adjust as needed)
        const constantSpeed = 8; // in meters per second
        const ETASeconds = Math.ceil(distance / constantSpeed);
        const ETAMinutes = Math.ceil(ETASeconds / 60);

        let popupContent = `Bus ${busNumber}<br>`;
        popupContent += `Estimated Time of Arrival: ${ETAMinutes} minutes`;

        L.popup()
          .setLatLng(busLatLng)
          .setContent(popupContent)
          .openOn(map);

        // Remove the previous route control if exists
        if (lastClickedMarker) {
          const previousRouteControl = routeControls[lastClickedMarker];
          if (previousRouteControl) {
            map.removeControl(previousRouteControl);
            // Clear the reference after removing
            delete routeControls[lastClickedMarker];
          }
        }

        // Draw route to user's location
        const routeControl = drawRoute(userLatLng, busLatLng);
        // Store the route control for the current bus marker
        routeControls[busNumber] = routeControl;

        // Update the last clicked marker
        lastClickedMarker = busNumber;

        // Automatically remove the route after 15 seconds
        setTimeout(function () {
          if (routeControls[busNumber]) {
            map.removeControl(routeControls[busNumber]);
            // Clear the reference after removing
            delete routeControls[busNumber];
          }
        }, 15000); // 15 seconds
      },
      function (error) {
        console.error('Error getting user location:', error.message);
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
  }
});

function drawRoute(startLatLng, endLatLng) {
  const routeControl = L.Routing.control({
    waypoints: [
      L.latLng(startLatLng.lat, startLatLng.lng),
      L.latLng(endLatLng.lat, endLatLng.lng),
    ],
    routeWhileDragging: true, // Draw the route while dragging the marker
    show: false, // Do not display turn-by-turn instructions
  }).addTo(map);

  return routeControl;
}


    }

    // Fit map bounds to contain all markers
    const bounds = Object.values(markers).map(marker => marker.getLatLng());
    map.fitBounds(bounds, { padding: [20, 20] });

    // Add a marker for the user's location
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
        L.marker(userLatLng).addTo(map).bindPopup('Your Location').openPopup();
      },
      function (error) {
        console.error('Error getting user location:', error.message);
      }
    );
  }
}




function getBusSpeed(busNumber, currentLatLng) {
  const previousLocation = previousLocations[busNumber];
  const distance = previousLocation.latLng.distanceTo(currentLatLng);
  const timeElapsed = (Date.now() - previousLocation.timestamp) / 1000;
  return distance / timeElapsed; // speed = distance / time
}
  
}
