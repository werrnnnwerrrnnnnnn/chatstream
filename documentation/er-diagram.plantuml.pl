@startuml

hide circle

entity "Users" as users {
    * id : bigint (PK)
    * email : string
    * encrypted_password : string
    * reset_password_token : string
    * reset_password_sent_at : timestamp
    * remember_created_at : timestamp
    * created_at : timestamp
    * updated_at : timestamp
}

entity "ChatRooms" as chat_rooms {
    * id : bigint (PK)
    * name : string
    * streamer_id : integer (FK to Users)
    * created_at : timestamp
    * updated_at : timestamp
}

entity "Messages" as messages {
    * id : bigint (PK)
    * content : text
    * user : string
    * chat_room_id : bigint (FK to ChatRooms)
    * user_id : bigint (FK to Users)
    * created_at : timestamp
    * updated_at : timestamp
}

users ||--o{ chat_rooms : "streamer_id"
users ||--o{ messages : "user_id"
chat_rooms ||--o{ messages : "chat_room_id"

@enduml