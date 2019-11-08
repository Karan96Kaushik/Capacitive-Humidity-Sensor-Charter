var args = process.argv;

args = args.slice(2);

function map1(x,in_min,in_max,out_min,out_max) {
  var d = (out_max - out_min) * (x - in_min);
  return (d / (in_max - in_min)) + out_min;
}

function mapImin(a,b,c,d,g,f) {// x,Imin,Imax,Omin,Omax,d
    return ((a*g)-(a*d)+(c*d)-(c*f))/(g-f);
}

if (args[0] > 50000) {
      
} else {
      
}

//console.log( mapImin(   56835       ,/*55920*/ 0    ,57280  ,0  ,98 ,66 ) )
console.log( mapImin(   61120       ,/*55920*/ 0    ,64678  ,0  ,98 ,47 ) )

console.log(    map1(   args[0]     ,55920          ,57280  ,0  ,98 ) )