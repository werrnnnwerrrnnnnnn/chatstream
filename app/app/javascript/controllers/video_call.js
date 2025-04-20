let localStream;
window.peerConnection = null;
window.pendingCandidates = [];

const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

document.addEventListener("chatRoomChannelReady", () => {
    initializeStreaming();
  
    const isStreamer = document.getElementById("chat-room-id").dataset.isStreamer === "true";
    if (isStreamer) return;
  
    const existingCanvas = document.querySelector("#chat-room-id canvas");
    if (existingCanvas) {
      console.warn("🟡 Canvas already exists. Skipping creation.");
      return;
    }
  
    const vid = document.getElementById("remoteVideo");
    vid.style.display = "none";
  
    // 🟩 Find .card-body.text-center inside viewer layout
    const cardBody = document.querySelector("#chat-room-id .card-body.text-center");
    if (!cardBody) {
      console.warn("❌ Could not find .card-body.text-center to insert canvas.");
      return;
    }
  
    // 🟩 Canvas
    const canvas = document.createElement("canvas");

    // Set internal resolution (draw size)
    canvas.width = 300;
    canvas.height = 200;

    // Responsive layout via CSS
    canvas.className = "w-100 rounded border mb-2"; // Bootstrap
    canvas.style.aspectRatio = "3 / 2"; // keeps 300x200 ratio (optional)
    canvas.style.border = "2px solid green";
    canvas.style.objectFit = "cover"; // prevent stretch/squish
    canvas.style.display = "block";
  
    // 🟩 Status
    const statusText = document.createElement("p");
    statusText.id = "video-status";
    statusText.className = "text-muted small";
    statusText.innerText = "👾 Waiting for stream to start...";
  
    // 🧱 Insert before the hidden video tag
    const remoteVideo = document.getElementById("remoteVideo");
    cardBody.insertBefore(canvas, remoteVideo);
    cardBody.insertBefore(statusText, remoteVideo);
  
    // 🖼️ Draw stream into canvas
    const ctx = canvas.getContext("2d");
    setInterval(() => {
      if (vid.readyState >= 2) {
        ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
      }
    }, 100);
  });

// In video_call.js
function initializeStreaming() {
    const isStreamer = document.getElementById("chat-room-id").dataset.isStreamer === "true";
  
    // Initialize peer connection immediately for both sides
    window.peerConnection = new RTCPeerConnection(config);
    window.pendingCandidates = [];
  
    // Set up event handlers
    window.peerConnection.ontrack = event => {
        console.log("📺 Received remote stream");
        const remoteVideo = document.getElementById("remoteVideo");
        if (event.streams && event.streams[0]) {
          remoteVideo.srcObject = event.streams[0];
          remoteVideo.onloadedmetadata = () => {
            console.log("🎥 Remote video ready to play");
            remoteVideo.play()
              .then(() => {
                document.getElementById("video-status").innerText = "👾 Streamer is now live...";
              })
              .catch(e => {
                console.error("❌ Video play error:", e);
              });
          };
        } else {
          console.warn("⚠️ No remote streams in event");
        }
      };

    // 🔽 ADD THIS BLOCK HERE:
    document.body.addEventListener("click", () => {
        const remoteVideo = document.getElementById("remoteVideo");
        if (remoteVideo && remoteVideo.paused) {
        remoteVideo.play().then(() => {
            console.log("▶️ Remote video started by user click");
        }).catch(err => {
            console.warn("⚠️ Remote video play error after user interaction:", err);
        });
        }
    });
  
    window.peerConnection.onicecandidate = event => {
      if (event.candidate) {
        sendSignal({
          type: "ice",
          candidate: event.candidate,
        });
      }
    };
  
    if (isStreamer) {
      // Streamer setup
      const streamButton = document.getElementById("start-stream");
      if (streamButton) {
        streamButton.addEventListener("click", handleStreamStart);
      }
    } else {
      // Viewer-specific setup
      console.log("👀 Viewer ready, waiting for offer...");
      // Check for pending offer every 500ms
      const offerCheckInterval = setInterval(() => {
        if (window.pendingOffer) {
          console.log("📨 Processing pending offer");
          window.processOffer(window.pendingOffer);
          window.pendingOffer = null;
          clearInterval(offerCheckInterval);
        }
      }, 500);
    }
  }

function handleStreamStart() {
    const localVideo = document.getElementById("localVideo");
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStream = stream;
        localVideo.srcObject = stream;
        console.log("📹 Local stream acquired");
  
        // 👉 Add this here
        const statusElement = document.getElementById("video-status");
        if (statusElement) {
          statusElement.innerText = "👾 You are now streaming";
        }

        // Add tracks to peer connection
        stream.getTracks().forEach(track => {
            console.log("🎙️ Adding track:", track.kind);
            window.peerConnection.addTrack(track, stream);
        });
  
        return window.peerConnection.createOffer();
      })
      .then(offer => {
        console.log("📨 Created offer");
        return window.peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        console.log("📤 Sending offer");
        sendSignal({
          type: "offer",
          sdp: window.peerConnection.localDescription.sdp,
        });
      })
      .catch(error => {
        console.error("❌ Stream setup error:", error);
      });
  }

function handleIceCandidate(event) {
  if (event.candidate) {
    sendSignal({
      type: "ice",
      candidate: event.candidate,
    });
  }
}

function handleRemoteTrack(event) {
  const remoteVideo = document.getElementById("remoteVideo");
  console.log("📺 Received remote track");
  if (event.streams && event.streams[0]) {
    remoteVideo.srcObject = event.streams[0];
  }
}

function sendSignal(data) {
  const chatRoomElement = document.getElementById("chat-room-id");
  const chatRoomId = chatRoomElement.dataset.chatRoomId;
  const senderId = chatRoomElement.dataset.senderId;

  if (!window.chatRoomChannel) {
    console.error("❌ chatRoomChannel not ready");
    return;
  }

  window.chatRoomChannel.sendSignal({
    ...data,
    sender_id: senderId,
  });
}

window.addEventListener('beforeunload', () => {
    console.log("🧹 Cleaning up WebRTC resources");
    if (window.peerConnection) {
      console.log("🚪 Closing peer connection");
      window.peerConnection.close();
    }
    if (localStream) {
      console.log("🛑 Stopping local stream tracks");
      localStream.getTracks().forEach(track => track.stop());
    }
  });