import {
  Mesh,
  ShapeBufferGeometry,
  ShapeGeometry
} from 'three';

import {Component} from '../../core/Component';
import {MeshComponent} from '../../core/MeshComponent';
import {loadMaterial} from '../../utils/index';

@MeshComponent
class Shape extends Component {
  static defaults = {
    ...Component.defaults,
    geometry: {
      shapes: []
    }
  };

  static instructions = {
    ...Component.instructions,
    geometry: ['shapes']
  };

  constructor(params = {}) {
    super(params, Shape.defaults, Shape.instructions);


    if (params.build) {
      this.build(params);
      super.wrap();
    }
  }

  build(params = {}) {
    const material = loadMaterial(params.material);

    return new Promise((resolve) => {
      this.native = new Mesh(
        this.buildGeometry(params),
        material
      );

      resolve();
    });
  }

  buildGeometry(params = {}) {
    const GConstruct = params.buffer && !params.softbody ? ShapeBufferGeometry : ShapeGeometry;

    return new GConstruct(
      params.geometry.shapes
    );
  }

  set g_shapes(val) {
    this._native.geometry = this.buildGeometry(this.updateParams({geometry: {shapes: val}}));
  }

  get g_shapes() {
    return this._native.geometry.parameters.shapes;
  }

  clone() {
    return new Shape({build: false}).copy(this);
  }
}

export {
  Shape
};
