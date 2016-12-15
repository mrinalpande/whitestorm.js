import {
  PCFSoftShadowMap,
  Scene,
  Vector3,
  Fog,
  FogExp2,
  AxisHelper,
  GridHelper
} from 'three';

import { physicsEnabled } from '../physics/enabled';
import { create } from '../physics/create/World';
import { addResizeListener } from 'detect-element-resize';

import { extend } from '../utils/index';
import { PerspectiveCamera } from '../components/cameras/PerspectiveCamera';
import { BasicRendering } from '../components/rendering/basic/BasicRendering';
import { Component } from './Component';

class World extends Component {
  static defaults = {
    stats: false,
    autoresize: false,
    softbody: false,

    helpers: {
      grid: false,
      axis: false
    },

    gravity: {
      x: 0,
      y: 0,
      z: 0
    },

    rendering: {
      shadowmap: {
        enabled: true,
        type: PCFSoftShadowMap
      },

      background: {
        color: 0x000000,
        opacity: 1
      },

      renderer: {}
    },

    camera: {
      fov: 75,
      near: 1,
      far: 1000,

      position: {
        x: 0,
        y: 0,
        z: 0
      }
    },

    width: window.innerWidth,
    height: window.innerHeight,
    container: window.document.body,

    resolution: {
      width: 1,
      height: 1
    },

    physics: {
      create: create,
      fixedTimeStep: 1 / 60,
      broadphase: {type: 'dynamic'}
    },

    fog: {
      type: false,

      density: 0.00025,
      hex: 0x000000,
      near: 1,
      far: 1000
    },

    modules: {
      element: true,
      scene: true,
      stats: true,
      camera: true,
      helpers: true,
      rendering: true
    }
  };

  static instructions = {
    camera: {
      position: ['x', 'y', 'z']
    },

    gravity: ['x', 'y', 'z'],

    modules: [
      'element',
      'scene',
      'stats',
      'camera',
      'helpers',
      'rendering'
    ]
  };

  static helpers = {
    axis: [AxisHelper, {
      size: 5
    }, ['size']],

    grid: [GridHelper, {
      size: 10,
      step: 1,
      color1: 0xffffff,
      color2: 0xffffff
    }, ['size', 'step', 'color1', 'color2']]
  };

  static pluginDeps = {
    'camera': ['scene'],
    'rendering': ['scene'],
    'helpers': ['scene']
  }

  modules = {
    element: null,
    scene: null,
    camera: null,
    rendering: null,
    helpers: null,
    stats: null
  };

  get $rendering() { return this.modules.rendering; }
  set $rendering(plugin) { this.modules.rendering = plugin(this); }

  get $scene() { return this.modules.scene; }
  set $scene(scene) { this.importScene(scene); }

  get $camera() { return this.modules.camera; }
  set $camera(camera) { this.modules.camera = camera; }

  get $element() { return this.modules.element; }
  set $element(element) { this.modules.element = element; }

  simulate = false;
  render = true;
  loops = [];

  constructor(params = {}) {
    super(params, World.defaults, World.instructions);

    for (let plugin in this.modules) {
      if (World.pluginDeps[plugin]) {
        const dependencies = World.pluginDeps[plugin];
        let skip = false;

        for (let i = 0, max = dependencies.length; i < max; i++)  { // console.log(dependencies[i]);
          if (!this.params.modules[dependencies[i]]) skip = true;
        }

        if (skip) continue;
      }

      if (this.params.modules[plugin] && this[`make$${plugin}`]) this[`make$${plugin}`]();
    }


    if (params.autoresize) {
      const container = params.container;

      const resizeCallback = () => {
        // FIXME: Am I crazy or offsetHeight is increasing even when we downsize the window ?
        // console.log('height offset : ', params.container.offsetHeight);

        this.setSize(
          Number(container.offsetWidth * params.resolution.width).toFixed(),
          Number(container.offsetHeight * params.resolution.height).toFixed()
        );

        this.emit('resize');
      }

      if (params.autoresize === 'window') window.addEventListener('resize', resizeCallback);
      else {
        if (params.autoresize.delay) {
          let resize = true;

          addResizeListener(container, () => {
            window.clearTimeout(resize);
            resize = window.setTimeout(resizeCallback, params.autoresize.delay);
          });
        }
        else addResizeListener(container, resizeCallback);
      }
    }
  }

