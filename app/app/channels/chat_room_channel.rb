class ChatRoomChannel < ApplicationCable::Channel
  def subscribed
    chat_room_id = params[:chat_room_id]
    stream_from "chat_room_#{chat_room_id}"
  end

  def unsubscribed
    # Cleanup if needed
  end
end