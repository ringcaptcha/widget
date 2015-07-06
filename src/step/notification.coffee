$ = require('../zepto')

NotificationHandler = require('../handler/notification')

class NotificationStep

  mode = undefined

  ###
  Constructor.
  ###
  constructor: (@wrapper, @i18n, @api, appMode) ->
    @notificationHandler = new NotificationHandler(@wrapper, @api)
    mode = appMode

  setMode: (appMode) ->
    mode = appMode

  ###
  Setup notification step.
  ###
  setup: (@messageKey, @isError, @reload = false, @anchor = false) ->
    @wrapper.on('click', '.js-reload', @notificationHandler.reload) if @reload
    @wrapper.find('#powered').hide()
    @render()

  ###
  Render notification step.
  ###
  render: ->

    onboarding_template = require("../../resources/views/onboarding/step/notification.html")
    verification_template = require("../../resources/views/verification/step/notification.html")

    template = if (mode is 'onboarding' or mode is 'distribution') then onboarding_template else verification_template

    el = $ template(i18n: @i18n)

    el.find('.icon').addClass "icon-#{ if @isError then 'error' else 'success' }"
    el.find('h4').text @messageKey

    if @reload

      el.find('.reload').removeClass('hide')

      $countdown = el.find('.countdown')
      $try = el.find('.tryagain')

      showLinks = ->
        $countdown.addClass('hide')
        $try.removeClass('hide')

      if @api.data.retryAt > new Date().getTime()
        countdownInterval = =>
          remaining = Math.round((@api.data.retryAt - new Date().getTime()) / 1000)
          if remaining > 0
            value = @i18n.transChoice('check.countdown.seconds', remaining, { remaining: '<strong>' + remaining + '</strong>' })
            $countdown.removeClass('hide').html(value)
          else
            showLinks()
            clearTimeout(countdownTimeout)
          countdownTimeout = setTimeout(countdownInterval, 1000)
        countdownInterval()
      else
        showLinks()

    if @anchor
      el.find('.anchor').removeClass('hide').attr('href', @anchor[1]).text(@anchor[0])

    @wrapper.find('.wizard').html(el)

  ###
  Teardown notification step.
  ###
  teardown: ->
    @wrapper.off('click', '.js-reload') if @reload
    @wrapper.find('#powered').show()
    @wrapper.find('.wizard').empty()

module.exports = NotificationStep
