# Dog Studio UI Clone - Learning Documentation

A sophisticated 3D interactive website clone featuring Three.js/React Three Fiber with GSAP scroll animations and dynamic material transitions.

## 🎯 Project Overview

This project recreates the Dog Studio portfolio website, combining 3D graphics with smooth scroll-based animations and interactive hover effects. The main feature is an animated 3D dog model that responds to scroll position and changes materials based on portfolio item hovers.

## 🧠 Key Learnings

### 1. **React Three Fiber (R3F) Fundamentals**

#### Scene Setup & Camera Control
```javascript
useThree(({ camera, scene, gl }) => {
  camera.position.z = 0.7;
  gl.toneMapping = THREE.ReinhardToneMapping;
  gl.outputColorSpace = THREE.SRGBColorSpace;
});
```

**Learnings:**
- `useThree` hook provides access to Three.js renderer, camera, and scene
- Tone mapping affects how colors are displayed (ReinhardToneMapping for realistic lighting)
- Color space management is critical for accurate color reproduction
- Camera positioning happens after scene initialization

---

### 2. **3D Model Loading & Animation**

#### GLTF Model Integration
```javascript
const model = useGLTF("/public/models/dog.drc.glb");
const { actions } = useAnimations(model.animations, model.scene);

useEffect(() => {
  actions["Take 001"].play();
}, [actions]);
```

**Learnings:**
- `useGLTF` from @react-three/drei simplifies 3D model loading
- Models can contain embedded animations
- `useAnimations` hook manages animation playback
- Dependency array `[actions]` ensures animation plays when data is ready
- Empty array `[]` would run once immediately (potentially before data loads)
- No array would run every render (performance issue)

---

### 3. **Texture Management**

#### Normal Maps & MatCap Textures
```javascript
const normalMap = useTexture("/public/dog_normal.png");
normalMap.flipY = false;
normalMap.colorSpace = THREE.NoColorSpace; // Critical for normal maps!

const matcapTextures = useTexture([...]).map((texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  return texture;
});
```

**Learnings:**
- **Normal maps must use `NoColorSpace`** - they store directional data, not color
- MatCap textures need SRGB color space for accurate colors
- `flipY` alignment depends on how textures were exported
- Batch loading textures with array destructuring
- Post-processing textures with `.map()` for consistent settings

---

### 4. **Custom Shader Material Modifications**

#### Material Transition System
```javascript
const material = useRef({
  uMatcap1: { value: mat19 },
  uMatcap2: { value: mat2 },
  uProgress: { value: 1.0 },
});

function onBeforeCompile(shader) {
  shader.uniforms.uMatcapTexture1 = material.current.uMatcap1;
  shader.uniforms.uMatcapTexture2 = material.current.uMatcap2;
  shader.uniforms.uProgress = material.current.uProgress;

  shader.fragmentShader = shader.fragmentShader.replace(
    "vec4 matcapColor = texture2D( matcap, uv );",
    `
      vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
      vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
      float transitionFactor = 0.2;
      
      float progress = smoothstep(
        uProgress - transitionFactor,
        uProgress, 
        (vViewPosition.x + vViewPosition.y) * 0.5 + 0.5
      );

      vec4 matcapColor = mix(matcapColor2, matcapColor1, progress);
    `
  );
}

dogMaterial.onBeforeCompile = onBeforeCompile;
```

**Learnings:**
- `onBeforeCompile` allows injecting custom shader code into built-in materials
- Use `useRef` for shader uniforms to avoid re-creating objects on re-renders
- `smoothstep` creates smooth transitions between values
- `mix()` blends between two colors based on progress
- Spatial-based transitions using `vViewPosition` create directional effects
- Must inject uniform declarations AND modify the shader logic

---

### 5. **GSAP ScrollTrigger Integration**

#### Scroll-Based 3D Animation
```javascript
gsap.registerPlugin(ScrollTrigger);

useGSAP(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "section1",
      endTrigger: "section3",
      start: "top top",
      end: "bottom bottom",
      scrub: true, // Smooth scroll sync
    },
  });

  tl.to(dogModelRef.current.scene.position, {
    z: "-=0.75",
    y: "+=0.1",
  })
  .to(dogModelRef.current.scene.rotation, {
    x: `+=${Math.PI / 15}`,
  })
  .to(dogModelRef.current.scene.rotation, {
    y: `+=${Math.PI}`, // Full rotation
    x: `-=${Math.PI / 15}`,
  }, "third") // Label for parallel animation
  .to(dogModelRef.current.scene.position, {
    x: "-=0.5",
    z: "+=0.6",
    y: "-=0.05",
  }, "third");
});
```

**Learnings:**
- `useGSAP` hook provides proper cleanup for GSAP animations in React
- `scrub: true` links animation progress directly to scroll position
- Timeline labels (`"third"`) allow parallel animations
- Relative values (`+=`, `-=`) make animations more maintainable
- `trigger` and `endTrigger` can be different sections
- Store model reference with `useRef` for GSAP to access

---

### 6. **Dynamic Material Switching**

#### Hover-Based Material Changes
```javascript
useEffect(() => {
  const mappings = [
    { title: "tomorrowland", mat: mat19 },
    { title: "navy-pier", mat: mat8 },
    // ...
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
          material.current.uMatcap2.value = material.current.uMatcap1.value;
          material.current.uProgress.value = 1.0;
        },
      });
    };

    el.addEventListener("mouseenter", handler);
    handlers.push({ el, handler, type: "mouseenter" });
  });

  // Cleanup
  return () => {
    handlers.forEach(({ el, handler, type }) => {
      el.removeEventListener(type, handler);
    });
  };
}, []);
```

