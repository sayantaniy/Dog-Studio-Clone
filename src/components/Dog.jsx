
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

const Dog = () => {
    const model = useGLTF('/public/models/dog.drc.glb') // GLTF loads 3D scenes

    useThree(({ camera , scene , gl}) => {
      camera.position.z = 0.7
      gl.toneMapping = THREE.ReinhardToneMapping
      gl.outputColorSpace = THREE.SRGBColorSpace
    })

    const { actions } = useAnimations(model.animations, model.scene)

    useEffect(() => {
      actions['Take 001'].play()
    }, [actions])
//     Ultra-short rule to remember 🧠

// [] → run once, even if data isn’t ready

// [actions] → run when data becomes ready

// No array → run every render (bad here)

    const [normalMap, sampleMatCap ] = useTexture(['/public/image.png', '/public/matcap/image.png']).map((texture) =>  {
      texture.flipY = false
      texture.colorSpace = THREE.SRGBColorSpace
      return texture
    })

    const [ branchMap, branchNormalMap] = useTexture(['/public/branches_diffuse.jpeg', '/public/branches_normals.png']).map((texture) =>  {
      texture.flipY = true
      texture.colorSpace = THREE.SRGBColorSpace
      return texture
    })

   const dogMaterial = new THREE.MeshMatcapMaterial({
          normalMap : normalMap, //for bumps and roughness
          matcap : sampleMatCap, //for color texture
    })

   const branchMaterial = new THREE.MeshStandardMaterial({
          map : branchMap, //color texture
          normalMap : branchNormalMap,
    })
    
    model.scene.traverse((child) => {
      if (child.name.includes('DOG')){
        child.material = dogMaterial
      }else{
        child.material = branchMaterial
      }}
    )

    gsap.registerPlugin(ScrollTrigger)
    gsap.registerPlugin( useGSAP)

    const dogModelRef = useRef(model)

    useGSAP(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:'section1',
          endTrigger:'section3',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          markers: true
        }
      })
      //s
      tl
      .to(dogModelRef.current.scene.position, {
         z: "-=0.75",
         y: "+=0.1",
      })
      .to(dogModelRef.current.scene.rotation, {
         x:`+=${Math.PI/15}`,
        })
      .to(dogModelRef.current.scene.rotation, {
         y: `+=${Math.PI}`,
          x:`-=${Math.PI/15}`,
        },'third')
      .to(dogModelRef.current.scene.position, {
        x:'-=0.5',
        z:'+=0.6',
        y:'-=0.1',
      },'third')
})

  return (
    <>
      <primitive object={model.scene} position={[0.2, -0.5, 0]} rotation={[0, Math.PI/3.4, 0]} />
      <directionalLight intensity={10} color= '0xFFFFFF' position={[0, 5, 5]} />
      
    </>
  )
}

export default Dog
