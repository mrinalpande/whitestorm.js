import {
  Mesh,
  PolyhedronBufferGeometry,
  PolyhedronGeometry
} from 'three';

import {create} from '../../physics/create/meshes/Convex';

import {Component} from '../../core/Component';
import {MeshComponent} from '../../core/MeshComponent';
import {PhysicsComponent} from '../../core/PhysicsComponent';
import {SoftbodyComponent} from '../../core/SoftbodyComponent';
import {loadMaterial} from '../../utils/index';

const [verticesOfCube, indicesOfFaces] = [
  [
    -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1
  ],
  [
    2, 1, 0, 0, 3, 2,
    0, 4, 7, 7, 3, 0,
    0, 1, 5, 5, 4, 0,
    1, 2, 6, 6, 5, 1,
    2, 3, 7, 7, 6, 2,
    4, 5, 6, 6, 7, 4
  ]
];

@SoftbodyComponent
@PhysicsComponent
@MeshComponent
class Polyhedron extends Component {
  static verticesOfCube = verticesOfCube;
  static indicesOfFaces = indicesOfFaces;

  static defaults = {
    ...Component.defaults,
    geometry: {
      verticesOfCube: verticesOfCube,
      indicesOfFaces: indicesOfFaces,
      radius: 6,
      detail: 2
    },

    physics: {
      create: create
    }
  };

  static instructions = {
    ...Component.instructions,
    geometry: ['verticesOfCube', 'indicesOfFaces', 'radius', 'detail']
  };

  constructor(params = {}) {
    super(params, Polyhedron.defaults, Polyhedron.instructions);

    if (params.build) {
      this.build(params);
      super.wrap();
    }
  }

  build(params = this.params) {
    const material = loadMaterial(params.material);

    return new Promise((resolve) => {
      this.native = this.isPhysics ?
        params.physics.create.bind(this)(params, material)
        : new Mesh(
          this.buildGeometry(params),
          material
        );

      resolve();
    });
  }

  buildGeometry(params = {}) {
    const GConstruct = params.buffer && !params.softbody ? PolyhedronBufferGeometry : PolyhedronGeometry;

    return new GConstruct(
      params.geometry.verticesOfCube,
      params.geometry.indicesOfFaces,
      params.geometry.radius,
      params.geometry.detail
    );
  }

  set g_verticesOfCube(val) {
    this._native.geometry = this.buildGeometry(this.updateParams({geometry: {verticesOfCube: val}}));
  }

  get g_verticesOfCube() {
    return this._native.geometry.parameters.verticesOfCube;
  }

  set g_indicesOfFaces(val) {
    this._native.geometry = this.buildGeometry(this.updateParams({geometry: {indicesOfFaces: val}}));
  }

  get g_indicesOfFaces() {
    return this._native.geometry.parameters.indicesOfFaces;
  }

  set g_radius(val) {
    this._native.geometry = this.buildGeometry(this.updateParams({geometry: {radius: val}}));
  }

  get g_radius() {
    return this._native.geometry.parameters.radius;
  }

  set g_detail(val) {
    this._native.geometry = this.buildGeometry(this.updateParams({geometry: {detail: val}}));
  }

  get g_detail() {
    return this._native.geometry.parameters.detail;
  }

  clone() {
    return new Polyhedron({build: false}).copy(this);
  }
}

export {
  Polyhedron
};
