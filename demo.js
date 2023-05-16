function create_demo(gl, shader_program, camera) {
	const camera_move_speed = 0.1;
	const camera_rotate_speed = 0.005;
	camera.position = new Vec4(0,0,-20,0);
	camera.rotation = new Vec4(0,0,0,0);
	
	let demo_scene = new ObjNode("NULL");
	demo_scene.matrix = Mat4.scale(10,10,10);
	//demo_scene.update = demo_update;

	let sky_box = new ObjNode("OBJECT");
	sky_box.mesh = Mesh.box(gl, shader_program, 1,1,1);
	sky_box.texture = new Texture("texture_map.png");
	sky_box.matrix = Mat4.scale(900,900,900);
	demo_scene.children.push(sky_box);

	let center_planet = new ObjNode("OBJECT");
	center_planet.mesh = Mesh.uv_sphere(gl, shader_program, 0.5, 16, 16);
	center_planet.texture = new Texture("ivy_seamless.png");
	center_planet.lighting_properties = new Vec4(0.25, 1.0, 2.0, 4.0);
	demo_scene.children.push(center_planet);
	
	let center_planet_center = new ObjNode("NULL");
	center_planet.children.push(center_planet_center);

	let point_light = new ObjNode("POINT_LIGHT");
	point_light.light_vector = new Vec4(-1,-1,0,1);
	point_light.light_color = new Vec4(5,5,5,1);
	demo_scene.children.push(point_light);

	let bottom_light = new ObjNode("POINT_LIGHT");
	bottom_light.matrix = Mat4.translation(0,1,0,0);
	bottom_light.light_color = new Vec4(80,0,0,1);
	demo_scene.children.push(bottom_light);

	let planet = new ObjNode("OBJECT");
	planet.mesh = Mesh.uv_sphere(gl, shader_program, 0.2, 16, 16);
	planet.matrix = Mat4.translation(-1,0,0);
	planet.texture = new Texture("wood_boards.png");
	planet.lighting_properties = new Vec4(0.25, 1.0, 2.0, 4.0);
	center_planet_center.children.push(planet);

	let planet_center = new ObjNode("NULL");
	planet.children.push(planet_center);

	let moon = new ObjNode("OBJECT");
	moon.matrix = Mat4.translation(-0.3,0,0);
	moon.mesh = Mesh.uv_sphere(gl, shader_program, 0.05, 16, 16);
	moon.texture = new Texture("blue_water.png");
	moon.lighting_properties = new Vec4(0.25*2, 1.0, 2.0, 4.0);
	planet_center.children.push(moon);
	
	let moon_light = new ObjNode("POINT_LIGHT");
	moon_light.light_color = new Vec4(0,0,10,0);
	moon.children.push(moon_light);
	
	let particles = new ObjNode("PARTICLE");
	particles.mesh = Mesh.uv_sphere(gl, shader_program, 0.05, 4, 4);
	particles.matrix = Mat4.translation(0,0,-10);
	particles.particle_count = 20;
	particles.texture = moon.texture;
	demo_scene.children.push(particles);

	let flashlight = new ObjNode("OFF_DIRECTIONAL_LIGHT");
	flashlight.light_color = new Vec4(1,1,1,1);
	demo_scene.children.push(flashlight);
	
	demo_scene.update = function(delta) {
		point_light.light_vector = Mat4.rotation_xz(delta*0.0005).transform_vec(point_light.light_vector);
		center_planet_center.matrix = Mat4.rotation_xz(delta*0.0001).mul(center_planet_center.matrix);
		planet_center.matrix = Mat4.rotation_xz(delta*-0.0004).mul(planet_center.matrix);
		center_planet.matrix = Mat4.translation(0,0,-0.002).mul(center_planet.matrix);
		
		let move_pos = new Vec4(0,0,0,0);
		if(keyboardController.isKeyHeld("KeyW")) {
			move_pos = move_pos.add(new Vec4(0,0,1,0));
		}
		if(keyboardController.isKeyHeld("KeyA")) {
			move_pos = move_pos.add(new Vec4(1,0,0,0));
		}
		if(keyboardController.isKeyHeld("KeyS")) {
			move_pos = move_pos.add(new Vec4(0,0,-1,0));
		}
		if(keyboardController.isKeyHeld("KeyD")) {
			move_pos = move_pos.add(new Vec4(-1,0,0,0));
		}
		if(keyboardController.isKeyHeld("KeyC")) {
			move_pos = move_pos.add(new Vec4(0,1,0,0));
		}
		if(keyboardController.isKeyHeld("Space")) {
			move_pos = move_pos.add(new Vec4(0,-1,0,0));
		}
		move_pos = move_pos.scaled(camera_move_speed);
			
		let rotate = new Vec4(0,0,0,0);
		if(keyboardController.isKeyHeld("KeyQ")) {
			rotate = rotate.add(new Vec4(-1,0,0,0));
		}
		if(keyboardController.isKeyHeld("KeyE")) {
			rotate = rotate.add(new Vec4(1,0,0,0));
		}
		if(keyboardController.isKeyHeld("ArrowUp")) {
			rotate = rotate.add(new Vec4(0,1,0,0));
		}
		if(keyboardController.isKeyHeld("ArrowDown")) {
			rotate = rotate.add(new Vec4(0,-1,0,0));
		}
		if(keyboardController.isKeyHeld("ArrowLeft")) {
			rotate = rotate.add(new Vec4(0,0,-1,0));
		}
		if(keyboardController.isKeyHeld("ArrowRight")) {
			rotate = rotate.add(new Vec4(0,0,1,0));
		}
		
		camera.rotation = camera.rotation.add(rotate.scaled(camera_rotate_speed));
		let rotation = Mat4.rotation_xy(camera.rotation.x).mul(Mat4.rotation_xz(camera.rotation.z).mul(Mat4.rotation_yz(camera.rotation.y)));
		
		if(keyboardController.isKeyHeld("KeyF")) {
			flashlight.type = "DIRECTIONAL_LIGHT";
			flashlight.light_vector = rotation.transform_vec(new Vec4(0,0,-1));
		} else if(keyboardController.isKeyReleased("KeyF")) {
			flashlight.type = "OFF_DIRECTIONAL_LIGHT";
		}
		
		
		move_pos = rotation.transform_vec(move_pos);
			
		if(move_pos.x == null || move_pos.y == null || move_pos.z == null) return;
		camera.position = camera.position.add(move_pos);
		
	};
	return demo_scene;
}

