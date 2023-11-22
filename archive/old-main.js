/** @format */

// Global Variables
var currentSound = null; // Currently playing sound object
var userMap = null; // Map object for user's location
var userMarker = null; // Marker for user's position on the map
var locations = []; // Array to hold location data and associated sound files
var sounds = {}; // Object to store preloaded sound files
var updateInterval = 5000; // Default interval for sound updates

// Define an array of locations and corresponding sound files
const locations = [
  { latitude: 41.510434, longitude: -81.60296, soundFile: "sound1.mp3" }, // Hypothetical coordinates around CIA
  { latitude: 41.510273, longitude: -81.602755, soundFile: "sound4.mp3" },
  { latitude: 41.510098, longitude: -81.602483, soundFile: "sound3.mp3" },
  { latitude: 41.510696, longitude: -81.602362, soundFile: "sound2.mp3" },
  { latitude: 41.51008, longitude: -81.601657, soundFile: "sound5.mp3" },

  // ... add more locations and sound files as needed
];

// Function to preload sound files

locations.forEach((location) => {
  sounds[location.soundFile] = new Audio(location.soundFile);
});

// Function to check if geolocation is available and permission is granted
function checkLocationPermission() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        // Existing logic...
      },
      function errorFunction(error) {
        if (error.code == error.PERMISSION_DENIED) {
          updateStatus("Location permission denied. Please enable location services to use this feature.");
        } else {
          updateStatus("Error retrieving location: " + error.message);
        }
      }
    );
  } else {
    updateStatus("Geolocation is not supported by this browser.");
  }
}

// Function to toggle play/pause of the current sound
function togglePlayPause() {
  if (currentSound && currentSound.audio) {
    if (currentSound.audio.paused) {
      currentSound.audio.play();
    } else {
      currentSound.audio.pause();
    }
  }
}

// Function to stop the current sound
function stopSound() {
  if (currentSound && currentSound.audio) {
    currentSound.audio.pause();
    currentSound.audio.currentTime = 0;
  }
}

// Function to find the closest location from the current position

function checkLocationAndUpdateSound() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var closestLocation = findClosestLocation(position.coords.latitude, position.coords.longitude);
        if (closestLocation) {
          var minDistance = getDistance(
            position.coords.latitude,
            position.coords.longitude,
            closestLocation.latitude,
            closestLocation.longitude
          );

          if (currentSound !== closestLocation.soundFile) {
            playSound(closestLocation.soundFile);
            currentSound = closestLocation.soundFile;
            updateStatus("Playing: " + closestLocation.soundFile);
            showDistanceAndDirection(position.coords.latitude, position.coords.longitude);
          }

          // Use minDistance here
          updateCompassBox(closestLocation, minDistance);
        }
      },
      function (error) {
        updateStatus("Error: " + error.message);
      }
    );
  } else {
    updateStatus("Geolocation is not supported by this browser.");
  }
}

function playSoundBasedOnLocation(latitude, longitude) {
  var closestLocation = findClosestLocation(latitude, longitude);
  if (closestLocation && currentSound !== closestLocation.soundFile) {
    playSound(closestLocation.soundFile);
    currentSound = closestLocation.soundFile;
    updateStatus("Playing: " + closestLocation.soundFile);
  }
}

function findClosestLocation(lat, lon) {
  var minDistance = Infinity;
  var closest = null;
  for (var i = 0; i < locations.length; i++) {
    var distance = getDistance(lat, lon, locations[i].latitude, locations[i].longitude);
    if (distance < minDistance) {
      minDistance = distance;
      closest = locations[i];
    }
  }
  return closest; // Removed the distance check
}

function getDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula to calculate distance between two coordinates
  var R = 6371e3; // metres
  var φ1 = (lat1 * Math.PI) / 180;
  var φ2 = (lat2 * Math.PI) / 180;
  var Δφ = ((lat2 - lat1) * Math.PI) / 180;
  var Δλ = ((lon2 - lon1) * Math.PI) / 180;

  var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
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
  if (currentSound && currentSound.audio) {
    currentSound.audio.pause();
    currentSound.audio.currentTime = 0;
    updateStatus("Stopped: " + currentSound.file);
  }
}

