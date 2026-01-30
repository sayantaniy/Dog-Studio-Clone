import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useTexture,
  useAnimations,
} from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const Dog = () => {
  const model = useGLTF("/public/models/dog.drc.glb"); // GLTF loads 3D scenes

  useThree(({ camera, scene, gl }) => {
    camera.position.z = 0.7;
    gl.toneMapping = THREE.ReinhardToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  });

  const { actions } = useAnimations(model.animations, model.scene);

  useEffect(() => {
    actions["Take 001"].play();
  }, [actions]);

  // [] → run once, even if data isn’t ready

  // [actions] → run when data becomes ready

  // No array → run every render (bad here)

  const normalMap = useTexture("/public/dog_normal.png");

  normalMap.flipY = false;
  // Normal maps should NOT use SRGB
  normalMap.colorSpace = THREE.NoColorSpace;

  const [
    mat1,
    mat2,
    mat3,
    mat4,
    mat5,
    mat6,
    mat7,
    mat8,
    mat9,
    mat10,
    mat11,
    mat12,
    mat13,
    mat14,
    mat15,
    mat16,
    mat17,
    mat18,
    mat19,
    mat20,
  ] = useTexture([
    "/matcap/mat-1.png",
    "/matcap/mat-2.png",
    "/matcap/mat-3.png",
    "/matcap/mat-4.png",
    "/matcap/mat-5.png",
    "/matcap/mat-6.png",
    "/matcap/mat-7.png",
    "/matcap/mat-8.png",
    "/matcap/mat-9.png",
    "/matcap/mat-10.png",
    "/matcap/mat-11.png",
    "/matcap/mat-12.png",
    "/matcap/mat-13.png",
    "/matcap/mat-14.png",
    "/matcap/mat-15.png",
    "/matcap/mat-16.png",
    "/matcap/mat-17.png",
    "/matcap/mat-18.png",
    "/matcap/mat-19.png",
    "/matcap/mat-20.png",
  ]).map((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    return texture;
  });

  const material = useRef({
    uMatcap1: { value: mat19 },
    uMatcap2: { value: mat2 },
    uProgress: { value: 1.0 },
  });

  const [branchMap, branchNormalMap] = useTexture([
    "/public/branches_diffuse.jpeg",
    "/public/branches_normals.png",
  ]).map((texture) => {
    texture.flipY = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  const dogMaterial = new THREE.MeshMatcapMaterial({
    normalMap: normalMap, //for bumps and roughness
    matcap: mat2, //for color texture
  });

  const branchMaterial = new THREE.MeshStandardMaterial({
    map: branchMap, //color texture
    normalMap: branchNormalMap,
  });

  function onBeforeCompile(shader) {
    shader.uniforms.uMatcapTexture1 = material.current.uMatcap1;
    shader.uniforms.uMatcapTexture2 = material.current.uMatcap2;
    shader.uniforms.uProgress = material.current.uProgress;

    // Store reference to shader uniforms for GSAP animation

    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      `
        uniform sampler2D uMatcapTexture1;
        uniform sampler2D uMatcapTexture2;
        uniform float uProgress;

        void main() {
        `,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "vec4 matcapColor = texture2D( matcap, uv );",
      `
          vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
          vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
          float transitionFactor  = 0.2;
          
          float progress = smoothstep(uProgress - transitionFactor,uProgress, (vViewPosition.x+vViewPosition.y)*0.5 + 0.5);

          vec4 matcapColor = mix(matcapColor2, matcapColor1, progress );
        `,
    );
  }

  dogMaterial.onBeforeCompile = onBeforeCompile;

  useEffect(() => {
    model.scene.traverse((child) => {
      if (child.isMesh) {
        if (child.name.includes("DOG")) {
          child.material = dogMaterial;
        } else {
          child.material = branchMaterial;
        }
        child.material.needsUpdate = true;
      }
    });
  }, [model]);

  gsap.registerPlugin(ScrollTrigger);
  gsap.registerPlugin(useGSAP);

  const dogModelRef = useRef(model);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "section1",
        endTrigger: "section3",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });
    //s
    tl.to(dogModelRef.current.scene.position, {
      z: "-=0.75",
      y: "+=0.1",
    })
      .to(dogModelRef.current.scene.rotation, {
        x: `+=${Math.PI / 15}`,
      })
      .to(
        dogModelRef.current.scene.rotation,
        {
          y: `+=${Math.PI}`,
          x: `-=${Math.PI / 15}`,
        },
        "third",
      )
      .to(
        dogModelRef.current.scene.position,
        {
          x: "-=0.5",
          z: "+=0.6",
          y: "-=0.05",
        },
        "third",
      );
  });

  useEffect(() => {
  const mappings = [
    { title: "tomorrowland", mat: mat19 },
    { title: "navy-pier", mat: mat8 },
    { title: "msi-chicago", mat: mat9 },
    { title: "phone", mat: mat12 },
    { title: "kikk", mat: mat10 },
    { title: "kennedy", mat: mat8 },
    { title: "opera", mat: mat13 },
  ];

  const handlers = [];

  mappings.forEach(({ title, mat }) => {
    const el = document.querySelector(`.title[img-title="${title}"]`);
    if (!el) return;

    const handler = () => {
      material.current.uMatcap1.value = mat;
      gsap.to(material.current.uProgress, {
        value: 0.0,
        duration: 0.3,
        onComplete: () => {
          material.current.uMatcap2.value =
            material.current.uMatcap1.value;
          material.current.uProgress.value = 1.0;
        },
      });
    };

    el.addEventListener("mouseenter", handler);
    handlers.push({ el, handler, type: "mouseenter" });
  });

  const titlesEl = document.querySelector(".titles");
  let leaveHandler;

  if (titlesEl) {
    leaveHandler = () => {
      material.current.uMatcap1.value = mat2;
      gsap.to(material.current.uProgress, {
        value: 0.0,
        duration: 0.3,
        onComplete: () => {
          material.current.uMatcap2.value =
            material.current.uMatcap1.value;
          material.current.uProgress.value = 1.0;
        },
      });
    };

    titlesEl.addEventListener("mouseleave", leaveHandler);
  }

  return () => {
    handlers.forEach(({ el, handler, type }) => {
      el.removeEventListener(type, handler);
    });
    if (titlesEl && leaveHandler) {
      titlesEl.removeEventListener("mouseleave", leaveHandler);
    }
  };
}, []);

  return (
    <>
      <primitive
        object={model.scene}
        position={[0.2, -0.5, 0]}
        rotation={[0, Math.PI / 3.4, 0]}
      />
      <directionalLight intensity={10} color="0xFFFFFF" position={[0, 5, 5]} />
    </>
  );
};

export default Dog;
