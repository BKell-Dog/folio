---
title: 3D Website Design - Part 2 - 3D Models and Rendering
author: Will Kelly
date: 2025-03-10
tags: Web
---

Three.js has the potential to import and render pretty much any 3D object from most 3D file formats. OBJ, STL, SVG, and TIFF [are supported](https://github.com/mrdoob/three.js/tree/dev/examples%2Fjsm%2Floaders), to name a few. Most importantly for this article if the glTF filetype, which is used in the [official examples](https://threejs.org/docs/#manual/en/introduction/Loading-3D-models). Then just download a glTF file from an online platform, copy the example code, and you'll have a basic rendered object. Just try to keep the triangle count low, or the browser will suffer.

```js
// Import from local Three.js folder
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';

...

// Load in a model
const loader = new GLTFLoader();
loader.load( './example/scene.gltf', function ( gltf ) {
  scene.add( gltf.scene );
}, undefined, function ( error ) {
  console.error( error );
} );
```

In this example, you've downloaded (most likely) a .zip file from the internet, extracted it into the base folder of this JS code, and the folder is called 'example'. Inside most glTF folders I've seen is a file called 'scene.gltf' that actually contains the 3D model, sometimes next to a subdirectory called 'textures', etc. It is also important to know that in Three.js, the gltf object is not a 3D model itself, but an object. *gltf.scene* contains the 3D model, so if you try to do *scene.add( gltf );* an error will be thrown.

Now, with a basic 3D object, you can manipulate it's common attributes extremely easily, like so:

```js
// Load in a new model
const loader = new GLTFLoader();
loader.load( './example2/scene.gltf', function ( gltf ) {

  gltf.scene.position.set(/* x = */ 15, /* y = */ 8, /* z = */ 22);
  gltf.scene.rotation.set(/* i = */ Math.PI, /* j = */ 0.0125, /* k = */ 0);
  gltf.scene.scale.set(3, 6, 0.25); // Scale x axis by 3, y axis by 6, etc...

  scene.add( gltf.scene );
}, undefined, function ( error ) {
  console.error( error );
} );
```

This will create an object whose center is located at coordinates (15, 8, 22), rotated 180° (π radians) around its x-axis, 0.0125 radians around its y-axis, and 0 rad around its z-axis, and which is stretched on its x- and y-axes by a factor of 3 and 6 respectively, and shrunk on its z-axis by a quarter. *Nota bene* that, in Three.js, rotation is handled with [quaternions](https://math.libretexts.org/Bookshelves/Abstract_and_Geometric_Algebra/Introduction_to_Groups_and_Geometries_(Lyons)/01%3A_Preliminaries/1.02%3A_Quaternions), and you can access a variable called *model.scene.quaternion* for any glTF model, which is represented as a 4D vector containing *(x, y, z, w)*, i.e. the three axis coordinates of the rotation + a scaling factor *w*.

In my scene, I want a skybox and a prebuilt environment, so I add them as follows. The skybox model will naturally be gigantic, and easily cover any other model. On my site I've chosen a low-poly mansion as the scene's backdrop.

```js
const loader = new GLTFLoader();

loader.load( './skybox/scene.gltf', function ( gltf ) {
  scene.add( gltf.scene );
}, undefined, function ( error ) {
  console.error( error );
} );
loader.load( './mansion/scene.gltf', function ( gltf ) {
  gltf.scene.position.set(0, -2, -15);
  gltf.scene.scale.set(0.0125, 0.0125, 0.0125);
  scene.add( gltf.scene );
}, undefined, function ( error ) {
  console.error( error );
} );
```

I also add two lights, one directional and one ambient, both positioned far above the scene. The directional light will cast shadows and create depth. The isotropic ambient light will make the scene warm and smooth out the harshness of the shadows.

```js
// Create a directional light
const light = new THREE.DirectionalLight(0xF0F9FF, 5);
light.position.set(25, 50, 25);
light.castShadow = true;
scene.add(light);

// Create a global ambient light to soften shadows
const ambLight = new THREE.AmbientLight(0xF0F9FF, 1);
ambLight.position.set(25, 50, 25);
scene.add(ambLight);
```
