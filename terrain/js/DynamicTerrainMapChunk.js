/**
 * Dynamic Terrain Map Chunk
 * A portion of a larger terrain map.
 */

THREE.DynamicTerrainMapChunk = function () {
  this._width = null;
  this._depth = null;
  this._position = null;
  this._heightMap = null;
  this._heightMapLength = null;
  this._heightMapWidth = null;
  this._heightMapDepth = null;
  this._heightMapWidthZero = null;
  this._heightMapDepthZero = null;
  this._material = null;
  this._camera = null;
  this._scene = null;

  this._geometry = null;
  this._mesh = null;

  this._updating = false;
  this._currentGeometryDistanceIndex = false;
}

THREE.DynamicTerrainMapChunk.detailRanges = [
	150,
  250,
  500
];

THREE.DynamicTerrainMapChunk.prototype = {
  
  constructor: THREE.DynamicTerrainMapChunk,

  /**
   * options parameters:
   *   width
   *   depth
   *   widthPosition
   *   depthPosition
   *   heightMap
   *   heightMapLength
   *   heightMapWidth
   *   heightMapDepth
   *   heightMapWidthZero
   *   heightMapDepthZero
   *   material
   *   camera
   *   scene
   */
  init: function (options) {
    if( this._width != null ||
        this._depth != null ) {
      return;
    }

    this._width = options.width.toString ? options.width : null;
    this._depth = options.depth.toString ? options.depth : null;
    this._heightMap = options.heightMap.toString ? options.heightMap : null;
    this._heightMapLength = options.heightMapLength.toString ? options.heightMapLength : null;
    this._heightMapWidth = options.heightMapWidth.toString ? options.heightMapWidth : null;
    this._heightMapDepth = options.heightMapDepth.toString ? options.heightMapDepth : null;
    this._heightMapWidthZero = options.heightMapWidthZero.toString ? options.heightMapWidthZero : null;
    this._heightMapDepthZero = options.heightMapDepthZero.toString ? options.heightMapDepthZero : null;
    this._material = options.material.toString ? options.material : null;
    this._camera = options.camera.toString ? options.camera : null;
    this._scene = options.scene.toString ? options.scene : null;

    this._position = options.position.toString ? options.position : {x:0,y:0,z:0};

    console.log("CREATING CHUNK AT "+this._position.x+','+this._position.z+' WITH ZEROS '+this._heightMapWidthZero+','+this._heightMapDepthZero);

    this._chunkWorker = new Worker('js/DynamicTerrainMapChunkWorker.js');
    this._chunkWorkerReady = false;
    var self = this;
    this._chunkWorker.onmessage = function (e) {
      self._chunkWorkerCallback(e,self);
    }
    // Check if any null?
    console.log('checking geometry');
    this.checkGeometry();
  },

  // THIS WORKS???
  _chunkWorkerCallback: function(e, self) {
    console.log('RECEIVING '+self._position.x+','+self._position.z);
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
  },

  // Check if we need to redraw 
  checkGeometry: function() {
    if( ! this._currentGeometryDistance ||
        ! this._updating ) {
      var index = this._geometryDistanceIndex();
      if( this._camera.position.y <= THREE.DynamicTerrainMapChunk.detailRanges[0] &&
        (
          ( this._position.x - (this._width / 2) ) >= this._camera.position.x &&
          ( this._position.x + (this._width / 2) ) <= this._camera.position.x &&
          ( this._position.z - (this._depth / 2) ) >= this._camera.position.z &&
          ( this._position.z + (this._depth / 2) ) <= this._camera.position.z
        ) ) {
        this._currentGeometryDistanceIndex = 0;
      }
      //console.log('CHUNK AT '+this._position.x+','+this._position.y+','+this._position.z+' : '+this._currentGeometryDistanceIndex);
      if( index != this._currentGeometryDistanceIndex ) {
        this._currentGeometryDistanceIndex  = index;
        this._updateGeometry();
      }
    }
  },

  position: function() {
    return this._position;
  },

  _updateGeometry: function() {
    var self = this;
    this._updating = true;

    if( this._currentGeometryDistanceIndex >= THREE.DynamicTerrainMapChunk.detailRanges.length ) {
      if( this._mesh ) {
        scene.remove(this._mesh);
        delete this._mesh;
        delete this._geometry;
      }
      return;
    }
    console.log('SENDING '+this._position.x+','+this._position.z);
    if( this._chunkWorkerReady ) {
      this._chunkWorker.postMessage({
        currentGeometryDistanceIndex: this._currentGeometryDistanceIndex,
        width: this._width,
        depth: this._depth,
        heightMap: this._heightMap,
        heightMapWidth: this._heightMapWidth,
        heightMapWidthZero: this._heightMapWidthZero,
        heightMapDepthZero: this._heightMapDepthZero
      });
    } else {
      var xVertices = Math.floor( this._width / Math.pow(4,this._currentGeometryDistanceIndex) );
      var zVertices = Math.floor( this._depth / Math.pow(4,this._currentGeometryDistanceIndex) );


      // Cheap rigging for overlapping
      var geoWidth = this._width;
      var geoDepth = this._depth;
      var startWidth = this._heightMapWidthZero;
      var startDepth = this._heightMapDepthZero;
      var xOffset = 0;
      var zOffset = 0;
      var geoIncrement = Math.pow(4,this._currentGeometryDistanceIndex);
      
      if( this._heightMapWidthZero != 0 ) {
        geoWidth += geoIncrement;
        xVertices++;
        xOffset -= geoIncrement / 2;
        startWidth -= geoIncrement;
      }
      if( ( this._heightMapWidthZero + this._width + geoIncrement ) < this._heightMapWidth ) {
        geoWidth += geoIncrement;
        xVertices++;
        xOffset += geoIncrement / 2;
      }
      if( this._heightMapDepthZero != 0 ) {
        geoDepth += geoIncrement;
        zVertices++;
        zOffset -= geoIncrement / 2;
        startDepth -= geoIncrement;
      }
      if( ( this._heightMapDepthZero + this._depth + geoIncrement ) < this._heightMapDepth ) {
        geoDepth += geoIncrement;
        zVertices++;
        zOffset += geoIncrement / 2;
      }
      


      var newGeometry = new THREE.PlaneGeometry(
        geoWidth,
        geoDepth,
        xVertices - 1,
        zVertices - 1
      );
      newGeometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

      // Heightmap test
      var x = 0;
      var z = 0;
      for( var i = 0; i < newGeometry.vertices.length; i++ ) {
        z = Math.floor( i / xVertices );
        x = i - z * xVertices;
        z = z * ( geoDepth / Math.floor( geoDepth / Math.pow(4,this._currentGeometryDistanceIndex) ) );
        x = x * ( geoWidth / Math.floor( geoWidth / Math.pow(4,this._currentGeometryDistanceIndex) ) );
        newGeometry.vertices[i].y = this._heightMap[this._getHeightMapArrayPosition(Math.floor(startWidth + x), Math.floor(startDepth + z))];
      }
      
      if( this._mesh != null ) {
        scene.remove(this._mesh);
        delete this._mesh;
        delete this._geometry;
      }

      this._geometry = newGeometry;
      this._mesh = new THREE.Mesh(
        this._geometry,
        this._material
      );

      this._mesh.position.set(this._position.x + xOffset,this._position.y,this._position.z + zOffset);
      this._scene.add(this._mesh);

      this._updating = false;
    }
  },

  _geometryDistanceIndex: function() {
    var cameraDistance = this._cameraDistance();
    var i;
    for( i = 0; i < THREE.DynamicTerrainMapChunk.detailRanges.length; i++ ) {
      if( cameraDistance < THREE.DynamicTerrainMapChunk.detailRanges[i] ) {
        return i;
      }
    }
    return i;
  },

  // Get the distance from the center of this chunk to the camera.
  _cameraDistance: function() {
    return Math.sqrt(
      Math.pow((this._position.x - this._camera.position.x),2) +
      Math.pow((this._position.y - this._camera.position.y),2) +
      Math.pow((this._position.z - this._camera.position.z),2)
    );
  },

  _getHeightMapArrayPosition: function (widthPosition, depthPosition) {
    return ( depthPosition * this._heightMapWidth + widthPosition );
  },

};