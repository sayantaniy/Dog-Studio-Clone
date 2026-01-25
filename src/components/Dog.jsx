import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'



const Dog = () => {
    const model = useGLTF('/public/models/dog.drc.glb')

  return (
    <>
      <primitive object={model.scene} position={[0, 0, 0]} />
      <directionalLight intensity={1} position={[0, 5, 5]} />
      <OrbitControls />
    </>
  )
}

export default Dog
