/**
 * @ngdoc provider
 * @name NgMap
 * @description
 *  common utility service for ng-map
 */
(function() {
  'use strict';
  var $window, $document, $q;
  var NavigatorGeolocation, Attr2MapOptions, GeoCoder, camelCaseFilter, NgMapPool;

  var mapControllers = {};

  var getStyle = function(el, styleProp) {
    var y;
    if (el.currentStyle) {
      y = el.currentStyle[styleProp];
    } else if ($window.getComputedStyle) {
      y = $document.defaultView.
        getComputedStyle(el, null).
        getPropertyValue(styleProp);
    }
    return y;
  };

  /**
   * @memberof NgMap
   * @function initMap
   * @param id optional, id of the map. default 0
   */
  var initMap = function(id) {
    var ctrl = mapControllers[id || 0];
    if (!(ctrl.map instanceof google.maps.Map)) {
      ctrl.initializeMap();
      return ctrl.map;
    } else {
      console.error('map is already instialized');
    }
  };

  /**
   * @memberof NgMap
   * @function getMap
   * @param {String} optional, id e.g., 'foo'
   * @returns promise
   */
  var getMap = function(id, options) {
    options = options || {};
    id = typeof id === 'object' ? id.id : id;

    var deferred = $q.defer();
    var timeout = options.timeout || 10000;

    function waitForMap(timeElapsed){
      var keys = Object.keys(mapControllers);
      var theFirstController = mapControllers[keys[0]];
      if(id && mapControllers[id]){
        deferred.resolve(mapControllers[id].map);
      } else if (!id && theFirstController && theFirstController.map) {
        deferred.resolve(theFirstController.map);
      } else if (timeElapsed > timeout) {
        deferred.reject('could not find map');
      } else {
        $window.setTimeout( function(){
          waitForMap(timeElapsed+100);
        }, 100);
      }
    }
    waitForMap(0);

    return deferred.promise;
  };

  /**
   * @memberof NgMap
   * @function addMap
   * @param mapController {__MapContoller} a map controller
   * @returns promise
   */
  var addMap = function(mapCtrl) {
    if (mapCtrl.map) {
      var len = Object.keys(mapControllers).length;
      mapControllers[mapCtrl.map.id || len] = mapCtrl;
    }
  };

  /**
   * @memberof NgMap
   * @function deleteMap
   * @param mapController {__MapContoller} a map controller
   */
  var deleteMap = function(mapCtrl) {
    var len = Object.keys(mapControllers).length - 1;
    var mapId = mapCtrl.map.id || len;
    if (mapCtrl.map) {
      for (var eventName in mapCtrl.eventListeners) {
        console.log('clearing map events', eventName);
        var listener = mapCtrl.eventListeners[eventName];
        google.maps.event.removeListener(listener);
      }
      if (mapCtrl.map.controls) {
        mapCtrl.map.controls.forEach(function(ctrl) {
          ctrl.clear();
        });
      }
    }

    //Remove Heatmap Layers
    if (mapCtrl.map.heatmapLayers) {
      Object.keys(mapCtrl.map.heatmapLayers).forEach(function (layer) {
        mapCtrl.deleteObject('heatmapLayers', mapCtrl.map.heatmapLayers[layer]);
      });
    }

    NgMapPool.deleteMapInstance(mapId);

    delete mapControllers[mapId];
  };

  /**
   * @memberof NgMap
   * @function getGeoLocation
   * @param {String} address
   * @param {Hash} options geo options
   * @returns promise
   */
  var getGeoLocation = function(string, options) {
    var deferred = $q.defer();
    if (!string || string.match(/^current/i)) { // current location
      NavigatorGeolocation.getCurrentPosition(options).then(
        function(position) {
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          var latLng = new google.maps.LatLng(lat,lng);
          deferred.resolve(latLng);
        },
        function(error) {
          deferred.reject(error);
        }
      );
    } else {
      GeoCoder.geocode({address: string}).then(
        function(results) {
          deferred.resolve(results[0].geometry.location);
        },
        function(error) {
          deferred.reject(error);
        }
      );
      // var geocoder = new google.maps.Geocoder();
      // geocoder.geocode(options, function (results, status) {
      //   if (status == google.maps.GeocoderStatus.OK) {
      //     deferred.resolve(results);
      //   } else {
      //     deferred.reject(status);
      //   }
      // });
    }

    return deferred.promise;
  };

  /**
   * @memberof NgMap
   * @function observeAndSet
   * @param {String} attrName attribute name
   * @param {Object} object A Google maps object to be changed
   * @returns attribue observe function
   */
  var observeAndSet = function(attrName, object) {
    console.log('observing', attrName, 'on object', object);
    return function(val) {
      if (val) {
        var setMethod = camelCaseFilter('set-'+attrName);
        var optionValue = Attr2MapOptions.toOptionValue(val, {key: attrName});
        if (object[setMethod]) { //if set method does exist
          console.log('observing', attrName, 'and setting', optionValue);
          /* if an location is being observed */
          if (attrName.match(/center|position/) &&
            typeof optionValue == 'string') {
            getGeoLocation(optionValue).then(function(latlng) {
              object[setMethod](latlng);
            });
          } else {
            object[setMethod](optionValue);
          }
        }
      }
    };
  };

  /**
   * @memberof NgMap
   * @function setStyle
   * @param {HtmlElement} map contriner element
   * @desc set display, width, height of map container element
   */
  var setStyle = function(el) {
    //if style is not given to the map element, set display and height
    var defaultStyle = el.getAttribute('default-style');
    if (defaultStyle == "true") {
      el.style.display = 'block';
      el.style.height = '300px';
    } else {
      if (getStyle(el, 'display') != "block") {
        el.style.display = 'block';
      }
      if (getStyle(el, 'height').match(/^(0|auto)/)) {
        el.style.height = '300px';
      }
    }
  };

  angular.module('ngMap').provider('NgMap', function() {
    var defaultOptions = {};

    /**
     * @memberof NgMap
     * @function setDefaultOptions
     * @param {Hash} options
     * @example
     *  app.config(function(NgMapProvider) {
     *    NgMapProvider.setDefaultOptions({
     *      marker: {
     *        optimized: false
     *      }
     *    });
     *  });
     */
    this.setDefaultOptions = function(options) {
      defaultOptions = options;
    };

    var NgMap = function(
        _$window_, _$document_, _$q_,
        _NavigatorGeolocation_, _Attr2MapOptions_,
        _GeoCoder_, _camelCaseFilter_, _NgMapPool_
      ) {
      $window = _$window_;
      $document = _$document_[0];
      $q = _$q_;
      NavigatorGeolocation = _NavigatorGeolocation_;
      Attr2MapOptions = _Attr2MapOptions_;
      GeoCoder = _GeoCoder_;
      camelCaseFilter = _camelCaseFilter_;
      NgMapPool = _NgMapPool_;

      return {
        defaultOptions: defaultOptions,
        addMap: addMap,
        deleteMap: deleteMap,
        getMap: getMap,
        initMap: initMap,
        setStyle: setStyle,
        getGeoLocation: getGeoLocation,
        observeAndSet: observeAndSet
      };
    };
    NgMap.$inject = [
      '$window', '$document', '$q',
      'NavigatorGeolocation', 'Attr2MapOptions',
      'GeoCoder', 'camelCaseFilter', 'NgMapPool'
    ];

    this.$get = NgMap;
  });
})();
