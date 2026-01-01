import { useRef, useEffect } from 'react';
import {
  Clock, PerspectiveCamera, Scene, WebGLRenderer, SRGBColorSpace, MathUtils,
  Vector2, Vector3, MeshPhysicalMaterial, ShaderChunk, Color, Object3D,
  InstancedMesh, PMREMGenerator, SphereGeometry, AmbientLight, PointLight,
  ACESFilmicToneMapping, Raycaster, Plane
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const { randFloat, randFloatSpread } = MathUtils;

class Physics {
  constructor(config) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.center = new Vector3();
    this.initPositions();
    this.setSizes();
  }

  initPositions() {
    const { config, positionData } = this;
    this.center.toArray(positionData, 0);
    for (let i = 1; i < config.count; i++) {
      const base = 3 * i;
      positionData[base] = randFloatSpread(2 * config.maxX);
      positionData[base + 1] = randFloatSpread(2 * config.maxY);
      positionData[base + 2] = randFloatSpread(2 * config.maxZ);
    }
  }

  setSizes() {
    const { config, sizeData } = this;
    sizeData[0] = config.size0;
    for (let i = 1; i < config.count; i++) {
      sizeData[i] = randFloat(config.minSize, config.maxSize);
    }
  }

  update(time) {
    const { config, center, positionData, sizeData, velocityData } = this;
    const F = new Vector3(), I = new Vector3(), O = new Vector3();
    const V = new Vector3(), B = new Vector3(), N = new Vector3();
    const _ = new Vector3(), j = new Vector3(), H = new Vector3(), T = new Vector3();

    let startIdx = 0;
    if (config.controlSphere0) {
      startIdx = 1;
      F.fromArray(positionData, 0);
      F.lerp(center, 0.1).toArray(positionData, 0);
      V.set(0, 0, 0).toArray(velocityData, 0);
    }

    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx;
      I.fromArray(positionData, base);
      B.fromArray(velocityData, base);
      B.y -= time.delta * config.gravity * sizeData[idx];
      B.multiplyScalar(config.friction);
      B.clampLength(0, config.maxVelocity);
      I.add(B);
      I.toArray(positionData, base);
      B.toArray(velocityData, base);
    }

    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx;
      I.fromArray(positionData, base);
      B.fromArray(velocityData, base);
      const radius = sizeData[idx];

      for (let jdx = idx + 1; jdx < config.count; jdx++) {
        const otherBase = 3 * jdx;
        O.fromArray(positionData, otherBase);
        N.fromArray(velocityData, otherBase);
        const otherRadius = sizeData[jdx];
        _.copy(O).sub(I);
        const dist = _.length();
        const sumRadius = radius + otherRadius;
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          j.copy(_).normalize().multiplyScalar(0.5 * overlap);
          H.copy(j).multiplyScalar(Math.max(B.length(), 1));
          T.copy(j).multiplyScalar(Math.max(N.length(), 1));
          I.sub(j);
          B.sub(H);
          I.toArray(positionData, base);
          B.toArray(velocityData, base);
          O.add(j);
          N.add(T);
          O.toArray(positionData, otherBase);
          N.toArray(velocityData, otherBase);
        }
      }

      if (config.controlSphere0) {
        _.copy(F).sub(I);
        const dist = _.length();
        const sumRadius0 = radius + sizeData[0];
        if (dist < sumRadius0) {
          const diff = sumRadius0 - dist;
          j.copy(_.normalize()).multiplyScalar(diff);
          H.copy(j).multiplyScalar(Math.max(B.length(), 2));
          I.sub(j);
          B.sub(H);
        }
      }

      if (Math.abs(I.x) + radius > config.maxX) {
        I.x = Math.sign(I.x) * (config.maxX - radius);
        B.x = -B.x * config.wallBounce;
      }
      if (config.gravity === 0) {
        if (Math.abs(I.y) + radius > config.maxY) {
          I.y = Math.sign(I.y) * (config.maxY - radius);
          B.y = -B.y * config.wallBounce;
        }
      } else if (I.y - radius < -config.maxY) {
        I.y = -config.maxY + radius;
        B.y = -B.y * config.wallBounce;
      }
      const maxBoundary = Math.max(config.maxZ, config.maxSize);
      if (Math.abs(I.z) + radius > maxBoundary) {
        I.z = Math.sign(I.z) * (config.maxZ - radius);
        B.z = -B.z * config.wallBounce;
      }
      I.toArray(positionData, base);
      B.toArray(velocityData, base);
    }
  }
}

