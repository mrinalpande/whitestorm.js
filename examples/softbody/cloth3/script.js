(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _globals = require('./globals');

var UTILS = _interopRequireWildcard(_globals);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var world = new WHS.World(_extends({}, UTILS.$world, {
  softbody: true,

  gravity: {
    y: -9.8
  },

  camera: {
    far: 10000,
    position: [0, 30, 90]
  }
}));

var mouse = new WHS.VirtualMouse(world);

var arm = new WHS.Box({ // Rigidbody (green).
  geometry: {
    width: 80,
    height: 6,
    depth: 6
  },

  mass: 0,

  material: {
    color: UTILS.$colors.mesh,
    kind: 'phong'
  },

  position: {
    y: 50,
    z: 10
  }
});

arm.addTo(world);

var cloth = new WHS.Tube({ // Softbody (blue).
  geometry: {
    path: new THREE.LineCurve3(new THREE.Vector3(0, 30, 0), new THREE.Vector3(0, 10, 0)),
    segments: 20,
    radius: 12,
    radiusSegments: 16,
    closed: false
  },

  mass: 1,
  softbody: true,

  physics: {
    margin: 1,
    damping: 0.03,
    piterations: 12
  },

  material: {
    color: UTILS.$colors.softbody,
    kind: 'phong',
    side: THREE.DoubleSide
  }
});

cloth.addTo(world);

cloth.appendAnchor(world, arm, 0, 1, false);
cloth.appendAnchor(world, arm, 40, 1, false);

new WHS.Box({ // Rigidbody (green).
  geometry: {
    width: 10,
    height: 10,
    depth: 10
  },

  mass: 10,

  material: {
    color: UTILS.$colors.mesh,
    kind: 'phong'
  },

  position: {
    y: 18
  }
}).addTo(world).then(function (box) {
  mouse.on('move', function () {
    box.setLinearVelocity(mouse.project().sub(box.position));
  });
});

UTILS.addBoxPlane(world, 250);
UTILS.addBasicLights(world);

world.setControls(new WHS.OrbitControls());
world.start();

},{"./globals":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addAmbient = addAmbient;
exports.addBasicLights = addBasicLights;
exports.addPlane = addPlane;
exports.addBoxPlane = addBoxPlane;
var $world = exports.$world = {
  stats: "fps", // fps, ms, mb or false if not need.
  autoresize: "window",

  gravity: [0, -100, 0],

  camera: {
    position: [0, 10, 50]
  },

  rendering: {
    background: {
      color: 0x162129
    },

    renderer: {
      antialias: true
    }
  },

  shadowmap: {
    type: THREE.PCFSoftShadowMap
  }
};

var $colors = exports.$colors = {
  bg: 0x162129,
  plane: 0x447F8B,
  mesh: 0xF2F2F2,
  softbody: 0x434B7F
};

function addAmbient(world, intensity) {
  new WHS.AmbientLight({
    light: {
      intensity: intensity
    }
  }).addTo(world);
}

function addBasicLights(world) {
  var intensity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;
  var position = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 10, 10];
  var distance = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100;

  addAmbient(world, 1 - intensity);

  return new WHS.PointLight({
    light: {
      intensity: intensity,
      distance: distance
    },

    shadowmap: {
      fov: 90
    },

    position: position
  }).addTo(world);
}

function addPlane(world) {
  var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

  return new WHS.Plane({
    geometry: {
      width: size,
      height: size
    },

    mass: 0,

    material: {
      color: 0x447F8B,
      kind: 'phong'
    },

    rotation: {
      x: -Math.PI / 2
    }
  }).addTo(world);
}

function addBoxPlane(world) {
  var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

  return new WHS.Box({
    geometry: {
      width: size,
      height: 1,
      depth: size
    },

    mass: 0,

    material: {
      color: 0x447F8B,
      kind: 'phong'
    }
  }).addTo(world);
}

},{}]},{},[1]);
