document.write([
  '<script src="https://maps.google.com/maps/api/js?libraries=placeses,visualization,drawing,geometry,places&key=AIzaSyCbMGRUwcqKjlYX4h4-P6t-xcDryRYLmCM"></script>',
  '<script src="lib/angular.js"></script>',
  '<script src="app.js"></script>',
  '<script src="controllers/map-controller.js"></script>',
  '<script src="services/ng-map.js"></script>',
  '<script src="services/ng-map-pool.js"></script>',
  '<script src="services/geo-coder.js"></script>',
  '<script src="services/navigator-geolocation.js"></script>',
  '<script src="services/attr2-map-options.js"></script>',
  '<script src="services/street-view.js"></script>',
  '<script src="filters/camel-case.js"></script>',
  '<script src="filters/jsonize.js"></script>',
  '<script src="filters/escape-regexp.js"></script>',
  '<script src="directives/bicycling-layer.js"></script>',
  '<script src="directives/custom-control.js"></script>',
  '<script src="directives/custom-marker.js"></script>',
  '<script src="directives/directions.js"></script>',
  '<script src="directives/drawing-manager.js"></script>',
  '<script src="directives/dynamic-maps-engine-layer.js"></script>',
  '<script src="directives/fusion-tables-layer.js"></script>',
  '<script src="directives/heatmap-layer.js"></script>',
  '<script src="directives/info-window.js"></script>',
  '<script src="directives/kml-layer.js"></script>',
  '<script src="directives/map-data.js"></script>',
  '<script src="directives/map-lazy-load.js"></script>',
  '<script src="directives/map-type.js"></script>',
  '<script src="directives/map.js"></script>',
  '<script src="directives/maps-engine-layer.js"></script>',
  '<script src="directives/marker.js"></script>',
  '<script src="directives/overlay-map-type.js"></script>',
  '<script src="directives/places-auto-complete.js"></script>',
  '<script src="directives/shape.js"></script>',
  '<script src="directives/street-view-panorama.js"></script>',
  '<script src="directives/traffic-layer.js"></script>',
  '<script src="directives/transit-layer.js"></script>',
  '<script>',
  'document.addEventListener("DOMContentLoaded", function(event) {',
  '  window.parent.postMessage({height:document.body.getBoundingClientRect().height},"*");',
  '});',
  '</script>'
].join('\n'));
