
function render_init() {
    prop.render={};
    prop.render.size={}
    prop.render.threejs={};
    prop.render.frame={};
    prop.render.frame.objects=[];
    $(window).resize(render_resize);
    render_init_threejs();
    render_resize();
    loaded("render");
}

function render_init_threejs() {
    prop.render.threejs.scene=new THREE.Scene();

    prop.render.threejs.camera=new THREE.PerspectiveCamera(75,prop.render.size.aspect,0.1,1000);

    try {
	prop.render.threejs.renderer=new THREE.WebGLRenderer();
    } catch(e) {
	alert("Your computer doesn't support WebGL. Check out get.webgl.org to find out more.");
    }
    prop.render.threejs.renderer.setSize(prop.render.size.width,prop.render.size.height);
    prop.render.threejs.renderer.setClearColor(0x000000,1);

    prop.render.threejs.fog=new THREE.Fog(0xaa9988,10000,100000);
//    prop.render.threejs.scene.fog=prop.render.threejs.fog;

    prop.render.threejs.camera.position.z=2;
    $("#wrapper").append(prop.render.threejs.renderer.domElement);
}

function render_resize() {
    prop.render.size.width=$(window).width();
    prop.render.size.height=$(window).height();
    prop.render.size.aspect=prop.render.size.width/prop.render.size.height;
    prop.render.threejs.renderer.setSize(prop.render.size.width,prop.render.size.height);
    prop.render.threejs.camera.aspect=prop.render.size.aspect;
    prop.render.threejs.camera.updateProjectionMatrix();
}

function render_wipe_frame(frame) {
    if(frame == undefined)
	frame=prop.universe.stars;
    if((frame.threejs != undefined) && (frame.threejs.object != undefined))
	for(var i in frame.threejs.object)
	    prop.render.threejs.scene.remove(frame.threejs.object[i]);
    frame.threejs={};
    if(frame.child_frame != undefined) {
	render_wipe_frame(frame.child_frame);
    }
}

function render_build_frame_item(frame) {
    var r={original:frame};
    if(frame.type == "star")
//	r.object=render_build_frame_star(frame);
	;
    else if(frame.type == "planet")
	r.object=render_build_frame_planet(frame);
    else
	throw "TypeError: nonexistent frame type '"+frame.type+"'";
    return r;
}

function render_build_frame(frame) {
    if(frame.child_frame == undefined)
	return;
    prop.render.frame.objects.push(frame);
    frame.threejs=render_build_frame_item(frame);
    for(var i in frame.child_frame) {
	var cf=frame.child_frame[i];
	if(cf != undefined) {
	    render_build_frame(cf);
	}
    }
}

function render_rebuild_frame() {
    // updates the rendered items
    render_wipe_frame();
    prop.render.frame.objects=[];
    frame=render_build_frame(prop.universe.frame.render);
    prop.universe.frame.dirty=false;
//    console.log(prop.render.frame);
}

function render_update() {
    if(prop.universe.frame.dirty) {
	render_rebuild_frame();
    }
    prop.render.threejs.renderer.render(prop.render.threejs.scene,prop.render.threejs.camera);
}