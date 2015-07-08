$ = require('../zepto')
PhoneHandler = require('../handler/phone')
Dropdown = require('../dropdown')
events = require('../events')
session = require('../util/session')
arr = require('../util/arr')
countries = require('../countries')

Formatter = require('../../bower_components/formatter.js/dist/formatter')

class PhoneStep

  el = undefined
  wrapper = undefined
  i18n = undefined
  api = undefined
  currentCountry = undefined
  phoneHandler = undefined
  dropdown = undefined
  hiddenCountry = undefined
  mode = undefined
  formatted = undefined
  widgetType = undefined

  ###
  Constructor
  ###
  constructor: (ele, i18na, apia, appMode) ->
    wrapper = ele
    i18n = i18na
    api = apia
    mode = appMode

    hiddenCountry = wrapper.data('hide-country')

    phoneHandler = new PhoneHandler(wrapper, api, i18n)

  setMode: (appMode) ->
    mode = appMode

  ###
  Setup phone step.
  ###
  setup: ->

    dropdown = new Dropdown('.country-list', wrapper)

    wrapper
      .on('click', '.js-send-code', ->
        phoneHandler.handle(getPhoneNumber(), getDispatchType())
      )
      .on('keypress', '.phone-input', onlyAllowPhoneDigits)
      .on('keypress', '.phone-input', (event) -> phoneHandler.handle(getPhoneNumber(), getDispatchType()) if event.which is 13 )
      .on('change', '.country-list-mobile', selectCountry)
      .on('click', '.country-list a', selectCountry)
      .on('change', '[name="rc[core][method]"]', switchSubmitButtonValue)
      .on('click', '.country-search', stopPropagation)
      .on('keyup', '.country-search-input', filterCountryList)
      .on('focusin', '.phone-input', focusin)
      .on('focusout', '.phone-input', focusout)
      .on('click', '.country-button', dropdown.toggle)
      .on('click', '.country-button', onDropdownToggle)
      .on('click', '.js-try-again', tryAgain)

    $(document).on('keydown', '.country-button', dropdown.keydown).on('click', -> $('.country-list').parent().removeClass('open') )

    render()

    wrapper.trigger(events.ready)

  ###
  Render phone step.
  ###
  render = ->

    onboarding_template = require("../../resources/views/onboarding/step/phone.html")
    verification_template = require("../../resources/views/verification/step/phone.html")

    template = if (mode is 'onboarding' or mode is 'distribution') then onboarding_template else verification_template

    el = $ template(i18n: i18n, mode: mode)

    wOptions = api.getOptions()

    widgetType = if wOptions.type? then wOptions.type else 'sms'
    widgetType = if widgetType not in ['sms', 'voice', 'dual'] then 'sms' else widgetType

    if 'V' not in api.data.features and widgetType is 'voice'
      widgetType = 'sms'
    else if 'D' not in api.data.features and widgetType is 'dual'
      widgetType = 'sms'

    if widgetType in ['sms', 'voice']
      el.find('.method-summary').text(i18n.t("code.service.#{widgetType}.summary"))
      el.find('.method-input').remove()
      el.find('.js-send-code').text(i18n.t("code.service.#{widgetType}.label"));

    if 'V' not in api.data.features and widgetType is 'voice'
      widgetType = 'sms'
    else if 'D' not in api.data.features and widgetType is 'dual'
      widgetType = 'sms'

    if widgetType in ['sms', 'voice']
      el.find('.method-summary').text(i18n.t("widget.code.service.#{widgetType}.summary"))
      el.find('.method-input').remove()
      el.find('.js-send-code').text(i18n.t("widget.code.service.#{widgetType}.label"));

    co = {};

    for i, country of countries
      if country.country_name[i18n.locale()]?
        countryName = country.country_name[i18n.locale()]
      else
        countryName = country.country_name['en']
      co[countryName] = { code: country.country_code, example: country.example_dial, iso: i }

    co = arr(co)

    for name, country of co
      iso = country.iso.replace(/[^a-z]+/g, '')
      continue if 'C' in api.data.features and iso not in api.data.supportedCountries and api.data.supportedCountries != '[]' and api.data.supportedCountries.length > 0
      attributes =
        'data-country-iso': iso
        'data-country-code': country.code
        'data-country-name': name
        'data-country-dial-example': country.example
      if i18n.locale() is 'ar'
        title = "#{name} #{country.code}"
      else
        title = "#{name} (+#{country.code})"
      $('<option>', attributes).text(title).appendTo el.find('.country-list-mobile')
      $('<li>').append( $('<a>', attributes).attr('href', '#').html("<i class=\"flag flag-#{iso.toLowerCase()}\"></i> " + title) ).appendTo el.find('.country-list')

    wrapper.find('.wizard').html(el)

    formatted = new Formatter(wrapper.find('.phone-input').get(0), pattern: '({{999}}) {{999}}-{{9999}}');

    countrySel = wrapper.find("a[data-country-iso=\"#{api.data.country.toLowerCase()}\"]")
    if countrySel.length
      countrySel.trigger('click')
      wrapper.find("option[data-country-iso=\"#{api.data.country.toLowerCase()}\"]").prop('selected', true)
    else
      wrapper.find("a[data-country-iso='us']").trigger('click')
      wrapper.find("option[data-country-iso='us']").prop('selected', true)

    if hiddenCountry
      wrapper.find(".input-group-btn").hide()
      wrapper.find('.input-group').css('display', 'block')
      wrapper.find('.phone-input').css('border-radius', '4px')

    type = if api.data.widgetType in ['sms', 'url_sms'] then 'sms' else 'voice'

    if (mode isnt 'onboarding' and mode isnt 'distribution')
      if 'D' in api.data.features
        wrapper.find("#method-#{type}").trigger('click')
      else
        submitText = i18n.t("code.submit.#{type}")
        wrapper.find('.js-send-code').text(submitText)
    else
      submitText = i18n.t("onboarding.send")
      wrapper.find('.js-send-code').text(submitText)

    if (api.mode is 'onboarding' or api.mode is 'distribution') and api.data.status is 'pending'
      wrapper.find('.js-send-code, .phone-input, .method-input input, .country-button').prop('disabled', true)
      wrapper.find('.js-send-code').text('Sent!')
      wrapper.find('#js-inline-alert').addClass('hide');
      wrapper.find('#js-inline-countdown').removeClass('hide');
      $countdown = wrapper.find('.countdown')
      $try = wrapper.find('.tryagain')
      showLinks = ->
        $countdown.addClass('hide')
        $try.removeClass('hide')
      if api.data.retryAt > new Date().getTime()
        countdownInterval = =>
          remaining = Math.round((api.data.retryAt - new Date().getTime()) / 1000)
          if remaining > 0
            value = i18n.t('check.countdown.seconds', remaining)
            $countdown.removeClass('hide').html(value)
          else
            showLinks()
            clearTimeout(countdownTimeout)
          countdownTimeout = setTimeout(countdownInterval, 1000)
        countdownInterval()
      else
        showLinks()

    options = api.getOptions()
    autoFocus = if options.autoFocus? then options.autoFocus in ['yes', 'true'] else false

    if autoFocus
      wrapper.find('.phone-input').trigger('focus')

  ###
  Teardown phone step.
  ###
  teardown: ->

    wrapper
      .off('click', '.js-send-code' )
      .off('keypress', '.phone-input')
      .off('change', '.country-list-mobile')
      .off('click', '.country-list a')
      .off('change', '[name="rc[core][method]"]')
      .off('click', '.country-search')
      .off('keyup', '.country-search-input')
      .off('focusin', '.phone-input')
      .off('focusout', '.phone-input')
      .off('click', '.country-button')
      .off('click', '.js-try-again')

    wrapper.find('.wizard').empty()

  onDropdownToggle = (event) ->

    wrapper.find('.country-list li:not(.country-search)').show()
    wrapper.find('.country-search-input').val('').focus()
    wrapper.find('.country-list').scrollTop(0)

  ###
  Add `focus` class to phone input box.
  ###
  focusin = -> wrapper.find('.phone-box').addClass('focus')

  ###
  Remòve `focus` class to phone input box.
  ###
  focusout = -> wrapper.find('.phone-box').removeClass('focus')

  ###
  Alias for event.stopPropagation()
  ###
  stopPropagation = (event) -> event.stopPropagation()

  ###
  Switch value of submit button.
  ###
  switchSubmitButtonValue = ->
    value = $(this).data('submit-button-value')
    wrapper.find('.js-send-code').text(value)

  ###
  Allow only numbers, spaces, parentheses and plus sign.
  ###
  onlyAllowPhoneDigits = (event) ->
    unless event.which in [32, 40, 41, 43, 8] or 48 <= event.which <= 57
      event.preventDefault()

  ###
  Select country.
  ###
  selectCountry = (event) ->

    currentCountry = if event.type is 'change' then $(this).find('option:selected').data() else $(this).data()
    example = if currentCountry.countryDialExample then i18n.t('code.example', { example: currentCountry.countryDialExample }) else ''

    if currentCountry.countryIso in ['us', 'ca']
      formatted.enable()
    else
      formatted.disable()

    wrapper.find('.phone-input').attr('placeholder', example)
    wrapper.find('.country-button .flag').removeClass().addClass("flag flag-#{currentCountry.countryIso}")
    wrapper.find('.country-button .country-code').text("+#{currentCountry.countryCode}")

    if event.type isnt 'change'
      wrapper.find(".country-list-mobile option[data-country-iso=\"#{currentCountry.countryIso}\"]").prop('selected', true)

    event.preventDefault()

  ###
  Filter countries by user search.
  ###
  filterCountryList = (event) ->

    searchValue = @value.toLocaleLowerCase()
    searchValueClean = searchValue.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&')
    countries = wrapper.find('.country-list li:not(.country-search)').show()

    countries.each (i, item) ->
      countryIso = $(this).children('a').data('country-iso').toLowerCase()
      countryName = $(this).children('a').data('country-name').toLocaleLowerCase()
      countryCode = $(this).children('a').data('country-code')
      unless countryName.search(searchValueClean) isnt -1 or countryIso is searchValue or countryCode is +searchValue or "+#{countryCode}" is searchValue or countryCode.toString().indexOf(searchValue) is 0
        $(this).hide()

  ###
  Build phone number.
  ###
  getPhoneNumber = ->
    phone =
      countryCode: currentCountry.countryCode
      phoneNumber: wrapper.find('.phone-input').val().trim().replace(/[\D]/g, '')
    return phone

  tryAgain = (event) ->
    session.updateSession(api.data.app, status: 'new')
    api.data.status = 'new'
    wrapper.triggerHandler(events.retry)
    event.preventDefault()

  ###
  Get dispatch type.
  ###
  getDispatchType = ->
    if (mode is 'onboarding' or mode is 'distribution')
      return 'sms'
    else
      if widgetType is 'dual'
        return wrapper.find('.method-input input:checked').val()
      else
        return widgetType

module.exports = PhoneStep
