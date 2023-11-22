/** @format */

// Global Variables
var currentSound = null;
var userMap = null;
var userMarker = null;
var locations = [
  // ... predefined locations with latitude, longitude, and soundFile
];
var sounds = {};
var updateInterval = 5000;

// Define default coordinates
var defaultCoordinates = { latitude: 40.7128, longitude: -74.006 }; // Replace with your default coordinates

// ... rest of your JavaScript code, including initMap and initUserMap functions

// Preload sound files
locations.forEach((loc) => (sounds[loc.soundFile] = new Audio(loc.soundFile)));

function checkLocationPermission() {
  if (!navigator.geolocation) {
    updateStatus("Geolocation is not supported by this browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => updateUserLocation(position),
    (error) => handleLocationError(error)
  );
}

function handleLocationError(error) {
  let message =
    error.code == error.PERMISSION_DENIED
      ? "Location permission denied. Please enable location services."
      : "Error retrieving location: " + error.message;
  updateStatus(message);
}

function togglePlayPause() {
  if (currentSound && currentSound.audio) {
    if (currentSound.audio.paused) {
      currentSound.audio.play();
      updateStatus("Playing: " + currentSound.file);
    } else {
      currentSound.audio.pause();
      updateStatus("Paused: " + currentSound.file);
    }
  }
}

function stopSound() {
  if (currentSound?.audio) {
    currentSound.audio.pause();
    currentSound.audio.currentTime = 0;
    updateStatus("Stopped: " + currentSound.file);
  }
}

function playSound(soundFile) {
  if (currentSound?.audio) {
    currentSound.audio.pause();
  }
  var audio = sounds[soundFile] || new Audio(soundFile);
  audio.play().catch(() => handleAudioPlaybackPermission());
  currentSound = { audio, file: soundFile };
  setupAudioEvents(audio);
}

function setupAudioEvents(audio) {
  audio.onloadedmetadata = () =>
    updateStatus(`Playing: ${currentSound.file} (Duration: ${audio.duration.toFixed(2)} seconds)`);
  audio.ontimeupdate = () => updateRemainingTime(audio.duration - audio.currentTime);
  audio.onended = () => stillInLocation && audio.play();
}

function handleAudioPlaybackPermission() {
  document.getElementById("startButton").style.display = "block";
  updateStatus("Click the button to enable audio playback permissions.");
}

function updateRemainingTime(timeLeft) {
  document.getElementById("remainingTime").innerText = `Time Remaining: \${timeLeft.toFixed(2)} seconds`;
}

function updateUserLocation(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;

  if (!userMap) {
    initUserMap(latitude, longitude);
  } else {
    userMarker.setLatLng([latitude, longitude]);
    userMap.setView([latitude, longitude], 17);
  }

  playSoundBasedOnLocation(latitude, longitude);
}

function findClosestLocation(lat, lon) {
  var minDistance = Infinity,
    closest = null;
  locations.forEach((location) => {
    var distance = getDistance(lat, lon, location.latitude, location.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      closest = location;
    }
  });
  return closest;
}

function getDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula to calculate distance
  var R = 6371e3; // metres
  var φ1 = (lat1 * Math.PI) / 180,
    φ2 = (lat2 * Math.PI) / 180;
  var Δφ = ((lat2 - lat1) * Math.PI) / 180,
    Δλ = ((lon2 - lon1) * Math.PI) / 180;
  var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function updateStatus(message) {
  document.getElementById("status").innerText = message;
}

function initMap() {
  var mapCenter = getMapCenter();
  if (!mapCenter || mapCenter.length !== 2 || isNaN(mapCenter[0]) || isNaN(mapCenter[1])) {
    // Fallback to default coordinates obtained from IP address
    mapCenter = defaultCoordinates;
    if (!mapCenter || isNaN(mapCenter.latitude) || isNaN(mapCenter.longitude)) {
      console.error("Invalid default coordinates.");
      return; // Exit the function if no valid coordinates are available
    }
    mapCenter = [defaultCoordinates.latitude, defaultCoordinates.longitude];
  }

  var map = L.map("map").setView(mapCenter, 17);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  locations.forEach((location) => {
    L.marker([location.latitude, location.longitude]).addTo(map).bindPopup(location.soundFile);
  });
}

function getMapCenter() {
  var latSum = 0,
    lonSum = 0,
    count = 0;
  locations.forEach(function (loc) {
    if (!isNaN(loc.latitude) && !isNaN(loc.longitude)) {
      latSum += loc.latitude;
      lonSum += loc.longitude;
      count++;
    }
  });
  if (count === 0) return null; // or return a default location
  return [latSum / count, lonSum / count];
}

function initUserMap(latitude, longitude) {
  if (isNaN(latitude) || isNaN(longitude)) {
    // Fallback to default coordinates obtained from IP address
    var coords = defaultCoordinates;
    if (!coords || isNaN(coords.latitude) || isNaN(coords.longitude)) {
      console.error("Invalid default coordinates.");
      return; // Exit the function if no valid coordinates are available
    }
    latitude = coords.latitude;
    longitude = coords.longitude;
  }

  userMap = L.map("userMap").setView([latitude, longitude], 17);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(userMap);

  userMarker = L.marker([latitude, longitude]).addTo(userMap).bindPopup("Your Location").openPopup();
}

function showDistanceAndDirection(map, lat, lon) {
  var closestLocation = findClosestLocation(lat, lon);
  if (closestLocation) {
    var distance = getDistance(lat, lon, closestLocation.latitude, closestLocation.longitude);
    var direction = getDirection(lat, lon, closestLocation.latitude, closestLocation.longitude);

    // Update distance info
    document.getElementById("distanceInfo").innerHTML =
      "Closest Sound: " +
      closestLocation.soundFile +
      "<br>" +
      "Distance: " +
      distance.toFixed(2) +
      " meters" +
      "<br>" +
      "Direction: " +
      direction;

    // Add marker for closest sound location
    L.marker([closestLocation.latitude, closestLocation.longitude])
      .addTo(map)
      .bindPopup(closestLocation.soundFile)
      .openPopup();
  }
}

function errorFunction(error) {
  console.error("Geolocation error:", error);
}
// Modified window.onload function
window.onload = function () {
  initMap();
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        initUserMap(position.coords.latitude, position.coords.longitude);
        checkLocationAndUpdateSound();
      },
      function (error) {
        console.error("Error getting location: " + error.message);
      }
    );
  } else {
    console.log("Geolocation is not supported by this browser.");
  }

  document.getElementById("playPauseButton").addEventListener("click", togglePlayPause);
  document.getElementById("stopButton").addEventListener("click", stopSound);
};

document.getElementById("startButton").addEventListener("click", function () {
  checkLocationAndUpdateSound();
  this.style.display = "none";
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        playSoundBasedOnLocation(position.coords.latitude, position.coords.longitude);
      },
      function (error) {
        updateStatus("Error: " + error.message);
      }
    );
  } else {
    updateStatus("Geolocation is not supported by this browser.");
  }
});

// Call the location permission check function
checkLocationPermission();