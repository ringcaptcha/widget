$ = require('../zepto')

CodeHandler = require('../handler/code')

events = require('../events')
session = require('../util/session')

class CodeStep

  el = undefined
  wrapper = undefined
  i18n = undefined
  api = undefined

  checkUrlInterval = undefined

  codeHandler = undefined

  ###
  Constructor.
  ###
  constructor: (ele, i18na, apia, appMode) ->
    wrapper = ele
    i18n = i18na
    api = apia
    mode = appMode

  setMode: (appMode) ->
    mode = appMode

  ###
  Setup code step.
  ###
  setup: ->

    wrapper
      .on('keypress', '.digit', onlyAllowNumbers)
      .on('keyup', '.digit', switchPinInput)
      .on('click', '.js-try-again', tryAgain)
      .on('click', '.js-call-now', fallbackToVoice)
      .on(events.shown, onShown)

    wrapper.find('.ringcaptcha.widget').addClass('overflow')

    codeHandler = new CodeHandler(wrapper, api, i18n)

    render()

  ###
  Render code step.
  ###
  render = ->

    el = $ require('../../resources/views/verification/step/code.html')(i18n: i18n)

    key = if api.data.dispatchType in ['sms', 'url_sms'] then 'check.title.sms' else 'check.title.voice'

    el.find('.title').text(i18n.trans(key))
    el.find('.phone-number').text(api.data.phoneNumber)

    wrapper.find('[name="ringcaptcha_phone_number"]').val(api.data.phoneNumber);

    $countdown = el.find('.countdown')
    $try = el.find('.tryagain')
    $tryorcall = el.find('.tryorcall')

    showLinks = ->
      $countdown.addClass('hide')
      if api.data.dispatchType in ['sms', 'url_sms'] and ( ('V' in api.data.features and api.data.attempts >= 2) or ('F' in api.data.features and api.data.attempts >= 1) )
        $tryorcall.removeClass('hide')
      else
        $try.removeClass('hide')

    if api.data.retryAt > new Date().getTime()
      countdownInterval = ->
        remaining = Math.round((api.data.retryAt - new Date().getTime()) / 1000)
        if remaining > 0
          value = i18n.transChoice('check.countdown.seconds', remaining, { remaining: '<strong>' + remaining + '</strong>' })
          $countdown.removeClass('hide').html(value)
        else
          showLinks()
          clearTimeout(countdownTimeout)
        countdownTimeout = setTimeout(countdownInterval, 1000)
      countdownInterval()
    else
      showLinks()

    wrapper.find('.wizard').html(el)

  ###
  Teardown code step.
  ###
  teardown: ->

    wrapper
      .off('keypress', '.digit')
      .off('keyup', '.digit')
      .off('click', '.js-try-again')
      .off('click', '.js-call-now')
      .off(events.shown)

    wrapper.find('.ringcaptcha.widget').removeClass('overflow')

    wrapper.find('.wizard').empty()

  ###
  Allow only numbers.
  ###
  onlyAllowNumbers = (event) ->
    unless 48 <= event.which <= 57 or event.which is 8
      event.preventDefault()

  onShown = ->

    wrapper.find('.digit:first').focus()

  ###
  ###
  switchPinInput = (event) ->

    goBackward = false
    previousDigits = $(this).prevAll('.digit').get().reverse()

    $(previousDigits).each (i, item) ->
      unless $(this).val()
        $(this).focus()
        goBackward = true
        return false

    @value = '' if goBackward

    if 'I' in api.data.features
      if @value
        $(this).prop('disabled', true).next('.digit').focus()
      else unless event.which isnt 8
        $(this).prev('.digit').prop('disabled', false).select()
    else
      if @value
        $(this).next('.digit').focus()
      else unless event.which isnt 8
        $(this).prev('.digit').select()

    getValue = -> @value
    code = wrapper.find('.digit').map(getValue).get().join('')

    wrapper.find('[name="ringcaptcha_pin_code"]').val(code)

    if code.length is 4 and 'I' in api.data.features
      codeHandler.handle(code)

  tryAgain = (event) ->
    session.updateSession(api.data.app, status: 'new')
    wrapper.triggerHandler(events.retry)
    event.preventDefault()

  fallbackToVoice= (event) ->
    codeHandler.handleFallback()
    event.preventDefault()


module.exports = CodeStep
