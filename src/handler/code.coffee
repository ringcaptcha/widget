session = require('../util/session')
events = require('../events')
$ = require('../zepto')

class CodeHandler

  inlineErrors = ['invalid_number', 'country_not_supported', 'invalid_number_length', 'max_attempts_reached']

  clearIntervalInEvents = [
    events.retry
    events.fallback
    events.max_validations
    events.verified
    events.error
  ]

  handleUrlInterval = undefined

  ###
  Constructor.
  ###
  constructor: (@wrapper, @api, @i18n) ->

    if @api.data.dispatchType in ['sms', 'url_sms'] and 'U' in @api.data.features
      handleUrlInterval = setInterval($.proxy(@handleUrl, @), 5000)

    wrapper.on(clearIntervalInEvents.join(' '), @clearInterval)

  ###
  Handle PIN code verification.
  ###
  handle: (code) ->

    # Disable digits inputs.
    digits = @wrapper.find('.digit').trigger('blur').prop('disabled', true)

    # Trigger `verified` event.
    doneCallback = =>
      @wrapper.triggerHandler(events.verified)

    # Show an inline error or trigger `error` event when fatal error occurs.
    failCallback = (error) =>

      if error is 'invalid_pin_code'
        @showInlineError(error)
      else if error is 'max_validations_reached'
        event = $.Event(events.max_validations)
        event.error = error
        session.updateSession(@api.data.app, expiresAt: -1)
        @wrapper.triggerHandler(event)
      else
        event = $.Event(events.error)
        event.error = error
        @wrapper.triggerHandler(event)

    # Enable digits inputs.
    alwaysCallback = -> digits.val('').prop('disabled', false)

    # Magic happends here :)
    @api.check(code).done(doneCallback).fail(failCallback).always(alwaysCallback)

  ###
  Handle PIN code verification via URL.
  ###
  handleUrl: ->

    # Trigger `verified` event and stops interval.
    doneCallback = (code) =>
      @wrapper.triggerHandler(events.verified, [code])

    failCallback = (error) =>
      if error == 'invalid_session' || error == 'session_expired'
        @api.data.retryAt = 0
        session.updateSession(@api.data.app, expiresAt: -1)
        event = $.Event(events.error)
        event.error = error
        @wrapper.triggerHandler(event)

    # Magic happends here :)
    @api.checkUrl().done(doneCallback).fail(failCallback)

  ###
  Handle fallback
  ###
  handleFallback: ->

    digits = @wrapper.find('.digit').trigger('blur').prop('disabled', true)

    doneCallback = => @wrapper.triggerHandler(events.fallback)

    failCallback = =>

      if error in inlineErrors
        @showInlineError(error)
      else
        event = $.Event(events.error)
        event.error = error
        @wrapper.triggerHandler(event)

    alwaysCallback = -> digits.val('').prop('disabled', false)

    @api.code(@api.data.phoneNumber, 'voice').done(doneCallback).fail(failCallback).always(alwaysCallback)

  ###
  ###
  clearInterval: -> clearInterval(handleUrlInterval)

  ###
  ###
  showInlineError: (error) ->

    message = @i18n.trans("error.#{error}")
    originalText = @i18n.trans("check.summary")

    @wrapper.find('.help').addClass('active')
    @wrapper.find('.pin-summary').parent('div').addClass('has-error')
    @wrapper.find('.pin-summary').text(message)

    @wrapper.find('.digit').one 'focus', =>
      @wrapper.find('.help').removeClass('active')
      @wrapper.find('.pin-summary').parent('div').removeClass('has-error')
      @wrapper.find('.pin-summary').text(originalText)

module.exports = CodeHandler
