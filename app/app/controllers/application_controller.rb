class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # def after_sign_in_path_for(resource)
  #   profile_path(current_user.profile) || new_profile_path
  # end
end
