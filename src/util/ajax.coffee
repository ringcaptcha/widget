$ = require('../zepto')

noop = $.noop()

module.exports = (ajaxSetup, doneCallback = noop, failCallback = noop) ->
  if window.XDomainRequest
    xdr = new XDomainRequest()
    xdr.open(ajaxSetup.type, ajaxSetup.url);
    xdr.onprogress = ->
    xdr.ontimeout = failCallback
    xdr.onerror = failCallback
    xdr.onload = -> doneCallback(JSON.parse(xdr.responseText))
    data = ajaxSetup.data ? {}
    setTimeout (-> xdr.send($.param(data))), 0
  else
    $.ajax(ajaxSetup).done(doneCallback).fail(failCallback)
