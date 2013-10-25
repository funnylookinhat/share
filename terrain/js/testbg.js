// Boring Stuff
// IGNORE UNTIL YOU SEE
// *** *** *** *** *** *** *** *** 
// *** *** *** *** *** *** *** *** 
// *** *** *** *** *** *** *** *** 

var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
stats.domElement.style.zIndex = '2';

document.body.appendChild( stats.domElement );

var canvas = document.createElement('canvas');
document.getElementById('render').appendChild(canvas);
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  45,
  SCREEN_WIDTH / SCREEN_HEIGHT,
  1,
  10000
);


var renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setClearColor( 0xccccff, 1);
camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
camera.updateProjectionMatrix();
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
renderer.autoClearColor = false;

var cameraShift = 0;
var cameraCheck = false;
var cameraDelta = -5.0;//-0.5;
var cameraY = 15;
var cameraYDelta = 10;

var cameraCycle = 2;
var cameraAngle = 0;

var a = 0.01;
var time;

var width = 100;
var depth = 100;

function render() {
  stats.begin();
  //geometry.attributes.position.needsUpdate = true;
  cameraShift += Math.abs(cameraDelta*2);
  if( ! cameraCheck &&
      cameraShift > 100 ) {
    cameraCheck = true;
  }
  cameraY += cameraYDelta;
  camera.position.x += cameraDelta;
  camera.position.z += cameraDelta;
  camera.position.y = cameraY;
  camera.lookAt({x:0,y:0,z:0});
    
  if( camera.position.x < -2500 && cameraDelta < 0 ) {
    cameraDelta *= -1;
  } else if ( camera.position.x > 2500 && cameraDelta > 0 ) {
    cameraDelta *= -1;
  }
  if( ( cameraY > 1500 && cameraYDelta > 0 ) || 
  	  ( cameraY < 15 && cameraYDelta < 0 ) ) {
  	cameraYDelta *= -1;
  }

  renderer.render(scene, camera);
  stats.end();
}

