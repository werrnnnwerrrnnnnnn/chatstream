import consumer from "channels/consumer"

consumer.subscriptions.create("ChatRoomChannel", {
  connected() {
    // Called when the subscription is ready for use on the server
  },

  disconnected() {
    // Called when the subscription has been terminated by the server
  },

  received(data) {
    // Called when there's incoming data on the websocket for this channel
  }
});

const chatRoomElement = document.getElementById("chat-room-id")
if (chatRoomElement) {
  const chatRoomId = chatRoomElement.dataset.chatRoomId

  consumer.subscriptions.create(
    { channel: "ChatRoomChannel", chat_room_id: chatRoomId },
    {
      received(data) {
        const messagesContainer = document.getElementById("messages")
        messagesContainer.insertAdjacentHTML("beforeend", data.message)
      }
    }
  )
}
