import Dog from "./components/Dog";
import { Canvas } from "@react-three/fiber";
import "./index.css";


const App = () => {
  return (
    <div >
      <main>
      <Canvas style={{
        height:'100vh',
        width:'100vw',
        position:'fixed',
        top:0,
        left:0,
        zIndex:'1',
        backgroundImage: 'url(/public/1.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'

      }}>
        <Dog />
      </Canvas>
      <section id="section1"></section>
      <section id="section2"></section>
      <section id="section3"></section>
      </main>
    </div>
  );
};

export default App;
