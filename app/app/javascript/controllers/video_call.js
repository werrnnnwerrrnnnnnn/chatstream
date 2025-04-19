let localStream;
let peerConnection;
window.peerConnection = null;

const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

document.addEventListener("chatRoomChannelReady", () => {
    console.log("✅ chatRoomChannel ready. Setting up video...");
    initializeVideoSetup();
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
        console.log("📺 Got remote track", event.streams);

        const remoteVideo = document.getElementById("remoteVideo");
        if (remoteVideo) {
          // 🔁 Always set new stream — even if already assigned
          remoteVideo.srcObject = event.streams[0];
          remoteVideo.play().catch(e => console.warn("⚠️ remoteVideo play failed:", e));
        } else {
          console.warn("❌ remoteVideo element not found");
        }
      };

      const senderId = document.getElementById("chat-room-id").dataset.senderId;

      // 🔧 TEMP: You should dynamically get both IDs.
      // For now we use fixed partner ID list for testing
      const receiverId = document.getElementById("chat-room-id").dataset.receiverId;
      const allIds = [senderId, receiverId].sort();
      const isInitiator = senderId === allIds[0];
      
      if (isInitiator) {
        console.log("🚀 Acting as initiator, sending offer");
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        sendSignal({ type: "offer", sdp: offer.sdp });
      } else {
        console.log("🕓 Waiting for offer from peer");
      }

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

  window.chatRoomChannel.perform("signal", {
    chat_room_id: chatRoomId,
    data: {
      ...data,
      sender_id: senderId
    }
  });
}