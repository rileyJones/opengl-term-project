class ObjNode {
	constructor(type) {
		this.type = type;
		this.mesh = null;
		this.matrix = new Mat4();
		this.lighting_properties = new Vec4(1,0,0,0);
		this.texture = null;
		this.children = [];
		this.light_vector = new Vec4(0,0,0,1);
		this.light_color = new Vec4(0,0,0,0);
		this.particle_count = 1;
	}
	
	render_list(parent_mat, render_list) {
		let self_mat = parent_mat.mul(this.matrix);
		
		if(this.type == "OBJECT") {
			if(this.mesh !== null && this.texture !== null && this.texture.tex !== null) {
				render_list.objects.push(new RenderObj(this.mesh, self_mat, this.lighting_properties, this.texture));
			}
		} else if(this.type == "DIRECTIONAL_LIGHT") {
			if(render_list.directional_lights.count < 4) {
				render_list.directional_lights.count = render_list.directional_lights.count + 1;
				render_list.directional_lights.direction.push(this.light_vector.x);
				render_list.directional_lights.direction.push(this.light_vector.y);
				render_list.directional_lights.direction.push(this.light_vector.z);
				render_list.directional_lights.color.push(this.light_color.x);
				render_list.directional_lights.color.push(this.light_color.y);
				render_list.directional_lights.color.push(this.light_color.z);
			}
		} else if(this.type == "POINT_LIGHT") {
			if(render_list.point_lights.count < 4) {
				let light_vector = self_mat.transform_vec(this.light_vector);
				render_list.point_lights.count = render_list.point_lights.count + 1;
				render_list.point_lights.position.push(light_vector.x);
				render_list.point_lights.position.push(light_vector.y);
				render_list.point_lights.position.push(light_vector.z);
				render_list.point_lights.color.push(this.light_color.x);
				render_list.point_lights.color.push(this.light_color.y);
				render_list.point_lights.color.push(this.light_color.z);
			}
		} else if(this.type == "PARTICLE") {
			render_list.objects.push(new ParticleObj(this.mesh, self_mat, this.lighting_properties, this.texture, this.particle_count));
		}
		for(let index in this.children) {
			this.children[index].render_list(self_mat, render_list);
		}
	}
}
class RenderObj {
	constructor(mesh, matrix, lighting_properties, texture) {
		this.mesh = mesh;
		this.matrix = matrix;
		this.lighting_properties = lighting_properties;
		this.texture = texture;
	}
	render(gl) {
		gl.bindTexture(gl.TEXTURE_2D, this.texture.tex);
		
		let atr_model = gl.getUniformLocation(this.mesh.program, "model");
		gl.uniformMatrix4fv(atr_model, true, new Float32Array(this.matrix.data));
		
		let atr_lighting = gl.getUniformLocation(this.mesh.program, "lighting_properties");
		if(atr_lighting != -1) {
			gl.uniform4f(atr_lighting, this.lighting_properties.x, this.lighting_properties.y,
										this.lighting_properties.z, this.lighting_properties.w);
		}
		
		this.mesh.render(gl);
	}
}

class ParticleObj {
	constructor(mesh, matrix, lighting_properties, texture, particle_count) {
		this.mesh = mesh;
		this.matrix = matrix;
		this.texture = texture;
		this.lighting_properties = lighting_properties;
		this.particle_count = particle_count;
	}
	render(gl) {
		gl.bindTexture(gl.TEXTURE_2D, this.texture.tex);
		
		let atr_model = gl.getUniformLocation(this.mesh.program, "model");
		gl.uniformMatrix4fv(atr_model, true, new Float32Array(this.matrix.data));
		
		let atr_lighting = gl.getUniformLocation(this.mesh.program, "lighting_properties");
		if(atr_lighting != -1) {
			gl.uniform4f(atr_lighting, this.lighting_properties.x, this.lighting_properties.y,
										this.lighting_properties.z, this.lighting_properties.w);
		}
		
		this.mesh.render_instanced(gl, this.particle_count);
	}
}
