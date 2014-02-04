/**
 * RGBA Convert
 * Converting RGBA values to/from heightmap values ( i.e. signed "3 decimal" numbers )
 * Expected range +/- 999999.999
 */
 
function convertToRGBA(value) {
  value = parseInt(1000 * (parseFloat(value).toFixed(3)));
  var a = value & 255; value = value >>> 8;
  var b = value & 255; value = value >>> 8;
  var g = value & 255; value = value >>> 8;
  var r = value & 255; value = value >>> 8;
  return {
  	r: r,
  	g: g,
  	b: b,
  	a: a
  }
}
 
function convertToFloat(rgba) {
  var value = 0 >>> 32;
  value += rgba.r; value = value << 8;
  value += rgba.g; value = value << 8;
  value += rgba.b; value = value << 8;
  value += rgba.a;
  return value / 1000;
}