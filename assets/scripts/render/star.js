
function render_build_frame_star(star) {
    var radius=star.radius;
    var o={};
    var atmosphere={
        Kr:0.0025,
        Km:0.0010,
        ESun:15.0,
        g:-0.990,
        innerRadius:radius,
        outerRadius:radius * 1.05,
        wavelength:[0.650, 0.570, 0.475],
        scaleDepth:0.25,
        mieScaleDepth:0.1
    };
    var diffuse=THREE.ImageUtils.loadTexture("/assets/tmp/earth_day.jpg");
    var diffuse_night=THREE.ImageUtils.loadTexture("/assets/tmp/earth_day.jpg");

    var max_anisotropy=prop.render.threejs.renderer.getMaxAnisotropy();
    diffuse.anisotropy=max_anisotropy;
    diffuse_night.anisotropy=max_anisotropy;

    var uniforms={
        v3LightPosition:{
            type:"v3",
            value:new THREE.Vector3(1e8, 0, 1e8).normalize()
        },
        v3InvWavelength:{
            type:"v3",
            value:new THREE.Vector3(1 / Math.pow(atmosphere.wavelength[0], 4), 1 / Math.pow(atmosphere.wavelength[1], 4), 1 / Math.pow(atmosphere.wavelength[2], 4))
        },
        fCameraHeight:{
            type:"f",
            value:0
        },
        fCameraHeight2:{
            type:"f",
            value:0
        },
        fInnerRadius:{
            type:"f",
            value:atmosphere.innerRadius
        },
        fInnerRadius2:{
            type:"f",
            value:atmosphere.innerRadius * atmosphere.innerRadius
        },
        fOuterRadius:{
            type:"f",
            value:atmosphere.outerRadius
        },
        fOuterRadius2:{
            type:"f",
            value:atmosphere.outerRadius * atmosphere.outerRadius
        },
        fKrESun:{
            type:"f",
            value:atmosphere.Kr * atmosphere.ESun
        },
        fKmESun:{
            type:"f",
            value:atmosphere.Km * atmosphere.ESun
        },
        fKr4PI:{
            type:"f",
            value:atmosphere.Kr * 4.0 * Math.PI
        },
        fKm4PI:{
            type:"f",
            value:atmosphere.Km * 4.0 * Math.PI
        },
        fScale:{
            type:"f",
            value:1 / (atmosphere.outerRadius - atmosphere.innerRadius)
        },
        fScaleDepth:{
            type:"f",
            value:atmosphere.scaleDepth
        },
        fScaleOverScaleDepth:{
            type:"f",
            value:1 / (atmosphere.outerRadius - atmosphere.innerRadius) / atmosphere.scaleDepth,
            g:{
                type:"f",
                value:atmosphere.g
	    },
            g2:{
                type:"f",
                value:atmosphere.g * atmosphere.g
	    }
	},
        nSamples: {
            type:"i",
            value:3
	},
        fSamples:{
            type:"f",
            value:3.0
	},
        tDiffuse:{
            type:"t",
            value:diffuse
	},
        tDiffuseNight:{
            type:"t",
            value:diffuse_night
	},
        tDisplacement:{
            type:"t",
            value:0
	},
        tSkyboxDiffuse:{
            type:"t",
            value:0,
	    fNightScale:{
                type:"f",
                value:1
	    }
	}
    };

    var ground={
        geometry:new THREE.SphereGeometry(atmosphere.innerRadius, 50, 50),
        material:new THREE.ShaderMaterial({
            uniforms:uniforms,
            vertexShader:render_atmosphere_vertex_ground,
            fragmentShader:render_atmosphere_fragment_ground
	})
    };
    ground.mesh=new THREE.Mesh(ground.geometry,ground.material);
    o.ground=ground;
    var sky={
        geometry:new THREE.SphereGeometry(atmosphere.outerRadius, 500, 500),
        material:new THREE.ShaderMaterial({
            uniforms:uniforms,
            vertexShader:render_atmosphere_vertex_sky,
            fragmentShader:render_atmosphere_fragment_sky
	})
    };
    sky.mesh=new THREE.Mesh(sky.geometry,sky.material);
    sky.material.side=THREE.BackSide
    sky.material.transparent=true;
    o.sky=sky;

    var lamp=new THREE.PointLight(0xffff00,1,1000);

    lamp.position.set(0,0,0);

    prop.render.threejs.scene.add(lamp);
    prop.render.threejs.scene.add(ground.mesh);
    prop.render.threejs.scene.add(sky.mesh);

    return {ground:ground,lamp:lamp,sky:sky};
}
