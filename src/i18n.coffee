###
Load module dependencies.
###
$ = require('./zepto')
config = require('../config.json')
session = require('./util/session')
ajax = require('./util/ajax')

###
I18n
###
class I18n

  ###
  Define private members
  ###
  messages = {}
  fallbackMessages = {}
  direction = undefined
  pluralizationRule = undefined
  currentLocale = undefined

  ###
  Constructor
  ###
  constructor: () ->
    pluralizationRule = (number) -> return if number is 1 then 0 else 1

  ###
  Load messages
  ###
  load: (locale) ->

    locale = locale.toLowerCase()
    locale = if locale in config.locale.available then locale else 'en'

    deferred = $.Deferred()

    hasCustomLocale = RingCaptchaLocale? and RingCaptchaLocale[locale]?

    currentLocale = locale

    if hasCustomLocale
      if isObject(RingCaptchaLocale[locale])
        messages = RingCaptchaLocale[locale]
      else
        doneCallback = (response) ->
          messages = response

        failCallback = -> hasCustomLocale = false

        ajaxSetup =
          type: 'GET',
          url: RingCaptchaLocale[locale]

        ajax(ajaxSetup, doneCallback, failCallback)

    doneCallback = (response) ->
      direction = response.direction
      if hasCustomLocale
        fallbackMessages = response.messages
      else
        messages = response.messages
      deferred.resolve()

    ajaxSetup =
      type: 'GET',
      url: makePath(locale)

    ajax(ajaxSetup, doneCallback, deferred.reject)

    deferred.promise()

  makePath = (locale) ->
    return "#{config.cdn}/resources/locales/#{locale}/messages.json"

  ###
  ###
  get: (id) ->
    return messages unless id?
    return messages[id] if messages[id]?
    return messages["widget.#{id}"] if messages["widget.#{id}"]?
    return fallbackMessages[id]

  ###
  ###
  sprintf = (str, parameters) ->
    str.replace /\%([\w]+)\%/ig, (i, key) -> parameters[key] || "%#{key}%"

  isObject = (value) ->
    type = typeof value;
    return type is 'function' or (!!value and type is 'object');

  ###
  ###
  trans: (id, parameters) ->
    value = @get(id)
    return if parameters? then sprintf(value, parameters) else value

  ###
  ###
  transChoice: (id, number, parameters) ->
    index = pluralizationRule(number)
    value = @get(id).split('|')[index]
    return id unless value?
    return if parameters? then sprintf(value, parameters) else value

  ###
  ###
  getLocale: -> currentLocale

  ###
  ###
  getDirection: -> direction

module.exports = I18n
