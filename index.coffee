$ = require('./src/zepto')
Widget = require('./src/widget')
config = require('./config.json')
cssify = require('cssify')

cssPath = config.cdn + '/resources/css/widget.css'
cssify.byUrl(cssPath)

$('[data-widget]').each ->
  settings = $(this).data()
  new Widget(this, settings.app, settings).setup()

module.exports = {Widget}