function init() {
  
  camera.position.set(
    1000,
    cameraY,
    1000
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

// *** *** *** *** *** *** *** *** 
// *** *** *** *** *** *** *** *** 
// *** *** *** *** *** *** *** *** 

function getFunHeight(x,z) {
  return ( 100 * Math.sin( x / Math.PI * 2 ) + 50 * Math.cos( z / Math.PI / 4 ) );
}

function createBufferGeometry(widthLength,depthLength,widthVertices,depthVertices) {
  var numberOfVerts = widthVertices * depthVertices;
  var triangles = ( widthVertices - 1 ) * ( depthVertices - 1 ) * 2;
  var bufferGeometry = new THREE.BufferGeometry();
  
  bufferGeometry.attributes = {
    index: {
      itemSize: 1,
      array: new Uint16Array(triangles * 3),
      numItems: triangles * 3
    },
    position: {
      itemSize: 3,
      array: new Float32Array(numberOfVerts * 3),
      numItems: numberOfVerts * 3
    },
    normal: {
      itemSize: 3,
      array: new Float32Array(numberOfVerts * 3),
      numItems: numberOfVerts * 3
    },
    uv: {
      itemSize: 2,
      array: new Float32Array(numberOfVerts * 2),
      numItems: numberOfVerts * 2
    }
  };

  var chunkSize = 21845;

  var indices = bufferGeometry.attributes.index.array;
  var positions = bufferGeometry.attributes.position.array;
  var normals = bufferGeometry.attributes.normal.array;
  var uvs = bufferGeometry.attributes.uv.array;

  var startX = -widthLength / 2;
  var startZ = -depthLength / 2;
  var chunkX = widthLength / ( widthVertices - 1 );
  var chunkZ = depthLength / ( depthVertices - 1 );

  for( var x = 0; x < widthVertices; x++ ) {
    for( var z = 0; z < depthVertices; z++ ) {
      var index = ( z * widthVertices + x ) * 3;
      positions[index + 0] = startX + x * chunkX;  // X
      positions[index + 1] = getFunHeight(startX + x * chunkX, startZ + z * chunkZ);//0;            // Y
      positions[index + 2] = startZ + z * chunkZ;  // Z

      var uvIndex = ( z * widthVertices + x ) * 2;
      uvs[uvIndex + 0] = x / ( widthVertices - 1 );
      uvs[uvIndex + 1] = 1.0 - z / ( depthVertices - 1 );
    }
  }

  bufferGeometry.offsets = [];

  var lastChunkRow = 0;
  var lastChunkVertStart = 0;

 // For each rectangle, generate its indices
  for (var x = 0; x < ( depthVertices - 1 ); x++ ) {

    var startVertIndex = x * widthVertices;

    // If we don't have space for another row, close
    // off the chunk and start the next
    if ((startVertIndex - lastChunkVertStart) + widthVertices * 2 > chunkSize) {

      var newChunk = {
        start: lastChunkRow * ( widthVertices - 1 ) * 6,
        index: lastChunkVertStart,
        count: (x - lastChunkRow) * ( widthVertices - 1 ) * 6
      };

      bufferGeometry.offsets.push(newChunk);

      lastChunkRow = x;
      lastChunkVertStart = startVertIndex;
    }


    for (var z = 0; z < ( widthVertices - 1 ); ++z) {

      var index = (x * ( widthVertices - 1 ) + z) * 6;
      var vertIndex = (x * widthVertices + z) - lastChunkVertStart;

      indices[index + 0] = vertIndex;
      indices[index + 1] = vertIndex + widthVertices;
      indices[index + 2] = vertIndex + 1;
      indices[index + 3] = vertIndex + 1;
      indices[index + 4] = vertIndex + widthVertices;
      indices[index + 5] = vertIndex + widthVertices + 1;
    }
  }

  var lastChunk = {
    start: lastChunkRow * ( widthVertices - 1 ) * 6,
    index: lastChunkVertStart,
    count: ( ( depthVertices - 1 ) - lastChunkRow) * ( widthVertices - 1 ) * 6
  };

  bufferGeometry.offsets.push(lastChunk);
  //geometry.computeBoundingSphere();
  
  return bufferGeometry;
}


function createGeometry() {
  var numberOfVerts = width * depth;

  // 2 tris per grid rectangle
  var triangles = ( width - 1 ) * ( depth - 1 ) * 2;

  var geometry = new THREE.BufferGeometry();
  geometry.attributes = {
    index: {
      itemSize: 1,
      array: new Uint16Array(triangles * 3),
      numItems: triangles * 3
    },
    position: {
      itemSize: 3,
      array: new Float32Array(numberOfVerts * 3),
      numItems: numberOfVerts * 3
    },
    normal: {
      itemSize: 3,
      array: new Float32Array(numberOfVerts * 3),
      numItems: numberOfVerts * 3
    },
    uv: {
      itemSize: 2,
      array: new Float32Array(numberOfVerts * 2),
      numItems: numberOfVerts * 2
    }
  }

  var chunkSize = 21845;
  var indices = geometry.attributes.index.array;
  var positions = geometry.attributes.position.array;
  var normals = geometry.attributes.normal.array;
  var uvs = geometry.attributes.uv.array;
  var colors = geometry.attributes.color;

  var defaultColor = new THREE.Color(1.0, 0.0, 0.0);

  var startX = -width * 0.5;
  var startZ = -depth * 0.5;
  var tileX = width / (width - 1);
  var tileZ = depth / (depth - 1);

  for (var i = 0; i < depth; ++i) {
    for (var j = 0; j < width; ++j) {

      var index = (i * width + j) * 3;

      positions[index + 0] = startX + j * tileX;
      positions[index + 1] = 0;
      positions[index + 2] = startZ + i * tileZ;

      var uvIndex = (i * width + j) * 2;
      uvs[uvIndex + 0] = j / (width - 1);
      uvs[uvIndex + 1] = 1.0 - i / (depth - 1);
    }
  }

  geometry.offsets = [];

  var lastChunkRow = 0;
  var lastChunkVertStart = 0;

  // For each rectangle, generate its indices
  for (var i = 0; i < ( depth - 1 ); ++i) {

    var startVertIndex = i * width;

    // If we don't have space for another row, close
    // off the chunk and start the next
    if ((startVertIndex - lastChunkVertStart) + width * 2 > chunkSize) {

      var newChunk = {
        start: lastChunkRow * ( width - 1 ) * 6,
        index: lastChunkVertStart,
        count: (i - lastChunkRow) * ( width - 1 ) * 6
      };

      geometry.offsets.push(newChunk);

      lastChunkRow = i;
      lastChunkVertStart = startVertIndex;
    }


    for (var j = 0; j < ( width - 1 ); ++j) {

      var index = (i * ( width - 1 ) + j) * 6;
      var vertIndex = (i * width + j) - lastChunkVertStart;

      indices[index + 0] = vertIndex;
      indices[index + 1] = vertIndex + width;
      indices[index + 2] = vertIndex + 1;
      indices[index + 3] = vertIndex + 1;
      indices[index + 4] = vertIndex + width;
      indices[index + 5] = vertIndex + width + 1;
    }
  }

  var lastChunk = {
    start: lastChunkRow * ( width - 1 ) * 6,
    index: lastChunkVertStart,
    count: ( ( depth - 1 ) - lastChunkRow) * ( width - 1 ) * 6
  };

  geometry.offsets.push(lastChunk);
  //geometry.computeBoundingSphere();
  
  return geometry;
}

function createGeometry2() {
  var numberOfVerts = width / 2 * depth / 2;

  // 2 tris per grid rectangle
  var triangles = ( width / 2 - 1 ) * ( depth / 2 - 1 ) * 2;

  var geometry = new THREE.BufferGeometry();
  geometry.attributes = {
    index: {
      itemSize: 1,
      array: new Uint16Array(triangles * 3),
      numItems: triangles * 3
    },
    position: {
      itemSize: 3,
      array: new Float32Array(numberOfVerts * 3),
      numItems: numberOfVerts * 3
    },
    normal: {
      itemSize: 3,
      array: new Float32Array(numberOfVerts * 3),
      numItems: numberOfVerts * 3
    },
    uv: {
      itemSize: 2,
      array: new Float32Array(numberOfVerts * 2),
      numItems: numberOfVerts * 2
    }
  }

  var chunkSize = 21845;
  var indices = geometry.attributes.index.array;
  var positions = geometry.attributes.position.array;
  var normals = geometry.attributes.normal.array;
  var uvs = geometry.attributes.uv.array;
  var colors = geometry.attributes.color;

  var defaultColor = new THREE.Color(1.0, 0.0, 0.0);

  var startX = -width * 0.5;
  var startZ = -depth * 0.5;
  var tileX = width / (width / 2 - 1);
  var tileZ = depth / (depth / 2 - 1);

  for (var i = 0; i < depth; ++i) {
    for (var j = 0; j < width; ++j) {

      var index = (i * width + j) * 3;

      positions[index + 0] = startX + j * tileX;
      positions[index + 1] = 0;
      positions[index + 2] = startZ + i * tileZ;

      var uvIndex = (i * width + j) * 2;
      uvs[uvIndex + 0] = j / (width - 1);
      uvs[uvIndex + 1] = 1.0 - i / (depth - 1);
    }
  }

  geometry.offsets = [];

  var lastChunkRow = 0;
  var lastChunkVertStart = 0;

  // For each rectangle, generate its indices
  for (var i = 0; i < ( depth - 1 ); ++i) {

    var startVertIndex = i * width;

    // If we don't have space for another row, close
    // off the chunk and start the next
    if ((startVertIndex - lastChunkVertStart) + width * 2 > chunkSize) {

      var newChunk = {
        start: lastChunkRow * ( width - 1 ) * 6,
        index: lastChunkVertStart,
        count: (i - lastChunkRow) * ( width - 1 ) * 6
      };

      geometry.offsets.push(newChunk);

      lastChunkRow = i;
      lastChunkVertStart = startVertIndex;
    }


    for (var j = 0; j < ( width - 1 ); ++j) {

      var index = (i * ( width - 1 ) + j) * 6;
      var vertIndex = (i * width + j) - lastChunkVertStart;

      indices[index + 0] = vertIndex;
      indices[index + 1] = vertIndex + width;
      indices[index + 2] = vertIndex + 1;
      indices[index + 3] = vertIndex + 1;
      indices[index + 4] = vertIndex + width;
      indices[index + 5] = vertIndex + width + 1;
    }
  }

  var lastChunk = {
    start: lastChunkRow * ( width - 1 ) * 6,
    index: lastChunkVertStart,
    count: ( ( depth - 1 ) - lastChunkRow) * ( width - 1 ) * 6
  };

  geometry.offsets.push(lastChunk);
  //geometry.computeBoundingSphere();
  
  return geometry;
}

var meshes = [];

var size = 100;

for( var x = -2500; x <= 2500; x += size ) {
  for( var z = -2500; z <= 2500; z += size ) {
    var vertices = size / 4;
    if( x >= -1000 && x <= 1000 && z >= -1000 && z <= 1000 ) {
      vertices = size / 2;
    }
    if( x >= -500 && x <= 500 && z >= -500 && z <= 500 ) {
      vertices = size;
    }
    var geometry = createBufferGeometry(size,size,vertices,vertices);
    var mesh = new THREE.Mesh(
      geometry
    );
    mesh.position.set(x,0,z);
    scene.add(mesh);
    meshes.push(mesh);
  }
}


/*
var meshes = [];


for( var x = -2500; x <= 2500; x += 100 ) {
  for( var z = -2500; z <= 2500; z += 100 ) {
        var geometry = createGeometry2();
        var mesh = new THREE.Mesh(
            geometry
        );
        mesh.position.set(x,0,z);
        scene.add(mesh);
       meshes.push(mesh);
    }
}
/*
for( var x = -600; x <= 600; x += 100 ) {
    for( var z = -600; z <= 600; z += 100 ) {
        var geometry = createGeometry();
        var mesh = new THREE.Mesh(
            geometry
        );
        mesh.position.set(x,0,z);
        scene.add(mesh);
        meshes.push(mesh);
    }
}
*/


init();
