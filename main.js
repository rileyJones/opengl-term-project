let vertex_shader_source =
	`#version 300 es
	 precision mediump float;
	 
	 uniform mat4 model;
	 uniform mat4 view;
	 
	 uniform vec3 camera;
	 uniform float now;
	 
	 uniform vec4 lighting_properties;
	 uniform vec3 ambient_color;
	 uniform int directional_lights_count;
	 uniform vec3 directional_lights_direction[4];
	 uniform vec3 directional_lights_color[4];
	 uniform int point_lights_count;
	 uniform vec3 point_lights_position[4];
	 uniform vec3 point_lights_color[4];
	 
	 in vec3 coordinates;
	 in vec2 uv;
	 in vec3 normal;
	 
	 out vec3 v_coordinates;
	 out vec2 v_uv;
	 out vec3 v_normal;
	 
	 out vec4 v_lighting_properties;
	 out vec3 v_ambient_color;
	 flat out int v_directional_lights_count;
	 out vec3 v_directional_lights_direction[4];
	 out vec3 v_directional_lights_color[4];
	 flat out int v_point_lights_count;
	 out vec3 v_point_lights_position[4];
	 out vec3 v_point_lights_color[4];
	 
	 out vec3 v_view;
	 
	 void main() {
	 	float id = float(gl_InstanceID);
	 	vec3 newP = sin(now*id/4000.0) * min(id,1.0)*vec3(sin(id), cos(id), 0);
	 	gl_Position = view * model * vec4(coordinates + newP, 1.0);
	 	
	 	
	 	v_coordinates = (model * vec4(coordinates, 1.0)).xyz;
	 	v_uv = uv;
	 	v_normal = normalize(model * vec4(normal, 0.0)).xyz;
	 	
	 	v_lighting_properties = lighting_properties;
	 	v_ambient_color = ambient_color;
	 	v_directional_lights_count = directional_lights_count;
	 	v_directional_lights_direction = directional_lights_direction;
	 	v_directional_lights_color = directional_lights_color;
	 	v_point_lights_count = point_lights_count;
	 	v_point_lights_position = point_lights_position;
	 	v_point_lights_color = point_lights_color;
	 	
	 	v_view = -normalize((model * vec4(coordinates, 1.0)).xyz - camera);
	 }
	`;

let fragment_shader_source = 
	`#version 300 es
	 precision mediump float;
	 
	 uniform sampler2D tex_0;
	 
	 in vec3 v_coordinates;
	 in vec2 v_uv;
	 in vec3 v_normal;
	 
	 in vec4 v_lighting_properties;
	 in vec3 v_ambient_color;
	 flat in int v_directional_lights_count;
	 in vec3 v_directional_lights_direction[4];
	 in vec3 v_directional_lights_color[4];
	 flat in int v_point_lights_count;
	 in vec3 v_point_lights_position[4];
	 in vec3 v_point_lights_color[4];
	 
	 in vec3 v_view;
	 
	 out vec4 f_color;
	 
	 vec3 light_ambient(
       	vec3 light_color,
      	float material
     ) {
       	return material * light_color;
     }
     
     vec3 light_diffuse(
       	vec3 normal,
       	vec3 light_dir,
       	vec3 light_color,
       	float material
     ) {
       	return material * light_color * max( dot( normal, light_dir ), 0.0);
     }
        
     vec3 light_specular(
       	vec3 normal,
       	vec3 light_dir,
       	vec3 light_color,
       	vec3 view_dir,
       	vec2 material
     ) {
       	vec3 r_hat = 2.0 * dot( normal, light_dir ) * normal - light_dir;
       	return max( 0.0, material.x * pow( dot( r_hat, view_dir ), material.y)) * light_color;
     }
        
     void main() {
     	vec3 out_color = light_ambient(v_ambient_color, v_lighting_properties.x);
       	
       	for(int i = 0; i < v_directional_lights_count; i++) {
       		out_color += light_diffuse(v_normal, v_directional_lights_direction[i], v_directional_lights_color[i],
       								   v_lighting_properties.y);
       		out_color += light_specular(v_normal, v_directional_lights_direction[i], v_directional_lights_color[i],
       									v_view, v_lighting_properties.zw);
       	}
       	for(int i = 0; i < v_point_lights_count; i++) {
       		vec3 pnt_color = light_diffuse(v_normal, normalize(v_point_lights_position[i] - v_coordinates),
       									   v_point_lights_color[i], v_lighting_properties.y);
       		pnt_color += light_specular(v_normal, normalize(v_point_lights_position[i] - v_coordinates),
       									v_point_lights_color[i], v_view, v_lighting_properties.zw);
       		out_color += pnt_color/(2.0 * length(v_point_lights_position[i] - v_coordinates));
       	}
       	
       	f_color = vec4(texture(tex_0, v_uv).rgb * out_color, 1.0);
     }
	`;
	