class SubsurfaceMaterial extends MeshPhysicalMaterial {
  constructor(params) {
    super(params);
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 }
    };
    this.defines.USE_UV = '';
    this.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader = `
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
      ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('void main() {', `
        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif
          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }
        void main() {
      `);
      const lightsFragment = ShaderChunk.lights_fragment_begin.replaceAll(
        'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
        `RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
         RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);`
      );
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightsFragment);
    };
  }
}

const defaultConfig = {
  count: 100,
  colors: [0x6366f1, 0x8b5cf6, 0xec4899],
  ambientColor: 0xffffff,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: { metalness: 0.5, roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.15 },
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0.7,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true
};

const Ballpit = ({ count = 100, gravity = 0.7, friction = 0.9975, wallBounce = 0.95, followCursor = true }) => {
  const canvasRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = { ...defaultConfig, count, gravity, friction, wallBounce, followCursor };
    
    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    
    const scene = new Scene();
    const camera = new PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 20);
    
    const clock = new Clock();
    const physics = new Physics(config);
    
    const roomEnv = new RoomEnvironment();
    const envMap = new PMREMGenerator(renderer, 0.04).fromScene(roomEnv).texture;
    const geometry = new SphereGeometry();
    const material = new SubsurfaceMaterial({ envMap, ...config.materialParams });
    material.envMapRotation.x = -Math.PI / 2;
    
    const instancedMesh = new InstancedMesh(geometry, material, config.count);
    scene.add(instancedMesh);
    
    const ambientLight = new AmbientLight(config.ambientColor, config.ambientIntensity);
    scene.add(ambientLight);
    
    const pointLight = new PointLight(config.colors[0], config.lightIntensity);
    scene.add(pointLight);
    
    const colors = config.colors.map(c => new Color(c));
    for (let i = 0; i < config.count; i++) {
      const colorIdx = Math.floor((i / config.count) * colors.length);
      instancedMesh.setColorAt(i, colors[Math.min(colorIdx, colors.length - 1)]);
    }
    instancedMesh.instanceColor.needsUpdate = true;
    
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.offsetWidth;
      const height = parent.offsetHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      const wHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const wWidth = wHeight * camera.aspect;
      config.maxX = wWidth / 2;
      config.maxY = wHeight / 2;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    const raycaster = new Raycaster();
    const plane = new Plane(new Vector3(0, 0, 1), 0);
    const intersection = new Vector3();
    
    const handleMove = (e) => {
      if (!followCursor) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new Vector2(x, y), camera);
      camera.getWorldDirection(plane.normal);
      raycaster.ray.intersectPlane(plane, intersection);
      physics.center.copy(intersection);
      config.controlSphere0 = true;
    };
    
    const handleLeave = () => {
      config.controlSphere0 = false;
    };
    
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) handleMove(e.touches[0]);
    });
    canvas.addEventListener('touchend', handleLeave);
    
    const dummy = new Object3D();
    const animate = () => {
      instanceRef.current = requestAnimationFrame(animate);
      const time = { delta: clock.getDelta(), elapsed: clock.getElapsedTime() };
      physics.update(time);
      
      for (let i = 0; i < config.count; i++) {
        dummy.position.fromArray(physics.positionData, 3 * i);
        if (i === 0 && !followCursor) {
          dummy.scale.setScalar(0);
        } else {
          dummy.scale.setScalar(physics.sizeData[i]);
        }
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
        if (i === 0) pointLight.position.copy(dummy.position);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
      if (instanceRef.current) cancelAnimationFrame(instanceRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [count, gravity, friction, wallBounce, followCursor]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

export default Ballpit;
