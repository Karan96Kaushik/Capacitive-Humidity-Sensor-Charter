function map1(x,in_min,in_max,out_min,out_max) {
    var d = (out_max - out_min) * (x - in_min);
    return (d / (in_max - in_min)) + out_min;
  }

  module.exports = map1;