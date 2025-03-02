let map = null;
let isVoiceEnabled = false; // Voice feature is disabled by default
const synth = window.speechSynthesis; // Web Speech API
let username = localStorage.getItem("username") || "Guest";

// Key for storing chat messages in localStorage
const CHAT_STORAGE_KEY = "community_chat_messages";

// Function to get chat messages from localStorage
function getChatMessages() {
  return JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
}

// Function to save chat messages to localStorage
function saveChatMessages(messages) {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
}

document.addEventListener("DOMContentLoaded", function () {
  // Get or set username
  if (!username) {
    username = prompt("Please enter your username:") || "Guest";
    localStorage.setItem("username", username);
  }
  document.getElementById("usernameDisplay").textContent = username;

  // Voice toggle button
  const voiceToggle = document.getElementById("voiceToggle");
  voiceToggle.addEventListener("click", toggleVoice);

  // Speak welcome message if voice is enabled
  if (isVoiceEnabled) {
    speakMessage(`Welcome to the community app, ${username}!`);
  }

  // Load chat messages
  updateChat();
});

function toggleVoice() {
  isVoiceEnabled = !isVoiceEnabled;
  const voiceToggle = document.getElementById("voiceToggle");
  voiceToggle.innerHTML = isVoiceEnabled
    ? '<i class="fas fa-volume-mute"></i>'
    : '<i class="fas fa-volume-up"></i>';

  if (isVoiceEnabled) {
    speakMessage("Voice feature is now enabled.");
  } else {
    synth.cancel(); // Stop any ongoing speech
  }
}

function speakMessage(message) {
  if (isVoiceEnabled && synth) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1; // Speed of speech
    utterance.pitch = 1; // Pitch of speech
    synth.speak(utterance);
  }
}

function showSection(section) {
  // Hide all sections first
  document.querySelectorAll(".content > div").forEach((div) => {
    div.classList.add("hidden");
  });

  // Hide chat container specifically
  document.getElementById("chatContainer").classList.add("hidden");

  switch (section) {
    case "map":
      document.getElementById("mapContainer").classList.remove("hidden");
      initMap();
      break;
    case "chat":
      document.getElementById("chatContainer").classList.remove("hidden");
      updateChat();
      break;
    case "features":
      document.getElementById("featuresContainer").classList.remove("hidden");
      if (isVoiceEnabled) {
        speakMessage("Here are the community features.");
      }
      break;
    case "profile":
      document.getElementById("profileContainer").classList.remove("hidden");
      if (isVoiceEnabled) {
        speakMessage("This is your profile section.");
      }
      break;
    default:
      document.getElementById("welcomeContainer").classList.remove("hidden");
      if (isVoiceEnabled) {
        speakMessage(`Welcome back, ${username}!`);
      }
  }

  // Update active state of navigation buttons
  document.querySelectorAll(".navbar .button").forEach((button) => {
    button.classList.remove("active");
  });
  const activeButton = document.querySelector(
    `.navbar .button[onclick="showSection('${section}')"]`
  );
  if (activeButton) {
    activeButton.classList.add("active");
  }
}

function initMap() {
  if (!map) {
    map = L.map("map").setView([0, 0], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      map
    );
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      map.setView([position.coords.latitude, position.coords.longitude], 13);
      L.marker([position.coords.latitude, position.coords.longitude]).addTo(
        map
      );
    });
  }
}

function updateChat() {
  const chatBox = document.getElementById("chatBox");
  const messages = getChatMessages();
  chatBox.innerHTML = messages
    .map(
      (msg) => `
        <div class="chat-message ${msg.sender === username ? "user" : ""}">
            <div class="username">${msg.sender}</div>
            <div class="message">${msg.text}</div>
            <div class="timestamp">${msg.timestamp}</div>
        </div>
    `
    )
    .join("");
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  if (input.value.trim()) {
    const message = {
      sender: username,
      text: input.value.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    // Save the new message
    const messages = getChatMessages();
    messages.push(message);
    saveChatMessages(messages);

    // Clear input and update chat
    input.value = "";
    updateChat();

    // Speak the message if voice is enabled
    if (isVoiceEnabled) {
      speakMessage(`New message from ${message.sender}: ${message.text}`);
    }
  }
}

function speakMessage(message) {
  if (isVoiceEnabled && synth) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1; // Speed of speech
    utterance.pitch = 1; // Pitch of speech
    synth.speak(utterance);
  }
}

function sendSOSMessage() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          // Fetch location name using OpenStreetMap's Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          const locationName =
            data.display_name || `Lat: ${latitude}, Lng: ${longitude}`;

          const message = {
            sender: username,
            text: `🚨 SOS! Emergency at: ${locationName}`,
            timestamp: new Date().toLocaleTimeString(),
          };

          // Save the new message
          const messages = getChatMessages();
          messages.push(message);
          saveChatMessages(messages);

          // Update chat
          updateChat();

          // Speak the message if voice is enabled
          if (isVoiceEnabled) {
            speakMessage(
              `Emergency alert sent by ${message.sender} at ${locationName}.`
            );
          }
        } catch (error) {
          console.error("Error fetching location name:", error);
          alert(
            "Failed to get the exact location name. Please check your internet connection."
          );
        }
      },
      () => {
        alert("Unable to retrieve location. Please check your settings.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

function updateChat() {
  const chatBox = document.getElementById("chatBox");
  const messages = getChatMessages();
  chatBox.innerHTML = messages
    .map(
      (msg) => `
        <div class="chat-message ${msg.sender === username ? "user" : ""}">
            <div class="username">${msg.sender}</div>
            <div class="message">${msg.text}</div>
            <div class="timestamp">${msg.timestamp}</div>
        </div>
    `
    )
    .join("");
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Simulate multiple users by periodically checking for new messages
setInterval(() => {
  updateChat();
}, 2000); // Check for new messages every 2 seconds
