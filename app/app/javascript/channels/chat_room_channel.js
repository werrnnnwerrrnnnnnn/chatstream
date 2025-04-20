import consumer from "./consumer";

const chatRoomElement = document.getElementById("chat-room-id");

if (chatRoomElement) {
  const chatRoomId = chatRoomElement.dataset.chatRoomId;
  const senderId = chatRoomElement.dataset.senderId;

  window.pendingOffer = null;
  window.pendingCandidates = [];

  window.chatRoomChannel = consumer.subscriptions.create(
    { channel: "ChatRoomChannel", chat_room_id: chatRoomId },
    {
      connected() {
        document.dispatchEvent(new Event("chatRoomChannelReady"));
      },

      received(data) {
        console.log("📨 Received signaling:", data);

        if (data.sender_id === senderId) return;

        switch (data.type) {
          case "offer":
            if (!window.peerConnection) {
              window.pendingOffer = data;
              console.warn("⚠️ No peerConnection yet. Offer stored.");
            } else if (!window.peerConnection.remoteDescription) {
              processOffer(data);
            }
            break;

          case "answer":
            if (!window.peerConnection) {
              console.error("❌ No peerConnection to set answer");
              return;
            }
            window.peerConnection.setRemoteDescription(
              new RTCSessionDescription({
                type: "answer",
                sdp: data.sdp,
              })
            ).then(() => {
              console.log("✅ Answer set");
              // Process any queued ICE candidates
              processPendingCandidates();
            }).catch(e => console.error("❌ Answer error:", e));
            break;

            case "ice":
              if (!window.peerConnection) {
                console.warn("⚠️ No peerConnection yet. ICE candidate stored.");
                window.pendingCandidates.push(data.candidate);
                return;
              }
            
              // Only add if remoteDescription exists and has a type (offer or answer)
              if (
                window.peerConnection.remoteDescription &&
                window.peerConnection.remoteDescription.type
              ) {
                window.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
                  .then(() => console.log("✅ ICE candidate added"))
                  .catch(e => console.error("❌ addIceCandidate error:", e));
              } else {
                console.warn("🧊 ICE candidate received before remote description, queueing...");
                window.pendingCandidates.push(data.candidate);
              }
              break;
        }
      },

      sendSignal(data) {
        this.perform("signal", {
          chat_room_id: chatRoomId,
          data: data,
        });
      },
    }
  );

  function processOffer(data) {
    const pc = window.peerConnection;
  
    if (!pc) {
      console.warn("⚠️ No peerConnection to process offer");
      return;
    }
  
    // Prevent duplicate offer handling
    if (pc.signalingState !== "stable") {
      console.warn("⚠️ Skipping offer: PeerConnection not in stable state:", pc.signalingState);
      return;
    }
  
    console.log("📨 Processing offer");
  
    pc.setRemoteDescription(new RTCSessionDescription({
      type: "offer",
      sdp: data.sdp,
    }))
      .then(() => {
        return pc.createAnswer();
      })
      .then(answer => {
        return pc.setLocalDescription(answer).then(() => answer);
      })
      .then(answer => {
        console.log("✅ Sending answer");
        window.chatRoomChannel.sendSignal({
          type: "answer",
          sdp: answer.sdp,
          sender_id: senderId,
        });
  
        // Safely process any queued ICE
        processPendingCandidates();
      })
      .catch(e => {
        console.error("❌ Failed to process offer:", e);
      });
  }

  function processPendingCandidates() {
    const pc = window.peerConnection;
  
    if (
      window.pendingCandidates.length > 0 &&
      pc &&
      pc.remoteDescription &&
      pc.remoteDescription.type
    ) {
      console.log("🧊 Processing", window.pendingCandidates.length, "queued ICE candidates");
  
      window.pendingCandidates.forEach(candidate => {
        pc.addIceCandidate(new RTCIceCandidate(candidate))
          .then(() => console.log("✅ Added queued ICE candidate"))
          .catch(e => console.error("❌ Failed to add queued ICE candidate:", e));
      });
  
      window.pendingCandidates = [];
    } else {
      console.warn("⚠️ Skipping ICE candidate processing. Remote description not ready.");
    }
  }

  window.processOffer = processOffer;
  window.processPendingCandidates = processPendingCandidates;
}