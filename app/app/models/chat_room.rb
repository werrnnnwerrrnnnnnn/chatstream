class ChatRoom < ApplicationRecord
  belongs_to :streamer, class_name: "User", optional: true
  has_many :messages
  has_many :chat_room_users
  has_many :users, through: :chat_room_users

  def participants
    users.distinct
  end
end