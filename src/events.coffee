events =
  jquery:
    auth: "auth.rc.widget"
    retry: "retry.rc.widget"
    fallback: "fallback.rc.widget"
    max_validations: "max_validations.rc.widget"
    verified: "verified.rc.widget"
    error: "error.rc.widget"
    reload: "reload.rc.widget"
    pending: "pending.rc.widget"
    shown: "shown.rc.widget"
    ready: "ready.rc.widget"
  zepto:
    auth: "widget:auth"
    retry: "widget:retry"
    fallback: "widget:fallback"
    max_validations: "widget:max_validations"
    verified: "widget:verified"
    error: "widget:error"
    reload: "widget:reload"
    pending: "widget:pending"
    shown: "widget:shown"
    ready: "widget:ready"

module.exports = if jQuery? then events.jquery else events.zepto
