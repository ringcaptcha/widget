$ = require('../zepto')

getSession = (app) ->
  session = localStorage.getItem("ringcaptcha.widget.#{app}")
  return if session then JSON.parse(session) else false

setSession = (app, data) ->
  localStorage.setItem("ringcaptcha.widget.#{app}", JSON.stringify(data))

updateSession = (app, data) ->
  session = getSession(app)
  return false unless session
  session = $.extend(session, data)
  setSession(app, session)

module.exports = {getSession,setSession,updateSession}