**Learnings:**
- Bridge between DOM events and WebGL materials
- Store all event handlers for proper cleanup
- Two-step material transition:
  1. Animate from current to new material (progress: 1.0 → 0.0)
  2. Swap materials and reset progress (prevents visual jump)
- Direct DOM manipulation necessary when mixing HTML and WebGL
- Always return cleanup function to prevent memory leaks

---

### 7. **Material Application to Model Parts**

#### Selective Material Assignment
```javascript
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
```

**Learnings:**
- `traverse()` walks through entire scene graph
- Check `isMesh` before accessing material properties
- Use naming conventions in 3D software for selective application
- `needsUpdate = true` tells Three.js to recompile materials
- Different materials for different model parts (dog vs. branches)

---

### 8. **CSS Architecture**

#### Fixed Canvas with Scrolling Content
```css
#canvas-elem {
  height: 100vh;
  width: 100vw;
  position: fixed; /* Stays in place while content scrolls */
  top: 0;
  left: 0;
  z-index: 1;
}

section {
  min-height: 100vh;
  z-index: 2; /* Above canvas */
  position: relative;
}
```

**Learnings:**
- Fixed 3D canvas creates parallax effect as content scrolls over it
- Z-index layering: canvas (1) → sections (2)
- Sections need `position: relative` for z-index to work
- `min-height: 100vh` ensures proper scroll triggers

---

#### Dynamic Background Images on Hover
```css
.images img {
  position: absolute;
  opacity: 0;
  transition: all 0.3s linear;
}

main:has(#section2 .title[img-title="tomorrowland"]:hover) .images #tomorrowland {
  opacity: 1;
}
```

**Learnings:**
- `:has()` selector enables parent-based styling (CSS containment)
- Attribute selectors `[img-title="..."]` connect HTML to CSS
- Pre-load all images with `opacity: 0` for instant transitions
- Smooth fades with CSS transitions

---

### 9. **Performance Considerations**

**Optimization Techniques Used:**
- ✅ `useRef` for shader uniforms (avoids re-creation)
- ✅ Cleanup functions for event listeners
- ✅ Dependency arrays in `useEffect` to control execution
- ✅ `scrub: true` for smooth scroll performance
- ✅ MatCap materials (cheaper than PBR lighting)

**Potential Improvements:**
- 🔄 Add lazy loading for 20 matcap textures
- 🔄 Consider `useMemo` for material creation
- 🔄 Debounce hover events if performance issues arise

---

## 🏗️ Architecture Patterns

### Component Structure
```
App.jsx (HTML structure + sections)
  └─ Dog.jsx (3D scene logic)
       ├─ Model Loading
       ├─ Texture Management  
       ├─ Material System
       ├─ Scroll Animations
       └─ DOM Event Handlers
```

### Data Flow
1. **User Scrolls** → ScrollTrigger → GSAP animates model position/rotation
2. **User Hovers Title** → DOM event → Update shader uniforms → Material transition
3. **Shader Uniforms Change** → GPU re-renders → Smooth visual transition

---

## 🎨 Creative Techniques

### MatCap Material Benefits
- Fast rendering (no light calculations)
- Artistic control over appearance
- Consistent look regardless of scene lighting
- Perfect for portfolio showcase where art direction > realism

### Spatial Transitions
```javascript
float progress = smoothstep(
  uProgress - transitionFactor,
  uProgress, 
  (vViewPosition.x + vViewPosition.y) * 0.5 + 0.5
);
```
Creates directional "wipes" instead of uniform fades - more visually interesting.

---

## 🚀 Technologies Used

- **React** - Component architecture
- **React Three Fiber** - Declarative Three.js in React
- **@react-three/drei** - Helpers (useGLTF, useTexture, useAnimations)
- **Three.js** - 3D rendering engine
- **GSAP** - Animation library
- **ScrollTrigger** - Scroll-based animations
- **Vite** - Build tool (implied)

---

## 📝 Best Practices Demonstrated

1. **Separation of Concerns**: 3D logic in `Dog.jsx`, layout in `App.jsx`
2. **Proper Cleanup**: Event listeners and GSAP animations cleaned up
3. **Texture Optimization**: Correct color spaces for different texture types
4. **Ref Usage**: Avoiding unnecessary re-renders with `useRef`
5. **Accessibility**: Could add ARIA labels (not in current code)
6. **Naming Conventions**: Semantic IDs and class names

---

## 🐛 Common Pitfalls to Avoid

❌ **Wrong color space on normal maps** → weird lighting
❌ **Forgetting cleanup** → memory leaks  
❌ **Missing dependency arrays** → infinite loops or stale closures
❌ **Direct state mutation** → use `.value` for refs
❌ **Not checking `if (child.isMesh)`** → errors on non-mesh objects

---

## 🎓 Key Takeaways

1. **Three.js + React requires careful integration** - Use R3F hooks properly
2. **Shader customization unlocks creative possibilities** - `onBeforeCompile` is powerful
3. **GSAP + ScrollTrigger = smooth scroll experiences** - `scrub: true` is magical
4. **Texture management matters** - Color spaces and flipY settings are critical
5. **Bridge HTML and WebGL carefully** - DOM events can control 3D materials
6. **Performance is about smart choices** - MatCap materials, proper refs, cleanup

---

## 📚 Further Learning

- [Three.js Journey](https://threejs-journey.com/) - Comprehensive Three.js course
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber) - Official documentation
- [GSAP ScrollTrigger](https://greensock.com/scrolltrigger/) - Scroll animation mastery
- [The Book of Shaders](https://thebookofshaders.com/) - GLSL fundamentals

---

## 🙏 Credits

Original design by [Dog Studio](https://dogstudio.co/)  
Clone created for educational purposes

---

*This README documents the technical learnings from building this clone. The goal is educational understanding of modern 3D web techniques.*