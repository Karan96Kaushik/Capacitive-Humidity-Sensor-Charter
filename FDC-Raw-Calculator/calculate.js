function calculateImin() {
    var a = document.getElementById("x").value;

    var c = document.getElementById("in_max").value;
    var d = document.getElementById("out_min").value;
    var f = document.getElementById("out_max").value;
    var g = document.getElementById("hum").value;

    console.log("Cal Imin", a,c,d,f,g,((a*g)-(a*d)+(c*d)-(c*f))/(g-f));
    document.getElementById("in_min").value = mapImin(a,"b",c,d,f,g);
}

function calculate() {

    var out_max = document.getElementById("out_max").value;
    var out_min = document.getElementById("out_min").value;
    var x = document.getElementById("x").value;
    var in_max = document.getElementById("in_max").value;
    var in_min = document.getElementById("in_min").value;
    var hum = document.getElementById("hum").value;

    console.log("Cal")
    var d = (out_max - out_min) * (x - in_min);
    //(d / (in_max - in_min)) + out_min;
    console.log((d / (in_max - in_min)) + out_min);

    document.getElementById("hum").value = (d / (in_max - in_min)) + out_min
}

function mapImin(a,b,c,d,g,f) {// x,Imin,Imax,Omin,Omax,hum
    return ((a*g)-(a*d)+(c*d)-(c*f))/(g-f);
}