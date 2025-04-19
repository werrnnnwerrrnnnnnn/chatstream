class ChatRoomChannel < ApplicationCable::Channel
  def subscribed
    @chat_room_id = params[:chat_room_id]
    stream_from "chat_room_#{@chat_room_id}"
  end

  def unsubscribed
    # Any cleanup when channel is unsubscribed
  end

  def signal(data)
    chat_room_id = data["chat_room_id"]
    payload = data["data"]

    ActionCable.server.broadcast("chat_room_#{chat_room_id}", payload)
  end
end