class ChatRoomsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_chat_room, only: %i[ show edit update destroy ]
  before_action :authorize_owner!, only: [:destroy]
  rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found

  # GET /chat_rooms or /chat_rooms.json
  def index
    @chat_rooms = ChatRoom.all
  end

  # GET /chat_rooms/1 or /chat_rooms/1.json
  def show
    @chat_room = ChatRoom.find(params[:id])
  
    puts "📦 All users in chat room: #{@chat_room.users.inspect}"
    
    # @receiver = @chat_room.users.where.not(id: @current_user.id).first
    puts "📡 Receiver resolved: #{@receiver&.name || 'nil'}"
  end

  # GET /chat_rooms/new
  def new
    @chat_room = ChatRoom.new
  end

  # GET /chat_rooms/1/edit
  def edit
  end

  # POST /chat_rooms or /chat_rooms.json
  def create
    @chat_room = ChatRoom.new(chat_room_params)
    @chat_room.streamer = current_user
  
    respond_to do |format|
      if @chat_room.save
        format.html { redirect_to chat_room_url(@chat_room), notice: "Chat room was successfully created." }
        format.json { render :show, status: :created, location: @chat_room }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @chat_room.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /chat_rooms/1 or /chat_rooms/1.json
  def update
    respond_to do |format|
      if @chat_room.update(chat_room_params)
        format.html { redirect_to chat_room_url(@chat_room), notice: "Chat room was successfully updated." }
        format.json { render :show, status: :ok, location: @chat_room }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @chat_room.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /chat_rooms/1 or /chat_rooms/1.json
  def destroy
    @chat_room.destroy
    redirect_to chat_rooms_path, notice: "Chat room deleted successfully."
  end

  def authorize_owner!
    unless current_user.id == @chat_room.streamer_id
      redirect_to chat_rooms_path, alert: "You are not authorized to delete this room."
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_chat_room
      @chat_room = ChatRoom.includes(:streamer).find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def chat_room_params
      params.require(:chat_room).permit(:name)
    end

    def handle_not_found
      redirect_to chat_rooms_path, alert: "⚠️ Chat room not found."
    end
end
