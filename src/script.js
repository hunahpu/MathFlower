import './style.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import fFloweShader from './shaders/flower/fragment.glsl'
import vFloweShader from './shaders/flower/vertex.glsl'
const canvas = document.querySelector('canvas.webgl');
/*
 * Utils
 */
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }
  
/*
 * Scene
 */
const scene = new THREE.Scene()

/*
 * Parametric Equations
 */
const petal = {
    //Flower Shape
    R0: getRandom(0, 2),
    R1: getRandom(1, 3),
    c: Math.floor(getRandom(3, 12)),
    d: getRandom(.5, 2),
    //Petal Shape
    A: getRandom(1, 5),
    b: getRandom(0.5, 1),
    a: getRandom(0, 3),
    //Perturbation
    p: getRandom(1, 30),
    A1: getRandom(0, 0.2)
    
}
function fxy(t) {
    return petal.R0 + petal.R1 * Math.pow(Math.abs(Math.sin(petal.c * t / 2)), petal.d);
}

let dt = 0

function f1z(t) {
    return petal.A * Math.exp(-petal.b * Math.pow(Math.abs(t), 1.5)) * Math.pow(Math.abs(t), petal.a);
}

function pz(u, v) {
    return 1 + (Math.pow(v, 2) * petal.A1 * Math.sin(petal.p * u));
}

let flower = function (u, v, target) {
    let x = Math.min(dt/3,1)*2*v * Math.cos(u * Math.PI * 2) * fxy(u * Math.PI * 2);
    let z = Math.min(dt/3,1)*2*v * Math.sin(u * Math.PI * 2) * fxy(u * Math.PI * 2);
    let y = pz(u*2*Math.PI, 2*v) * f1z(2*v);

    //return new THREE.Vector3(x, y, z);
    target.set(x, y, z);
};
const axesHelper = new THREE.AxesHelper( 5 ); scene.add( axesHelper );
//tallo

class CustomSinCurve extends THREE.Curve {

	constructor( scale = 1 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {

		const tx = t*3 ;
		const ty = t*t*t*3;
		const tz = 0;

		return optionalTarget.set( tx, ty, tz );

	}

}
const path = new CustomSinCurve( 2 );


const curve = new THREE.CubicBezierCurve3(
	new THREE.Vector3( 0, 0, 0 ),
	new THREE.Vector3( -5, -5, 0 ),
	new THREE.Vector3( 20, -10, 0 ),
	new THREE.Vector3( 10, -15, 0 )
);

const points = curve.getPoints( 50 );
const geometry1 = new THREE.BufferGeometry().setFromPoints( points );

const material1 = new THREE.LineBasicMaterial( { color : 0xff0000 } );

// Create the final object to add to the scene
const curveObject = new THREE.Line( geometry1, material1);
scene.add(curveObject)

const geometryTallo = new THREE.TubeGeometry( curve, 30, .2, 10, false );
const materialTallo = new THREE. MeshStandardMaterial ( {color: 0x0cc10b} );
const cylinderTallo = new THREE.Mesh( geometryTallo, materialTallo );
scene.add( cylinderTallo );

//const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
//scene.add(ambientLight)

// Equals
const ambientLight = new THREE.AmbientLight()
ambientLight.color = new THREE.Color(0xffffff)
ambientLight.intensity = 1
scene.add(ambientLight)
//cylinderTallo.rotation.x=Math.PI
//cylinderTallo.position.y=-2
//let numPoints = 10
//var start = new THREE.Vector3(-10, 0, 20);
//        var middle = new THREE.Vector3(0, 35, 0);
//        var end = new THREE.Vector3(5, 0, -20);

 //       var curveQuad = new THREE.QuadraticBezierCurve3(start, middle, end);

   //     var tube = new THREE.TubeGeometry(curveQuad, numPoints, 0.5, 20, false);
     //   var mesh1 = new THREE.Mesh(tube, new THREE.MeshNormalMaterial({
       //     opacity: 0.9,
        //    transparent: true
        //}));

        //scene.add(mesh1);
//parametric detail surface
const data = {
    slices: 120,
    stacks: 35
};

function updateGeometry() {
    console.log("updating")
    mesh.geometry.dispose()
    mesh.geometry = new THREE.ParametricGeometry(flower, data.slices, data.stacks);
    mesh.rotation.z=-Math.PI/2+0.5
    //cylinderTallo.geometry.dispose()
    //cylinderTallo.geometry = new THREE.TubeGeometry( path, 20, 2, 8, false );
}

/*
 * Object
 */

//const material = new THREE.MeshNormalMaterial({ color: 0xff0000, flatShading: true, side: THREE.DoubleSide })
const material = new THREE.RawShaderMaterial({
    vertexShader: vFloweShader,
    fragmentShader: fFloweShader,
    side: THREE.DoubleSide
})
let geometry = new THREE.ParametricGeometry(flower, data.slices, data.stacks);
const mesh = new THREE.Mesh(geometry, material)

scene.add(mesh)

//GUI
if (window.location.hash == "#debug") {
    const gui = new dat.GUI()



    gui.add(data, 'slices', 25, 100, 1).onChange(updateGeometry)
    gui.add(data, 'stacks', 25, 100, 1).onChange(updateGeometry)

    gui.add(petal, 'R0', 0, 2, 0.1).onChange(updateGeometry)
    gui.add(petal, 'R1', 0, 3, 0.1).onChange(updateGeometry)
    gui.add(petal, 'c', 0, 12, 1).onChange(updateGeometry)
    gui.add(petal, 'd', 0.5, 2, 0.1).onChange(updateGeometry)


    gui.add(petal, 'A', 0, 5, 0.1).onChange(updateGeometry)
    gui.add(petal, 'b', 0, 1, 0.1).onChange(updateGeometry)
    gui.add(petal, 'a', 0, 4, 0.1).onChange(updateGeometry)

    gui.add(petal, 'p', 0, 30, 0.1).onChange(updateGeometry)
    gui.add(petal, 'A1', 0, 1, 0.01).onChange(updateGeometry)
}
//gui.add(petal, 'R1', 0, 3, 0.01)
//gui.add(petal, 'R0', 0, 3, 0.01)

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.x = 11
camera.position.y = 8
scene.add(camera)

//Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle=Math.PI/12*5
controls.minPolarAngle=0
controls.update();

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)

//Animation
const clock = new THREE.Clock();
function animate() {

    requestAnimationFrame(animate);

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();
    dt = clock.getElapsedTime();
    if(dt<3){
        updateGeometry();
    }

    renderer.render(scene, camera);

}


window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix();
    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

animate();