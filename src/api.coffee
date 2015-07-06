###
Load module dependencies.
###
$ = require('./zepto')
events = require('./events')
config = require('./config')
session = require('./util/session')
fingerprint = require('./util/fingerprint')
geolocation = require('./util/geolocation')
ajax = require('./util/ajax')

###
This class connects to the RingCaptcha API
###
class Api

  ###
  Define private members.
  ###
  app = undefined
  endpoint = undefined
  mode = undefined
  wrapper = undefined
  options = undefined

  ###
  Constructor.
  ###
  constructor: (el, appKey, url, appMode, wOptions) ->
    wrapper = el
    app = appKey
    options = wOptions
    endpoint = url ? config.widget.defaults.endpoint
    @mode = appMode;

  setMode: (appMode) ->
    @mode = appMode

  setOptions: (wOptions) ->
    options = wOptions

  getOptions: -> options

  ###
  Create a token or use an existing one and keep it updated.
  ###
  auth: ->

    deferred = $.Deferred()
    sess = session.getSession(app)

    # If session exists and has not expired use it
    if sess and sess.expiresAt > new Date().getTime() and not sess.isStatusAware
      @data = sess
      deferred.resolve()

    # Else, create a new one
    else

      params =
        auth: fingerprint.getFingerprint()

      if @data?.expiresAt > new Date().getTime() and @data?.expiresAt isnt -1
        params.token = @data?.token

      # Setup AJAX request
      ajaxSetup =
        type: 'POST'
        url: "#{endpoint}/#{app}/captcha"
        data: params

      # Create session object and save it
      doneCallback = (response) =>

        if response.status? and response.status.toLowerCase() is 'error'
          deferred.reject response.message.toLowerCase()

        else if response.result? and response.result.toLowerCase() is 'error'
          deferred.reject response.status.toLowerCase()

        else
          @data =
            status: 'new'
            app: app
            token: response.token
            widgetType: response.type.toLowerCase()
            country: response.country.toLowerCase()
            expiresAt: new Date().getTime() + (response.expires_in * 1000)
            supportedCountries: response.countries.toLowerCase().split(',').filter(String)
            features: response.features.split('')
            attempts: 0
            geolocation: !!response.geolocation
            fingerprint: params.auth
            supportEmail: response.support_email
            locale: response.widget_lang

          event = $.Event(events.auth)
          event.token = response.token
          wrapper.triggerHandler(event)

          session.setSession(app, @data)

          deferred.resolve()

      ajax(ajaxSetup, doneCallback, deferred.reject)

    # Check if the token has not expired
    checkToken = =>
      if @data.expiresAt > new Date().getTime()
        setTimeout(checkToken, 1000)
      else
        @auth() unless @data.expiresAt is -1

    deferred.promise().done(checkToken);

  ###
  Send a PIN code to ´phone´ via ´type´ in ´locale´ language.
  ###
  code: (phoneNumber, dispatchType, locale = "en") ->

    deferred = $.Deferred()

    deferred.reject('invalid_service') unless dispatchType in ['sms', 'voice']

    params =
      token: @data.token
      fp: @data.fingerprint ? fingerprint.getFingerprint()
      phone: phoneNumber
      locale: locale

    if 'G' in @data.features and @data.geolocation is true
      params = $.extend(params, geolocation.getGeolocation())

    if @mode
      params = $.extend(params, mode: @mode)

    if 'T' in @data.features
      params = $.extend(params, iosid: options.iosid)
      params = $.extend(params, androidid: options.androidid)
      params = $.extend(params, appname: options.appname)

    ajaxSetup =
      type: 'POST'
      url: "#{endpoint}/v2/apps/#{app}/captcha/#{dispatchType}"
      data: params

    # Update data
    doneCallback = (response) =>

      status = (response.status ? response.result).toLowerCase()
      message = (response.message ? response.status).toLowerCase()

      @data.expiresAt = new Date().getTime() + (response.expires_in * 1000)
      @data.retryAt = new Date().getTime() + (response.retry_in * 1000)
      @data.attempts = response.attempt

      if status is 'error'
        error = if message.slice(0, 5) is 'error' then message.slice(6) else message
        if error is 'invalid_session'
          @data.expiresAt = -1
          session.updateSession(app, @data)
          @auth().fail -> deferred.reject(error)
        else
          deferred.reject(error)

      @data.status = 'pending'
      @data.phoneNumber = response.phone
      @data.dispatchType = dispatchType
      localStorage.setItem('__rc_dui', response.phone_hash)
      session.updateSession(app, @data)
      deferred.resolve()

    ajax(ajaxSetup, doneCallback, deferred.reject)

    deferred.promise()

  ###
  Check if PIN code is valid.
  ###
  check: (code) ->

    return if (mode == 'onboarding' or mode == 'distribution')

    deferred = $.Deferred()

    # Setup AJAX request
    ajaxSetup =
      type: 'POST'
      url: "#{endpoint}/v2/apps/#{app}/check"
      data:
        token: @data.token
        fp: @data.fingerprint ? fingerprint.getFingerprint()
        code: code

    # If has been verified then update the status
    doneCallback = (response) =>

      status = (response.status ? response.result).toLowerCase()
      message = (response.message ? response.status).toLowerCase()

      if status is 'error'
        error = if message.slice(0, 5) is 'error' then message.slice(6) else message
        deferred.reject(error)
      else
        @data.status = 'verified'
        @data.expiresAt = -1
        session.updateSession(app, @data)
        deferred.resolve()

    ajax(ajaxSetup, doneCallback, deferred.reject)

    deferred.promise()

  ###
  Check if an user has been verified via url.
  ###
  checkUrl: ->

    return if (mode == 'onboarding' or mode == 'distribution')

    deferred = $.Deferred()

    # Setup AJAX request
    ajaxSetup =
      type: 'POST'
      url: "#{endpoint}/v2/apps/#{app}/check/url"
      data:
        token: @data.token
        fp: @data.fingerprint ? fingerprint.getFingerprint()

    # If has been verified then update the status
    doneCallback = (response) =>

      status = (response.status ? response.result).toLowerCase()
      message = (response.message ? response.status).toLowerCase()

      if status is 'error'
        error = if message.slice(0, 5) is 'error' then message.slice(6) else message
        deferred.reject(error)
      else
        @data.status = 'verified'
        @data.expiresAt = -1
        session.updateSession(app, @data)
        deferred.resolve(response.code)

    ajax(ajaxSetup, doneCallback, deferred.reject)

    deferred.promise()

module.exports = Api
