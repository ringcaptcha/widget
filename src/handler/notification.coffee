session = require('../util/session')
events = require('../events')
$ = require('../zepto')

class NotificationHandler

  wrapper = undefined
  api = undefined

  ###
  Constructor.
  ###
  constructor: (el, apia) ->
    wrapper = el
    api = apia

  ###
  Reload widget.
  ###
  reload: (event) ->

    doneCallback = -> wrapper.triggerHandler(events.reload)

    failCallback = (error) ->
      event = $.Event(events.error)
      event.error = error
      wrapper.triggerHandler(event)
    
    api.auth().done(doneCallback).fail(failCallback)

    event.preventDefault()

module.exports = NotificationHandler
