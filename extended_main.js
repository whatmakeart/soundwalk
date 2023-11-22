
/** @format */

// Constants
const updateInterval = 5000; // Default interval for sound updates

// Variables
let currentSound = null; // Currently playing sound object
let userMap = null; // Map object for user's location
let userMarker = null; // Marker for user's position on the map
const locations = []; // Array to hold location data and associated sound files
const sounds = {}; // Object to store preloaded sound files

// Predefined locations with sound files
const predefinedLocations = [
  // Example locations with sound files
];

// Preload sound files
predefinedLocations.forEach((location) => {
  sounds[location.soundFile] = new Audio(location.soundFile);
});

// Check if geolocation is available and permission is granted
function checkLocationPermission() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(handlePositionSuccess, handlePositionError);
  } else {
    updateStatus("Geolocation is not supported by this browser.");
  }
}

// Handle successful geolocation retrieval
function handlePositionSuccess(position) {
  initUserMap(position.coords.latitude, position.coords.longitude);
  checkLocationAndUpdateSound(position.coords);
}

// Handle geolocation errors
function handlePositionError(error) {
  updateStatus("Error: " + error.message);
}

// Toggle play/pause of the current sound
function togglePlayPause() {
  if (currentSound && currentSound.audio) {
    currentSound.audio.paused ? currentSound.audio.play() : currentSound.audio.pause();
  }
}

// Initialize user map
function initUserMap(lat, lon) {
  userMap = L.map('map').setView([lat, lon], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; OpenStreetMap contributors'
  }).addTo(userMap);
  userMarker = L.marker([lat, lon]).addTo(userMap);
}

// Check location and update sound
function checkLocationAndUpdateSound(coords) {
  const closestLocation = findClosestLocation(coords);
  if (closestLocation) {
    playSound(closestLocation.soundFile);
  }
}

// Find the closest predefined location
function findClosestLocation(coords) {
  let minDistance = Number.MAX_VALUE;
  let closestLocation = null;
  predefinedLocations.forEach((location) => {
    const distance = getDistance(coords.latitude, coords.longitude, location.latitude, location.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = location;
    }
  });
  return closestLocation;
}

// Calculate distance between two coordinates
function getDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula to calculate distance
}

// Play sound based on location
function playSound(soundFile) {
  if (currentSound && !currentSound.audio.paused) {
    currentSound.audio.pause();
  }
  currentSound = sounds[soundFile];
  currentSound.audio.play();
}

// Update status message
function updateStatus(message) {
  document.getElementById('status').innerText = message;
}

// Initialize application
function initApp() {
  checkLocationPermission();
  document.getElementById('playPauseButton').addEventListener('click', togglePlayPause);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);
