let localStream;
let peerConnection;
window.peerConnection = null;

const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// ✅ Wait for DOM + channel to be ready
document.addEventListener("DOMContentLoaded", () => {
  const waitForChannel = () => {
    if (window.chatRoomChannel && typeof window.chatRoomChannel.send === "function") {
      console.log("✅ chatRoomChannel ready. Setting up video...");
      initializeVideoSetup();
    } else {
      console.warn("⏳ Waiting for chatRoomChannel...");
      setTimeout(waitForChannel, 100);
    }
  };
  waitForChannel();
});

function initializeVideoSetup() {
  const startButton = document.getElementById("start-video");
  const localVideo = document.getElementById("localVideo");

  if (!startButton || !localVideo) {
    console.error("❌ Missing video call elements");
    return;
  }

  startButton.addEventListener("click", async () => {
    console.log("▶️ Start Video Clicked");

    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localVideo.srcObject = localStream;
      console.log("✅ Local stream started");

      peerConnection = new RTCPeerConnection(config);
      window.peerConnection = peerConnection;

      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.ontrack = event => {
        document.getElementById("remoteVideo").srcObject = event.streams[0];
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      sendSignal({
        type: "offer",
        sdp: offer.sdp
      });

      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          sendSignal({
            type: "ice",
            candidate: event.candidate
          });
        }
      };
    } catch (err) {
      console.error("❌ Error accessing media devices:", err);
    }
  });
}

function sendSignal(data) {
  const chatRoomId = document.getElementById("chat-room-id").dataset.chatRoomId;
  const senderId = document.getElementById("chat-room-id").dataset.senderId;

  if (!window.chatRoomChannel) {
    console.error("❌ chatRoomChannel is not defined");
    return;
  }

  window.chatRoomChannel.send({
    chat_room_id: chatRoomId,
    data: {
      ...data,
      sender_id: senderId
    }
  });
}