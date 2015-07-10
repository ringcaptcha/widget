RingCaptcha Widget
==================

A JavaScript based two-step verification widget.

Installation
------------

The fastest way to get started is to serve the widget from our own CDN.

```html
<div id="widget"></div>
<script src="https://cdn.ringcaptcha.com/widget/v2/bundle.min.js"></script>
<script>
var widget = new RingCaptcha.Widget('#widget', 'my_app_key');
</script>
```

Contribute
----------

Do you want to contribute? We have [a guide](CONTRIBUTING.md) that explains our contribution process.

### Requirements

 * Node.js 0.10+
 * Ruby 1.8+
 * Compass

### Building

Once you have your [environment setup](#requirements) ready, building the widget is really easy.

```sh
$ npm install
$ npm run build
```

At this point, you should have a `build` folder with the compiled files.

### Running Tests

To run the entire test suite, execute the following command:

```sh
$ npm test
```

License
-------

This project is licensed under the Apache 2.0 license. See [LICENSE](LICENSE) for the full license text.
