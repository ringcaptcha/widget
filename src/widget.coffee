$ = require('./zepto')
PhoneStep = require('./step/phone')
CodeStep = require('./step/code')
NotificationStep = require('./step/notification')
Api = require('./api')
I18n = require('./i18n')
events = require('./events')
geolocation = require('./util/geolocation')
session = require('./util/session')
popup = require('./util/popup')

class Widget

  wrapper = undefined
  options = undefined
  userEvents = undefined
  i18n = undefined
  api = undefined
  phoneStep = undefined
  codeStep = undefined
  notificationStep =
  currentStep = undefined
  mode = undefined

  constructor: (el, key, optionsHash = {}) ->

    wrapper = $(el)

    if $.isPlainObject key
      optionsHash = key
      key = optionsHash.app

    options = $.extend({}, wrapper.data(), optionsHash)

    if options.events?
      userEvents = options.events
      delete options.events

    throw new Error('Missing container element.') unless wrapper.length > 0

    mode = options.mode ? 'verification'

    api = new Api(wrapper, key, mode, options)
    i18n = new I18n()

    phoneStep = new PhoneStep(wrapper, i18n, api, mode)
    codeStep = new CodeStep(wrapper, i18n, api)
    notificationStep = new NotificationStep(wrapper, i18n, api, mode)

    doneCallback = ->
      sess = session.getSession(options.app)
      locale = options.locale or sess.locale or api.data.locale
      i18n.load(locale).done(render).fail(throwError)

    api.auth().done(validateFeatures, doneCallback).fail(throwError)

  setup: ->
    console.warn('The setup method is deprecated and will be removed in the next major version.')
    @

  validateFeatures = ->
    if mode == 'onboarding' and 'O' not in api.data.features
      mode = 'verification'

    if mode == 'distribution' and 'T' not in api.data.features
      mode = 'verification'

    if mode == 'distribution'
      throw new Error('Missing app ID.') unless (options.iosid || options.androidid)?

    api.setMode(mode)
    notificationStep.setMode(mode)
    phoneStep.setMode(mode)

  setOptions: (wOptions) ->
    options = wOptions
    api.setOptions(options)

  ###
  Render widget.
  ###
  render = ->

    displayAlways = if options.displayAlways? then options.displayAlways in ['yes', 'true'] else true

    return if not displayAlways and api.data.supportedCountries.length > 0 and api.data.country not in api.data.supportedCountries

    onboarding_template = require("../resources/views/onboarding/base.html")
    verification_template = require("../resources/views/verification/base.html")

    template = if (mode is 'onboarding' or mode is 'distribution') then onboarding_template else verification_template

    wrapper.html template(i18n: i18n, support_email: api.data.supportEmail)

    if i18n.getDirection() is 'rtl'
      wrapper.find('.ringcaptcha.widget').attr('dir', 'rtl');

    if 'W' in api.data.features
      wrapper.find('.ringcaptcha.widget').addClass('no-brand')
      wrapper.find('.brand').remove()
      wrapper.find('#powered').remove()
    else
      setInterval ->
        wrapper.find('.wizard').after wrapper.find('#powered')
      , 200

    status = if (mode == 'onboarding' or mode == 'distribution') and api.data.status != 'new' then 'verified' else api.data.status

    switch true
      when status is 'new' or mode is 'onboarding' or mode is 'distribution'
        currentStep = phoneStep
      when status is 'pending'
        currentStep = codeStep
        wrapper.triggerHandler(events.pending)
      when status is 'verified'
        currentStep = notificationStep
        wrapper.triggerHandler(events.verified)

    currentStep.setMode(mode)

    if (mode is 'onboarding' or mode is 'distribution') and status is 'verified'
      currentStep.setup(i18n.trans('onboarding.success'), false, true)
    else
      currentStep.setup()

    if 'G' in api.data.features and api.data.geolocation
      geolocation.askGeolocation()

    setToken(api.data.token)

    wrapper
      .on(events.error, onFatalError)
      .on(events.pending, onPinCodeSent)
      .on(events.auth, setToken)
      .on(events.reload, onReload)
      .on(events.max_validations, onMaxValidationsReached)
      .on(events.retry, onRetry)
      .closest('form').on('submit', onFormSubmit).end()

    if userEvents?
      if userEvents.ready?
        wrapper.on(events.ready, userEvents.ready)
      if userEvents.retry?
        wrapper.on(events.retry, userEvents.retry)
      if userEvents.fallback?
        wrapper.on(events.fallback, userEvents.fallback)
      if userEvents.max_validations?
        wrapper.on(events.max_validations, userEvents.max_validations)
      if userEvents.verified?
        wrapper.on(events.verified, userEvents.verified)
      if userEvents.error?
        wrapper.on(events.error, userEvents.error)
      if userEvents.pending?
        wrapper.on(events.pending, userEvents.pending)

    if (mode isnt 'onboarding' and mode isnt 'distribution')
      wrapper
        .on('click', '.help', showHelp)
        .on(events.verified, onPhoneVerified)
        .on(events.fallback, onFallback)

    wrapper.triggerHandler(events.ready)

  ###
  Execute this method when a pin code is sent.
  ###
  onPinCodeSent = ->
    unless (mode is 'onboarding' or mode is 'distribution')
      fadeStep(codeStep)

  ###
  Execute this method when a phone is verified.
  ###
  onPhoneVerified = (e, code) ->
    if (code)
        wrapper.find('[name="ringcaptcha_pin_code"]').val(code)
    unless (mode is 'onboarding' or mode is 'distribution')
      fadeStep(notificationStep, i18n.trans('check.success'), false)

  ###
  Execute this method when user fallback to voice.
  ###
  onFallback = ->
    fadeStep(codeStep) # Re-render step.

  ###
  Execute this method when user try again.
  ###
  onRetry = ->
    fadeStep(phoneStep)

  ###
  Execute this method when an fatal error occurs.
  ###
  onFatalError = (error) ->
    errorKey = error.error ? error
    errorCode = errorKey.split('_').reduce(((a, b) -> a + b[0]), '')
    reload = errorKey isnt 'max_validations_reached' and api.data.attempts <= 3
    anchor = if errorKey is 'out_of_credits' then [i18n.trans('help.contact'), "mailto:#{api.data.supportEmail}?subject=Ref: #{errorCode.toUpperCase()}"] else false
    fadeStep(notificationStep, i18n.trans("error.#{errorKey}"), true, reload, anchor)

  ###
  Execute this method when widget must be reloaded.
  ###
  onReload = -> fadeStep(phoneStep)

  ###
  Execute this method when max validations is reached.
  ###
  onMaxValidationsReached = -> fadeStep(notificationStep, i18n.trans('error.max_validations_reached'), true, true)

  ###
  Execute this method when the parent form is submitted.
  ###
  onFormSubmit = (event) -> session.updateSession(options.app, isStatusAware: true) if 'I' not in api.data.features

  ###
  Throw an exception.
  ###
  throwError = (message) -> console.log(JSON.stringify(message))

  ###
  Show help modal.
  ###
  showHelp = (event) ->
    popup('https://ringcaptcha.com/widget/help/' + options.app + '/' + i18n.getLocale(), i18n.trans('help'), 600, 500);
    event.preventDefault()

  ###
  Set the current token.
  ###
  setToken = (session) ->
    wrapper.find('[name="ringcaptcha_session_id"]').val(session.token ? session)

  ###
  Make a fade effect between steps.
  ###
  fadeStep = (newStep, params...) ->
    wizard = wrapper.find('.wizard')
    wizard.fadeOut ->
      currentStep.teardown()
      newStep.setup.apply(newStep, params)
      wizard.fadeIn ->
        currentStep = newStep
        wrapper.triggerHandler(events.shown)

module.exports = Widget
