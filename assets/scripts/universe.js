
function km_to_ly(km) {
    return(km/9460730472580.8);
}

var Time=function(data) {
    if(data != undefined) {
	this.year=data.year;
    }
};

var Frame=function(data) {
    this.threejs={};
    this.init=function() {
	this.__init__(this.data);
	if(this.position == undefined)
	    this.position=new Coordinate();
    };
};

var Coordinate=function(data) {
    if(data != undefined) {
	this.distance=data.distance; // in ly
	this.latitude=data.latitude // in degrees (bah)
	this.longitude=data.longitude // in degrees
	this.vector=data.vector; // movement per unknown unit
	this.at=data.at; // what time was it here
    }
    if(this.at == undefined)
	this.at=new Time({year:0});
    if(this.distance == undefined)
	this.distance=0;
    if(this.latitude == undefined)
	this.latitude=0;
    if(this.longitude == undefined)
	this.longitude=0;
};

var Star=function(data) {
    this.data=data;
    this.type="star";
    this.__init__=function(data) {
	if(data != undefined) {
	    this.name=data.name;
	    this.spectral=data.spectral;
	    this.planets=data.planets;
	    this.mass=data.mass;
	    this.radius=data.radius;
	}
	if(this.planets == undefined)
	    this.planets={};
	this.child_frame=this.planets;
    };
    this.init();
};

inherits(Frame,Star);

var Planet=function(data) {
    this.data=data;
    this.type="planet";
    this.__init__=function(data) {
	if(data != undefined) {
	    this.name=data.name;
	    this.moons=data.moons;
	    this.mass=data.mass;
	};
	if(this.name == undefined)
	    this.name=null;
	if(this.moons == undefined)
	    this.moons={};
	if(this.mass == undefined)
	    this.mass=null;
	this.child_frame=this.moons;
    };
    this.init();
};

inherits(Frame,Planet);

function universe_init() {
    prop.universe={};
    prop.universe.stars={};
    prop.universe.stars.sun=new Star({
	name:"Sun",
	mass:1.9891e+30,
	radius:2,
	position:new Coordinate({
	    distance:0,
	    latitude:0,
	    longitude:0,
	    at:new Time({
		year:0.0
	    }),
	    vector:new Coordinate() // not moving
	}),
	spectral:"G2V",
	planets:{
	    0:new Planet({
		name:"Mercury",
		mass:33.022*10e23,
		radius:10,
		position:new Coordinate({
		    distance:km_to_ly(53000),
		    latitude:0,
		    longitude:0,
		    vector:new Coordinate({
			longitude: 10
		    })
		})
	    })
	}
    });
    prop.universe.camera_location=new Coordinate({
	distance:km_to_ly(10)
    });
    prop.universe.frame={};
    prop.universe.frame.physics=prop.universe.stars.sun.planets[0];
    prop.universe.frame.render=prop.universe.stars.sun;
    prop.universe.frame.dirty=true;
    universe_frame();
    loaded("universe");
}

function universe_frame() {
//    console.log(prop.universe.frame.render);
}

function universe_update() {
    
}