/** @format */

class SoundMapManager {
  constructor() {
    this.currentSound = null;
    this.userMap = null;
    this.userMarker = null;
    this.locations = [
      // ... predefined locations with latitude, longitude, and soundFile
      { latitude: 41.510434, longitude: -81.60296, soundFile: "sound1.mp3" }, // Hypothetical coordinates around CIA
      { latitude: 41.510273, longitude: -81.602755, soundFile: "sound4.mp3" },
      { latitude: 41.510098, longitude: -81.602483, soundFile: "sound3.mp3" },
      { latitude: 41.510696, longitude: -81.602362, soundFile: "sound2.mp3" },
      { latitude: 41.51008, longitude: -81.601657, soundFile: "sound5.mp3" },
    ];
    this.sounds = {};
    this.updateInterval = 5000;
    this.preloadSounds();
    this.initMap();
  }

  preloadSounds() {
    this.locations.forEach((location) => {
      this.sounds[location.soundFile] = new Audio(location.soundFile);
    });
  }

  initMap() {
    // Implementation to initialize the map and user marker
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

  updateUserLocation(latitude, longitude) {
    // Update user's location on the map and check for nearby sounds to play
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

  playSoundBasedOnLocation(latitude, longitude) {
    // Determine and play the sound based on the user's current location
    var closestLocation = findClosestLocation(latitude, longitude);
    if (closestLocation && currentSound !== closestLocation.soundFile) {
      playSound(closestLocation.soundFile);
      currentSound = closestLocation.soundFile;
      updateStatus("Playing: " + closestLocation.soundFile);
    }
  }

  addLocation(latitude, longitude, soundFile) {
    // Add a new location and associated sound
    // Implementation goes here
  }

  checkLocationPermission(successCallback, errorCallback) {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(successCallback, (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          this.updateStatus("Location permission denied. Please enable location services to use this feature.");
        } else {
          this.updateStatus("Error retrieving location: " + error.message);
        }
      });
    } else {
      this.updateStatus("Geolocation is not supported by this browser.");
    }
  }

  togglePlayPause() {
    if (this.currentSound && this.currentSound.audio) {
      if (this.currentSound.audio.paused) {
        this.currentSound.audio.play();
      } else {
        this.currentSound.audio.pause();
      }
    }
  }

  updateStatus(message) {
    // Implementation to update the status on the UI
    document.getElementById("status").innerText = message;
  }

  // Additional methods can be added here for other functionalities
}

// Usage
const soundMapManager = new SoundMapManager();
