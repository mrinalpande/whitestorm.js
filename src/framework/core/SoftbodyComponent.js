import {$wrap} from '../utils/ComponentUtils';
import {extend} from '../utils/index';

function SoftbodyComponent(targetComponent) {
  const resultComponent = class SoftbodyComponentEnhance extends targetComponent {
    static defautls = extend(targetComponent.defaults,
      {
        softbody: false
      }
    );

    proccessSoftbodyGeometry(geometry) {
      const _params = this.params;
      const matrix = new THREE.Matrix4();

      matrix.compose(
        new THREE.Vector3(
          _params.position.x,
          _params.position.y,
          _params.position.z
        ),
        new THREE.Quaternion().setFromEuler(
            new THREE.Euler(
            _params.rotation.x,
            _params.rotation.y,
            _params.rotation.z
          )
        ),
        new THREE.Vector3(
          _params.scale.x,
          _params.scale.y,
          _params.scale.z
        )
      );

      geometry.applyMatrix(matrix);
    }

    copy(source) {
      const sourceNative = source.native;

      if (sourceNative) {
        if (source.params.softbody)
          this.native = new sourceNative.constructor(sourceNative.tempGeometry.clone(), sourceNative.material, source.params);
        else this.native = sourceNative.clone(source.params);

        if (sourceNative.mass) this.native.mass = sourceNative.mass;
        this.params = {...source.params};
        this.isPhysics = source.isPhysics;

        this.wrap('no-transforms');

        this.position.copy(source.position);
        this.rotation.copy(source.rotation);
        this.quaternion.copy(source.quaternion);
      } else this.params = source.params;

      this.callCopy(this);

      return this;
    }

    wrapTransforms() {
      const _params = this.params;

      if (!_params.softbody) {
        const position = _params.position,
          rotation = _params.rotation,
          scale = _params.scale;

        this.position.set(
          position.x,
          position.y,
          position.z
        );

        this.rotation.set(
          rotation.x,
          rotation.y,
          rotation.z
        );

        this.scale.set(
          scale.x,
          scale.y,
          scale.z
        );
      }
    }

    clone() {
      return this.params.softbody ? new resultComponent(this.params) : new resultComponent({build: false}).copy(this);
    }
  }

  $wrap(resultComponent).onCallAddTo(scope => {
    if (scope.params.softbody) {
      scope.native.position.set(0, 0, 0);
      scope.native.rotation.set(0, 0, 0);
    }
  });

  return resultComponent;
}

export {
  SoftbodyComponent
};
