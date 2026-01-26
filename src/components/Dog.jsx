
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { useEffect } from 'react'


const Dog = () => {
    const model = useGLTF('/public/models/dog.drc.glb')

    useThree(({ camera , scene , gl}) => {
      camera.position.z = 0.7
      gl.toneMapping = THREE.ReinhardToneMapping
      gl.outputColorSpace = THREE.SRGBColorSpace
    })

    const {action} = useAnimations(model.animations, model.scene)

    const [normalMap, sampleMatCap] = useTexture(['/public/image.png', '/public/matcap/image.png']).map((texture) =>  {
      texture.flipY = false
      texture.colorSpace = THREE.SRGBColorSpace
      return texture
    })

   const dogMaterial = new THREE.MeshMatcapMaterial({
          normalMap : normalMap,
          matcap : sampleMatCap,
    })
    
    model.scene.traverse((child) => {
      if (child.name.includes('DOG')){
        child.material = dogMaterial
      }}
    )

  return (
    <>
      <primitive object={model.scene} position={[0.2, -0.5, 0]} rotation={[0, Math.PI/3.4, 0]} />
      <directionalLight intensity={10} color= '0xFFFFFF' position={[0, 5, 5]} />
      <OrbitControls />
    </>
  )
}

export default Dog
