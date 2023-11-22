/** @format */

// Sound Module
const SoundModule = (() => {
  let currentSound = null;
  const sounds = {};

  function preloadSounds(locations) {
    locations.forEach((location) => {
      sounds[location.soundFile] = new Audio(location.soundFile);
    });
  }

  function playSound(soundFile) {
    if (currentSound && currentSound.audio) {
      currentSound.audio.pause();
    }
    const audio = new Audio(soundFile);
    audio.play().catch(() => {
      UIHelper.showStartButton();
    });
    currentSound = { audio: audio, file: soundFile };
  }

  function stopSound() {
    if (currentSound && currentSound.audio) {
      currentSound.audio.pause();
      currentSound.audio.currentTime = 0;
    }
  }

  function togglePlayPause() {
    if (currentSound && currentSound.audio) {
      if (currentSound.audio.paused) {
        currentSound.audio.play();
      } else {
        currentSound.audio.pause();
      }
    }
  }

  return {
    preloadSounds,
    playSound,
    stopSound,
    togglePlayPause,
  };
})();

// Map Module
const MapModule = (() => {
  let userMap = null;
  let userMarker = null;

  function initMap(locations) {
    // Map initialization logic
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

  function updateUserLocation(latitude, longitude) {
    // Update user's map marker logic
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    // Update user's map marker
    if (!userMap) {
      initUserMap(latitude, longitude);
    } else {
      userMarker.setLatLng([latitude, longitude]);
      userMap.setView([latitude, longitude], 17);
    }
  }

  return {
    initMap,
    updateUserLocation,
  };
})();

// Geo Module
const GeoModule = (() => {
  function checkLocationPermission() {
    // Location permission logic
  }

  function watchPosition(callback) {
    navigator.geolocation.watchPosition(callback, UIHelper.showError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }

  return {
    checkLocationPermission,
    watchPosition,
  };
})();

// UI Helper
const UIHelper = (() => {
  function showStartButton() {
    // Show start button logic
  }

  function showError(error) {
    // Error display logic
  }

  return {
    showStartButton,
    showError,
  };
})();

// Utils
const Utils = (() => {
  function getDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula to calculate distance
  }

  return {
    getDistance,
  };
})();

// Main Execution
(function main() {
  const locations = [
    // Locations array
  ];

  SoundModule.preloadSounds(locations);
  MapModule.initMap(locations);
  GeoModule.checkLocationPermission();

  // Setup event listeners
  // Event listener logic
})();
