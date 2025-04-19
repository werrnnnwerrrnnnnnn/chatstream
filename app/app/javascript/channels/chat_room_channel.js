import consumer from "./consumer";

const chatRoomElement = document.getElementById("chat-room-id");

if (chatRoomElement) {
  const chatRoomId = chatRoomElement.dataset.chatRoomId;

  window.chatRoomChannel = consumer.subscriptions.create(
    { channel: "ChatRoomChannel", chat_room_id: chatRoomId },
    {
      received(data) {
        console.log("📨 Received signaling:", data);
        
        const senderId = document.getElementById("chat-room-id").dataset.senderId;
        if (data.sender_id === senderId) return;

        if (data.type === "offer") {
          if (!window.peerConnection) {
            return console.error("❌ No peerConnection yet");
          }

          window.peerConnection.setRemoteDescription(
            new RTCSessionDescription({ type: "offer", sdp: data.sdp })
          ).then(async () => {
            const answer = await window.peerConnection.createAnswer();
            await window.peerConnection.setLocalDescription(answer);

            window.chatRoomChannel.send({
              chat_room_id: chatRoomId,
              data: {
                type: "answer",
                sdp: answer.sdp
              }
            });
          });
        } else if (data.type === "answer") {
          if (!window.peerConnection) return;
          window.peerConnection.setRemoteDescription(
            new RTCSessionDescription({ type: "answer", sdp: data.sdp })
          );
        } else if (data.type === "ice") {
          if (!window.peerConnection) return;
          window.peerConnection.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
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