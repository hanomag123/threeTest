import * as THREE from 'three';
import {GUI} from './data.gui.module.js'
import {GLTFLoader} from './gltfloader.js'

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas, alpha: true, premultipliedAlpha: false, antialias: true});
  const fov = 75;
  const aspect = 2;  //холст по умолчанию
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();

  const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    const light2 = new THREE.DirectionalLight(color, intensity);
    light2.position.set(-1, -20, 4);
    light2.target.position.set(0.5, 10, -1);
    scene.add(light2)

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  const material = new THREE.MeshPhongMaterial({color: 'red'});

  const cubes = [];  // просто массив, который мы можем использовать для вращения кубов
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cubes.push(cube);  // добавьте в наш список кубики для вращения

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  let offset = 0
let currentOffset = 0
document.addEventListener('wheel', () => {
  offset +=event.deltaY / Math.abs(event.deltaY) / 1.5
})

function render(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  currentOffset += time / 400
  currentOffset+=(offset - currentOffset) * 0.04
  cubes.forEach((cube, ndx) => {
    cube.rotation.x = currentOffset
    cube.rotation.y = currentOffset
  });

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
}

function main2() {
  const canvas = document.querySelector('#b');
  const renderer = new THREE.WebGLRenderer({canvas,  alpha: true, antialias: true});

  const fov = 45;
  const aspect = 2;  // холст по умолчанию
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);


  const scene = new THREE.Scene();

  {
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
  }

  {
    const skyColor = 0xB1E1FF;  // светло-голубой
    const groundColor = 0xB97A20;  // коричневато-оранжевый
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(10, 10, 20);
    scene.add(light);
    scene.add(light.target);
  }

  function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // вычислите единичный вектор, который указывает в направлении, в котором камера сейчас находится в плоскости xz от центра прямоугольника
    const direction = (new THREE.Vector3())
        .subVectors(camera.position, boxCenter)
        .multiply(new THREE.Vector3(1, 0, 1))
        .normalize();

    // переместите камеру в положение в единицах расстояния от центра в любом направлении, в котором камера уже находилась от центра
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // выберите некоторые ближние и дальние значения для усеченного конуса, который будет содержать поле.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // наведите камеру так, чтобы она смотрела в центр коробки
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }
  let obj = null
  {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('../chainik.glb', (gltf) => {
      const root = gltf.scene;
      scene.add(root);
      obj = gltf
      obj.scene.position.y = 40
      //вычислите коробку, содержащую все необходимые материалы
      //от корня и ниже
      const box = new THREE.Box3().setFromObject(root);

      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      // установите камеру на рамку коробки
      frameArea(boxSize, boxSize, boxCenter, camera);

      // обновите элементы управления трекболом, чтобы они соответствовали новому размеру
    });
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
  let up = 0

  const observer = new IntersectionObserver((items) => {
    items.forEach(el => {
      if (el.isIntersecting) {
        up = 40
      }
    })
  })
  observer.observe(canvas)
  let currentUp = 0
  function render(time) {
    time *= 0.0001
    currentUp+=(up - currentUp) * 0.04
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    if (obj) {
      obj.scene.rotation.y = time
      obj.scene.position.y = currentUp
    }
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}



main();
main2()
