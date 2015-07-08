events = require('../events')
$ = require('../zepto')

class PhoneHandler

  ###
  This errors must be displayed inline.
  ###
  inlineErrors = ['invalid_number', 'country_not_supported', 'invalid_number_length', 'max_attempts_reached']
  hiddenCountry = undefined
  ###
  Constructor.
  ###
  constructor: (@wrapper, @api, @i18n) ->
    hiddenCountry = wrapper.data('hide-country')
  ###
  Handle PIN code.
  ###
  handle: (phoneNumber, dispatchType) ->

    # Disable step inputs.
    stepElements = @wrapper.find('.js-send-code, .phone-input, .method-input input, .country-button')
    stepElements.prop('disabled', true)

    if (@api.mode is 'onboarding' or @api.mode is 'distribution')
      btn = @wrapper.find('.js-send-code')
      oldText = btn.text()
      btn.text('Texting you...');

    # Trigger `pending` event.
    doneCallback = =>
      if (@api.mode is 'onboarding' or @api.mode is 'distribution')
        btn.text('Sent!');
        @wrapper.find('#js-inline-alert').addClass('hide');
        @wrapper.find('#js-inline-countdown').removeClass('hide');
        $countdown = @wrapper.find('.countdown')
        $try = @wrapper.find('.tryagain')
        showLinks = ->
          $countdown.addClass('hide')
          $try.removeClass('hide')
        if @api.data.retryAt > new Date().getTime()
          countdownInterval = =>
            remaining = Math.round((@api.data.retryAt - new Date().getTime()) / 1000)
            if remaining > 0
              value = @i18n.t('check.countdown.seconds', remaining)
              $countdown.removeClass('hide').html(value)
            else
              showLinks()
              clearTimeout(countdownTimeout)
            countdownTimeout = setTimeout(countdownInterval, 1000)
          countdownInterval()
        else
          showLinks()
      else
        @wrapper.triggerHandler($.Event(events.pending))

    # Show an inline error or trigger `error` event when fatal error occurs.
    failCallback = (error) =>
      if (@api.mode is 'onboarding' or @api.mode is 'distribution')
        btn.text(oldText);
      if error in inlineErrors
        @showInlineError(error)
      else
        event = $.Event(events.error)
        event.error = error
        @wrapper.triggerHandler(event)
      stepElements.prop('disabled', false)

    # Enable step inputs.
    alwaysCallback = =>
      unless (@api.mode is 'onboarding' or @api.mode is 'distribution')
        stepElements.prop('disabled', false)

    fullPhoneNumber = if hiddenCountry then "+#{phoneNumber.phoneNumber}" else "+#{phoneNumber.countryCode}#{phoneNumber.phoneNumber}"

    if not phoneNumber.phoneNumber? or phoneNumber.phoneNumber.length < 5 or fullPhoneNumber.length > 15
      failCallback('invalid_number_length')
      alwaysCallback()
      return

    # Magic happends here :)
    @api.code(fullPhoneNumber, dispatchType, @i18n.locale()).done(doneCallback).fail(failCallback).always(alwaysCallback)

  ###
  Show inline error.
  ###
  showInlineError: (error) ->

    message = @i18n.t("error.#{error}")

    @wrapper.find('.phone-input').get(0).setSelectionRange(30, 30)

    if (@api.mode is 'onboarding' or @api.mode is 'distribution')
      @wrapper.find('#js-inline-alert').addClass('text-danger').text(message)
      @wrapper.find('.phone-input').one 'focus', =>
        @wrapper.find('#js-inline-alert').removeClass('text-danger').text('We\'ll text you a link to download the app')
    else
      originalText = @i18n.t("code.summary")
      @wrapper.find('.help').addClass('active')
      summary = @wrapper.find('.phone-box').addClass('has-error').find('.summary').text(message)
      @wrapper.find('.phone-input').one 'keyup', =>
        @wrapper.find('.help').removeClass('active')
        summary = @wrapper.find('.phone-box').removeClass('has-error').find('.summary').text(originalText)

module.exports = PhoneHandler