  make$scene() {
    const params = this.params;
    params.physics.create = params.physics.create || function () {};

    const scene = physicsEnabled ? params.physics.create.bind(this)() : new Scene();

    this.simulate = Boolean(physicsEnabled);

    if (params.fog.type === 'regular')
      scene.fog = new Fog(params.fog.hex, params.fog.near, params.fog.far);
    else if (params.fog.type === 'exp'
      || params.fog.type === 'expodential')
      scene.fog = new FogExp2(params.fog.hex, params.fog.density);

    this.importScene(scene, false);
  }

  make$element() {
    this.$element = window.document.createElement('div');
    this.$element.className = 'whs';
    this.$element.style.width = 'inherit';
    this.$element.style.height = 'inherit';
    this.params.container.appendChild(this.$element);

    return this.$element;
  }

  make$camera() {
    const _params = this.params;

    this.$camera = new PerspectiveCamera({
      camera: {
        fov: _params.camera.fov,
        aspect: _params.width / _params.height,
        near: _params.camera.near,
        far: _params.camera.far
      },

      position: {
        x: _params.camera.position.x,
        y: _params.camera.position.y,
        z: _params.camera.position.z
      }
    });

    this.$camera.addTo(this);
  }

  make$rendering() {
    const _params = this.params;
    const computedWidth = Number(_params.width * _params.resolution.width).toFixed();
    const computedHeight = Number(_params.height * _params.resolution.height).toFixed();

    this.$rendering = new BasicRendering(this.params);
  }

  make$helpers() {
    const _helpers = this.params.helpers;

    if (_helpers.axis) this.addHelper('axis', _helpers.axis);
    if (_helpers.grid) this.addHelper('grid', _helpers.grid);
  }

  /**
   * Start animation.
   */
  start() {
    if (this.$rendering) this.$rendering.start(this.beforeRender.bind(this), this.afterRender.bind(this));
  }

  /**
   * Callback called immediately before Plugin Rendering.
   * @param  {Number} delta : delta time elapsed since the last frame.
   */
  beforeRender(delta) {
    for (let i = 0; i < this.children.length; i++)
      if (this.children[i].type === 'morph') this.children[i].native.mixer.update(delta);

    if (this.controls) {
      this.controls.update(Date.now() - this.time);
      this.time = Date.now();
    };

    if (this.simulate) this.$scene.simulate(delta, 1);
  }

  /**
   * Callback called immediately after the Plugin Rendering.
   * @param  {Number} delta : delta time elapsed since the last frame (will be equal to beforeRender delta).
   */
  afterRender(delta) {
    for (let i = 0; i < this.loops.length; i++) {
      const e = this.loops[i];
      if (e.enabled) e.execute(e.clock);
    }
  }

  /**
   * Retrieve the renderer used by the active rendering plugin.
   * @return {THREE.WebGLRenderer} The WebGLRenderer used by the current rendering plugin.
   */
  get renderer() {
    if (this.$rendering) return this.$rendering.$renderer;
  }

  addLoop(loop) {
    return new Promise((resolve) => {
      this.loops.push(loop);
      resolve(loop);
    });
  }

  removeLoop(loop) {
    return new Promise((resolve) => {
      this.loops.filter((l) => l !== loop);
      resolve(loop);
    });
  }

  addHelper(name, params = {}, helpers = World.helpers) {
    super.addHelper(name, params, helpers);
  }

  addConstraint(constraint) {
    this.$scene.addConstraint(constraint);
  }

  /**
   * This functon will scene properties when it's called.
   */
  setSize(width = 1, height = 1) {
    this.$camera.native.aspect = width / height;
    this.$camera.native.updateProjectionMatrix();

    if (this.$rendering) {
      this.$rendering.setSize(width, height);
    }
  }

  importScene(scene, nested = true) {
    this.modules.scene = scene;

    if (nested) {
      this.children = [];

      const moveChildren = (object) => {
        for (let i = 0, max = object.children.length; i < max; i++) {
          const obj3D = object.children[i];
          let WHSobj;

          WHSobj = new Component(obj3D);
          WHSobj.addTo(this);

          if (obj3D.children.length) moveChildren(obj3D, WHSobj);
        }
      };

      moveChildren(scene, this);
    }

    return this.$scene;
  }

  setControls(controls) {
    const recieved = controls.integrate(this);

    this.controls = recieved instanceof Array ? recieved[0] : recieved;

    if (
      recieved instanceof Array
      && typeof recieved[1] === 'function'
    ) recieved[1](this);

    return this.controls;
  }
}

export {
  World
};

