$ = require './zepto'
config = require '../config.json'
ajax = require './util/ajax'
Polyglot = require 'node-polyglot'

class I18n extends Polyglot

  load: (locale) ->

    deferred = $.Deferred()

    baseLocale = if locale in config.widget.locale.available then locale else config.widget.locale.default

    ajaxSetup =
      type: 'GET'
      async: false
      url: "#{config.widget.cdn}/resources/locales/#{baseLocale}/messages.json"

    ajax(ajaxSetup, ((response) => @extend response), deferred.reject)

    if RingCaptchaLocale? and RingCaptchaLocale[locale]?
      phrases = RingCaptchaLocale[locale]
      if $.isPlainObject(phrases)
        @extend phrases
      else
        ajaxSetup =
          type: 'GET'
          async: false
          url: phrases

        ajax(ajaxSetup, ((response) => @extend response), deferred.reject)

    deferred.promise()

module.exports = I18n
