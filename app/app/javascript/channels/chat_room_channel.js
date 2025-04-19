import consumer from "./consumer";

const chatRoomElement = document.getElementById("chat-room-id");

if (chatRoomElement) {
  const chatRoomId = chatRoomElement.dataset.chatRoomId;
  const senderId = chatRoomElement.dataset.senderId;

  window.chatRoomChannel = consumer.subscriptions.create(
    { channel: "ChatRoomChannel", chat_room_id: chatRoomId },
    {
      connected() {
        // ✅ Dispatch a custom event when ready
        document.dispatchEvent(new Event("chatRoomChannelReady"));
      },

      received(data) {
        console.log("📨 Received signaling:", data);

        // 👤 Skip if it's your own signal
        if (data.sender_id === senderId) return;

        // ❗ Safety check
        if (!window.peerConnection) {
          console.warn("⚠️ No peerConnection yet. Ignoring signal.");
          return;
        }

        if (data.type === "offer") {
          window.peerConnection.setRemoteDescription(new RTCSessionDescription({
            type: "offer",
            sdp: data.sdp
          })).then(async () => {
            const answer = await window.peerConnection.createAnswer();
            await window.peerConnection.setLocalDescription(answer);
            window.chatRoomChannel.send({
              chat_room_id: chatRoomId,
              data: {
                type: "answer",
                sdp: answer.sdp,
                sender_id: senderId
              }
            });
          });
        } else if (data.type === "answer") {
          window.peerConnection.setRemoteDescription(new RTCSessionDescription({
            type: "answer",
            sdp: data.sdp
          }));
        } else if (data.type === "ice") {
          window.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      },

      sendSignal(data) {
        this.send({
          chat_room_id: chatRoomId,
          data: data
        });
      }
    }
  );
}