// get gl context
let canvas = document.getElementById('the-canvas');
let gl = canvas.getContext('webgl2');
gl.enable(gl.DEPTH_TEST);

// compile shaders
const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertex_shader, vertex_shader_source);
gl.compileShader(vertex_shader);
const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragment_shader, fragment_shader_source);
gl.compileShader(fragment_shader);

// bind shaders
const shader_program = gl.createProgram();
gl.attachShader(shader_program, vertex_shader);
gl.attachShader(shader_program, fragment_shader);
gl.linkProgram(shader_program);
gl.useProgram(shader_program);

// render data
const FOV = 16/9;
const FPS = 60;
const far_plane_distance = 10000.0;
const near_plane_distance = 1.0;
let last_render_time = performance.now();

// camera
let camera = {
	position: new Vec4(),
	rotation: new Vec4()
};
function getCameraMatrix(camera) {
	let rotation = 		Mat4.rotation_xy(camera.rotation.x).mul(Mat4.rotation_xz(camera.rotation.z).mul(Mat4.rotation_yz(camera.rotation.y)));
			
	return Mat4.translation(camera.position.x,camera.position.y, camera.position.z).mul(rotation);
}

let scene_graph = create_demo(gl, shader_program, camera);

// start render and update
requestAnimationFrame(render);
setInterval(update, 1000/FPS, 1000/FPS);

function update(delta) {
	keyboardController.update();
	scene_graph.update(delta);
}
	 
function render(now) {
	gl.clear(gl.COLOR_BUFFER_BIT);
	let time_delta = (now - last_render_time);
	
	// view matrix
	let cameraM = getCameraMatrix(camera).inverse();
	let C1 = 2 * far_plane_distance * near_plane_distance / (far_plane_distance - near_plane_distance);
	let C2 = (far_plane_distance + near_plane_distance) / (far_plane_distance - near_plane_distance);
	let S = Math.tan(FOV*Math.PI);
	let projection = new Mat4([near_plane_distance/S,                             0,  0,   0,
							                       0, near_plane_distance * FOV / S,  0,   0,
							                       0,                             0, C2, -C1,
							                       0,                             0,  1,   0]);
	let view = projection.mul(cameraM);
	
	// set common attributes
	let atr_view = gl.getUniformLocation(shader_program, "view");
	gl.uniformMatrix4fv(atr_view, true, new Float32Array(view.data));
	let atr_camera = gl.getUniformLocation(shader_program, "camera");
	gl.uniform3f(atr_camera, camera.position.x, camera.position.y, camera.position.z);
	let atr_ambient = gl.getUniformLocation(shader_program, "ambient_color");
	gl.uniform3f(atr_ambient, 1, 1, 1);
	let atr_now = gl.getUniformLocation(shader_program, "now");
	gl.uniform1f(atr_now, now);
	
	// get render list
	let render_list = {
		objects: [],
		directional_lights: {
			count: 0,
			direction: [],
			color: []
		},
		point_lights: {
			count: 0,
			position: [],
			color: []
		}
	};
	scene_graph.render_list(new Mat4(), render_list);
	
	// set light properties
	let atr_dir_light_cnt = gl.getUniformLocation(shader_program, "directional_lights_count");
	gl.uniform1i(atr_dir_light_cnt, render_list.directional_lights.count);
	if(render_list.directional_lights.count > 0) {
		let atr_dir_light_dir = gl.getUniformLocation(shader_program, "directional_lights_direction");
		//gl.uniform3fv(atr_dir_light_dir, render_list.directional_lights.count*3,
		gl.uniform3fv(atr_dir_light_dir,
						new Float32Array(render_list.directional_lights.direction));
		let atr_dir_light_clr = gl.getUniformLocation(shader_program, "directional_lights_color");
		//gl.uniform3fv(atr_dir_light_clr, render_list.directional_lights.count*3,
		gl.uniform3fv(atr_dir_light_clr,
						new Float32Array(render_list.directional_lights.color));
	}
	
	let atr_pnt_light_cnt = gl.getUniformLocation(shader_program, "point_lights_count");
	gl.uniform1i(atr_pnt_light_cnt, render_list.point_lights.count);
	if(render_list.point_lights.count > 0) {
		let atr_pnt_light_pos = gl.getUniformLocation(shader_program, "point_lights_position");
		//gl.uniform3fv(atr_pnt_light_pos, render_list.point_lights.count*3, 
		gl.uniform3fv(atr_pnt_light_pos,
						new Float32Array(render_list.point_lights.position));
		let atr_pnt_light_clr = gl.getUniformLocation(shader_program, "point_lights_color");
		//gl.uniform3fv(atr_pnt_light_clr, render_list.point_lights.count*3, 
		gl.uniform3fv(atr_pnt_light_clr,
						new Float32Array(render_list.point_lights.color));
	}
	// render
	for(let index in render_list.objects) {
		render_list.objects[index].render(gl, now);
	}
	
	// setup next frame
	last_render_time = now;
	requestAnimationFrame(render);
}
