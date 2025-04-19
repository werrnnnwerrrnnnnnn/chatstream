class MessagesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_message, only: %i[ show edit update destroy ]

  # GET /messages or /messages.json
  def index
    @messages = Message.all
  end

  # GET /messages/1 or /messages/1.json
  def show
  end

  # GET /messages/new
  def new
    @message = Message.new
  end

  # GET /messages/1/edit
  def edit
  end

  # POST /messages or /messages.json
  def create
    @chat_room = ChatRoom.find(params[:chat_room_id])
    @message = @chat_room.messages.build(message_params)
  
    if @message.save
      # ✅ Broadcast the rendered message partial
      ActionCable.server.broadcast(
        "chat_room_#{@chat_room.id}",
        {
          message: render_to_string(partial: "messages/message", locals: { message: @message })
        }
      )
  
      respond_to do |format|
        format.html { redirect_to @chat_room, notice: 'Message was successfully created.' }
        format.json { render :show, status: :created, location: @message }
      end
    else
      respond_to do |format|
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @message.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /messages/1 or /messages/1.json
  def update
    respond_to do |format|
      if @message.update(message_params)
        format.html { redirect_to message_url(@message), notice: "Message was successfully updated." }
        format.json { render :show, status: :ok, location: @message }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @message.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /messages/1 or /messages/1.json
  def destroy
    @message.destroy!

    respond_to do |format|
      format.html { redirect_to messages_url, notice: "Message was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_message
      @message = Message.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def message_params
      params.require(:message).permit(:content, :user, :chat_room_id)
    end
end
