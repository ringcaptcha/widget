geolocation = undefined

getGeolocation = -> geolocation

askGeolocation = ->
  if navigator.geolocation
    navigator.geolocation.getCurrentPosition (position) ->
      geolocation =
        geo_lat: position.coords.latitude
        geo_lng: position.coords.longitude
        geo_acurracy: position.coords.accuracy
        geo_alt: position.coords.altitude
        geo_alt_acurracy: position.coords.altitudeAccuracy

module.exports = {askGeolocation,getGeolocation}
