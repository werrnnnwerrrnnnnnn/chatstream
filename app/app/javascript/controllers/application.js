import { Application } from "@hotwired/stimulus"
import AutoScrollController from "./auto_scroll_controller"

const application = Application.start()
application.register("auto-scroll", AutoScrollController)

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

export { application }
