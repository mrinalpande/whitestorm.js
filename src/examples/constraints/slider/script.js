import * as UTILS from './globals';

const world = new WHS.World({
  ...UTILS.$world,

  camera: {
    far: 10000,
    position: [0, 10, 100]
  }
});

const halfMat = {
  kind: 'phong',
  transparent: true,
  opacity: 0.5
};

const box = new WHS.Box({
  geometry: {
    width: 2,
    height: 30,
    depth: 2
  },

  mass: 1,

  material: {
    color: UTILS.$colors.mesh,
    ...halfMat
  },

  position: {
    y: 40
  }
});

const box2 = new WHS.Box({
  geometry: {
    width: 2,
    height: 20,
    depth: 2
  },

  mass: 1,

  material: {
    color: UTILS.$colors.mesh,
    ...halfMat
  },

  physics: {
    damping: 0.1
  },

  position: {
    y: 42,
    z: 10
  }
});

box.addTo(world);
box2.addTo(world);

const constraint = new WHS.SliderConstraint(box2, box,
  new THREE.Vector3(0, box2.position.y, 0),
  new THREE.Vector3(0, 1, 0)
);

world.addConstraint(constraint);

UTILS.addPlane(world, 250);
UTILS.addBasicLights(world);

world.start();
world.setControls(new WHS.OrbitControls());
