/**
 * Worker / Pool Manager for Generating Chunks
 * Requires DynamicTerrainMapChunkWorker.js
 */

THREE.DynamicTerrainMapChunkBuilder = function () {
  this._width = null;
  this._depth = null;
  this._heightMap = null;
  this._heightMapLength = null;
  
  this._workers = null;
}

THREE.DynamicTerrainMapChunkBuilder.prototype.init = function (options) {
  this._width = options.width;
  this._depth = options.depth;
  this._heightMap = options.heightMap;
  this._heightMapLength = options.heightMapLength;

  var workerCount = options.workerCount ? options.workerCount : 1;
  this._workers = [];

  var self = this;

  for( var i = 0; i < workerCount; i++ ) {
    this._workers[i] = new Worker('js/DynamicTerrainMapChunkWorker.js');
    this._workers[i].onmessage = function (e) {
      self._workerCallback(e,self);
    }
    this._workers[i].postMessage({
      action: 'init',
      actionData: {
        id: i,
        width: this._width,
        depth: this._depth,
        heightMap: this._heightMap,
        heightMapLength: this._heightMapLength
      }
    });
  }
}

THREE.DynamicTerrainMapChunkBuilder.prototype._workerCallback = function (e, self) {
  if( e.data.action == 'init' ) {
    // Grab the next - we're ready!
    var workerId = e.data.id;
    console.log("WORKER "+workerId+" IS READY.");
    console.log("### RESPONSE DATA ###");
    console.log(e.data);
    console.log("### RESPONSE DATA ###");
    
  } else {
    // Process
    
    // Grab the next
  }
  /*
  var newGeometry = e.data.geometry;
  var xVertices = Math.floor( this._width / Math.pow(4,this._currentGeometryDistanceIndex) );
  var zVertices = Math.floor( this._depth / Math.pow(4,this._currentGeometryDistanceIndex) );
  var newGeometry = new THREE.PlaneGeometry(
    this._width,
    this._depth,
    xVertices - 1,
    zVertices - 1
  );
  newGeometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
  newGeometry.vertices = e.data.geometry.vertices;

  if( self._mesh != null ) {
    scene.remove(self._mesh);
    delete self._mesh;
    delete self._geometry;
  }

  self._geometry = newGeometry;
  self._mesh = new THREE.Mesh(
    self._geometry,
    self._material
  );

  self._mesh.position.set(self._position.x,self._position.y,self._position.z);
  self._scene.add(self._mesh);

  self._updating = false;
   */
}