function playSound(soundFile) {
  // Check if currentSound exists and has a property 'audio'
  if (currentSound && currentSound.audio) {
    currentSound.audio.pause();
  }
  var audio = new Audio(soundFile);
  audio.play().catch((e) => {
    // This is where the start button becomes necessary
    document.getElementById("startButton").style.display = "block";
    updateStatus("Click the button to enable audio playback permissions in your browser.");
  });
  currentSound = { audio: audio, file: soundFile };

  // Display sound duration and remaining time
  audio.onloadedmetadata = function () {
    updateStatus("Playing: " + currentSound.file + " (Duration: " + audio.duration.toFixed(2) + " seconds)");
  };
  audio.ontimeupdate = function () {
    updateRemainingTime(audio.duration - audio.currentTime);
  };

  // Loop the sound if the user is still there
  audio.onended = function () {
    if (stillInLocation) {
      audio.play();
    }
  };
  // If a sound is already playing, pause it
  if (currentSound && currentSound.audio && !currentSound.audio.paused) {
    currentSound.audio.pause();
  }
}

function updateRemainingTime(timeLeft) {
  document.getElementById("remainingTime").innerText = "Time Remaining: " + timeLeft.toFixed(2) + " seconds";
}

function updateCompassBox(closestLocation, distance) {
  if (!closestLocation) return;

  // Calculate the direction to the closest sound
  var direction = getDirection(
    userMarker.getLatLng().lat,
    userMarker.getLatLng().lng,
    closestLocation.latitude,
    closestLocation.longitude
  );
  var arrowDirectionStyle = "transform: rotate(" + direction + "deg);";

  // Update the compass arrow box
  var compassArrowElement = document.getElementById("compassArrow");
  var soundInfoElement = document.getElementById("soundInfo");
  var soundDistanceElement = document.getElementById("soundDistance");

  compassArrowElement.setAttribute("style", arrowDirectionStyle);
  soundInfoElement.innerText = "Sound: " + closestLocation.soundFile;
  soundDistanceElement.innerText = "Distance: " + distance.toFixed(2) + " meters";
}

function getDirection(lat1, lon1, lat2, lon2) {
  var y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  var brng = (Math.atan2(y, x) * 180) / Math.PI;
  return brng < 0 ? brng + 360 : brng;
}

function updateStatus(message) {
  document.getElementById("status").innerText = message;
}

function applySettings() {
  // Get the user input value
  var frequencyInput = document.getElementById("updateFrequency").value;
  var newInterval = parseInt(frequencyInput, 10) * 1000; // Convert to milliseconds

  if (!isNaN(newInterval) && newInterval > 0) {
    updateInterval = newInterval;
  } else {
    alert("Please enter a valid number for frequency");
  }
}

// Modified checkLocationAndUpdateSound function to use updateInterval
var lastUpdate = Date.now();

function checkLocationAndUpdateSound(position) {
  if (Date.now() - lastUpdate >= updateInterval) {
    // Your existing logic for updating sound based on location
    lastUpdate = Date.now();
  }
}

// Call this in your window.onload or initialization logic
document.getElementById("applySettingsButton").addEventListener("click", applySettings);

// Throttle function
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Use the throttle function
//setInterval(throttle(checkLocationAndUpdateSound, 5000), 2000); // Adjust time as needed

navigator.geolocation.watchPosition(checkLocationAndUpdateSound, errorFunction, {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
});

// Initialize the Leaflet Map
function initMap() {
  var mapCenter = getMapCenter(); // Get the center of all sound locations
  var map = L.map("map").setView(mapCenter, 17); // Adjust zoom level if necessary

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Add markers for each location
  locations.forEach(function (location) {
    L.marker([location.latitude, location.longitude]).addTo(map).bindPopup(location.soundFile);
  });
}

function updateUserLocation(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;

  // Update user's map marker
  if (!userMap) {
    initUserMap(latitude, longitude);
  } else {
    userMarker.setLatLng([latitude, longitude]);
    userMap.setView([latitude, longitude], 17);
  }

  // Play sound and update distance and direction info
  playSoundBasedOnLocation(position.coords.latitude, position.coords.longitude);
  showDistanceAndDirection(userMap, position.coords.latitude, position.coords.longitude);
}

// Add this code to calculate the center of the sound locations
function getMapCenter() {
  var latSum = 0,
    lonSum = 0;
  locations.forEach(function (loc) {
    latSum += loc.latitude;
    lonSum += loc.longitude;
  });
  return [latSum / locations.length, lonSum / locations.length];
}

function initUserMap(latitude, longitude) {
  // Initialize the map if not already done
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
