class AddStreamerIdToChatRooms < ActiveRecord::Migration[7.2]
  def change
    add_column :chat_rooms, :streamer_id, :integer
  end
end
