import Dog from "./components/Dog";
import { Canvas } from "@react-three/fiber";
import "./App.css";

const App = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas>
        <Dog />
      </Canvas>
    </div>
  );
};

export default App;
