// Boring Stuff

var canvas = document.createElement('canvas');
document.getElementById('render').appendChild(canvas);
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  45,
  SCREEN_WIDTH / SCREEN_HEIGHT,
  1,
  5000
);


var renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setClearColor( 0xccccff, 1);
camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
camera.updateProjectionMatrix();
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
renderer.autoClearColor = false;

var a = 0.00;

function render() {

  if( ( Math.round(a * 100) / 100 ) % 3 == 0 ) {
  console.log('height test go!');
  var x = 0;
  var z = 0;
  var y = 0;
  var d = 0;
  var xMid = terrainMap.width() / 2;
  var zMid = terrainMap.depth() / 2;
  for( var i = 0; i < ( terrainMap.width() * terrainMap.depth() ); i++ ) {
    x = Math.floor( i / terrainMap.width() );
    z = Math.floor( i % terrainMap.width() );
    d = Math.sqrt( Math.pow( ( x - xMid ) , 2 ) + Math.pow( ( z - zMid ) , 2 ));
    if( d <= 100 ) {
      y = a * Math.sqrt( 500 - d );
    } else if( d <= 500 ) {
      y = a * ( 500 - d );
    } else {
      y = 0;
    }
    terrainMap.setHeight(x,z,y);
//    terrainmesh.geometry.vertices[i].y = y;
  }
} else {
  	console.log(a);
  }
  

  renderer.render(scene, camera);

  a += 0.01;
}

function init() {
  
  camera.position.set(
    750,
    250,
    750
  );
  camera.lookAt({x:0,y:0,z:0});

  (function renderLoop(){
    requestAnimFrame(renderLoop);
    render();
  })();
}


window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame  || 
  window.webkitRequestAnimationFrame    || 
  window.mozRequestAnimationFrame       || 
  window.oRequestAnimationFrame         || 
  window.msRequestAnimationFrame        || 
  function( callback ){
    window.setTimeout(callback, 1000 / 60);
  };
})();

function windowResize () {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
  camera.updateProjectionMatrix();
  renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT);
}

window.addEventListener('resize', windowResize, false );

var genericTerrainMaterial = new THREE.GenericTerrainMaterial();
var material = genericTerrainMaterial.generateMaterial();

terrainMap = new THREE.DynamicTerrainMap();
terrainMap.init({
  scene: scene,
  camera: camera,
  material: material,
  flatWidth: 5000,  
  flatDepth: 5000,
  position: {x: 0, y: 0, z: 0},
  debugMode: false,
  useWorkers: useWorkers ? true : false
},init);
