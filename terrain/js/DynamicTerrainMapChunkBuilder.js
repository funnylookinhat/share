/**
 * Worker / Pool Manager for Generating Chunks
 * Requires DynamicTerrainMapChunkWorker.js
 */

THREE.DynamicTerrainMapChunkBuilder = function () {
  this._width = null;
  this._depth = null;
  this._heightMap = null;
  this._heightMapLength = null;
  this._sendChunkGeometry = null;
  this._requestQueue = null;
  
  this._workers = null;
}

THREE.DynamicTerrainMapChunkBuilder.prototype.init = function (options) {
  this._width = options.width;
  this._depth = options.depth;
  this._heightMap = options.heightMap;
  this._heightMapLength = options.heightMapLength;
  this._sendChunkGeometry = options.sendChunkGeometry;

  var workerCount = options.workerCount ? options.workerCount : 1;
  this._workers = [];
  this._workersReady = [];

  var self = this;

  for( var i = 0; i < workerCount; i++ ) {
    this._workers[i] = new Worker('js/DynamicTerrainMapChunkWorker.js');
    this._workers[i].onmessage = function (e) {
      self._workerCallback(e,self);
    }
    this._workersReady[i] = false;
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
  var workerId = e.data.id;
  if( e.data.action == 'init' ) {
    // Grab the next - we're ready!
    self._getNextJob(workerId, self);
  } else {
    // Process
    var mapChunkIndex = e.data.mapChunkIndex;
    var distanceIndex = e.data.distanceIndex;
    var vertices = e.data.vertices;
    self._sendChunkGeometry(mapChunkIndex, distanceIndex, vertices);
    // Grab the next
    self._getNextJob(workerId, self);
  }
}

THREE.DynamicTerrainMapChunkBuilder.prototype._getNextJob = function (workerId, self) {
  if( this._requestQueue.length > 0 ) {
    var request = this._requestQueue.unshift();
    this._workers[workerId].postMessage({
      action: 'build',
      actionData: request
    });
  } else {
    this._workersReady[workerId] = true;
  }
}

THREE.DynamicTerrainMapChunkBuilder.prototype.updateChunkGeometry = function (request) {
  this._requestQueue.push(request);
  this._assignEmptyWorkers();
}

THREE.DynamicTerrainMapChunkBuilder.prototype._assignEmptyWorkers = function () {
  for( var i = 0; i < this._workersReady.length; i++ ) {
    if( this._workersRead[i] ) {
      this._getNextJob(i);
    }
  }
}