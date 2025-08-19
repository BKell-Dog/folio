---
layout: post
title: 3D Website Design - Part 1 - Three.js Setup
author: Will Kelly
date: 2025-03-09
tags: Web
---

I had the idea of making a gallery page on my personal site to display all my engineering projects. I wanted the page to be unique, and impressive, and originally the plan was to have icons representing the projects shown on top of pedestals on the page, which would zoom in and out as the user scrolls, as if the user was waling backward and forward through a hall or art gallery showroom, looking at my projects. I tried to make it in pure CSS, and it was hard. Eventually I got the scene to successfully scroll along the z-axis, and have div elements zoom according to their z-index, simulating distance from the viewport. But I couldn't make the vanishing point on the horizon change from the center of the screen, and I hated how convoluted the code had become. And it was ugly, worst of all.

	// Sample ugly code for camera rotation
	let lookDirection = cameraLookVector(camera);
	let MOVEMENT_FRONT = new THREE.Vector2(lookDirection.getComponent(0) * speed, lookDirection.getComponent(2) * speed);
	let MOVEMENT_SIDE = new THREE.Vector2(-MOVEMENT_FRONT.y, MOVEMENT_FRONT.x);
	let xComponent = MOVEMENT_FRONT.x * INPUT.y + MOVEMENT_SIDE.x * INPUT.x;
	let zComponent = MOVEMENT_FRONT.y * INPUT.y + MOVEMENT_SIDE.y * INPUT.x;
	camera.position.x = camera.position.x + xComponent;
	camera.position.z = camera.position.z + zComponent;

So I scrapped that idea, and discovered the possibility of something more ambitious. Instead of a flat image and z-axis scrolling to simulate walking down a gallery hall, I would instead create a 3D space in CSS that the user could walk through as if in a video game, and my projects would be displayed as objects (and eventually open up rooms that show their usage and progression).

First, I wanted to do this in pure CSS as well, for total compatibility with hypothetical older browsers that could be accessing my site. But doing it in pure CSS meant doing the whole thing by hand, like sculpting marble chip-by-chip; so I allowed JS and chose to use the [Three.js](https://threejs.org/) library to create and manipulate the 3D scene.

Three.js allows developers to easily create 3D objects, including a camera, and manipulate those objects in space. I would know because, without understanding the full capabilities of Three.js, I coded a complicated custom camera rotation and camera movement function based on user input, look direction, and lots of vector algebra, instead of using Three's builtin .getDirection() and .moveForward()/.moveRight() functions, which does everything automatically. My mistake. I was about to go through the trouble of coding every surface and object in CSS, but deep down I knew that I wouldn't have the energy to finish a project involving that much brute force effort, and that breaking the rule of pure CSS by introducing Three.js was worth it by far.


	// Sample script to create a basic scene with a spinning cube.

	// Create the scene
	const scene = new THREE.Scene();

	// Create the camera
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 5;

	// Get the canvas element
	const canvas = document.getElementById('canvas');

	// Create the renderer and set the canvas element
	const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
	renderer.setSize(window.innerWidth, window.innerHeight);

	// Create a green cube
	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	const cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	// Create a directional light in the sky
	const light = new THREE.DirectionalLight(0xF0F9FF, 5);
	light.position.set(25, 50, 25);
	scene.add(light);

	// Animation loop
	function animate() {
	  requestAnimationFrame(animate);

	  // Rotate the cube
	  cube.rotation.x += 0.01;
	  cube.rotation.y += 0.01;

	  renderer.render(scene, camera);
	}

	animate();

I created the scene above, and added in some other features like a wide rotated rectangle as a floor, and a blue sky background. See how much better that is? Three handles object, positioning, animation, and all I have to do is change variables associated to objects either during setup or in the animation loop. This framework will allow me (or you, reader) to create just about any object, or [model](https://bkelldog.neocities.org/log/post.html?file=.%2Flog_files%2F3D%20Website%20Design%20Part%202.md), and interact with it, all from a browser.

As for testing the code in a browser, you could just open the HTML file directly, but most browsers today will likely throw you a CORS error, so I downloaded the http-server package `npm install -g http-server` and used it to serve webpages as if over the net: `http-server -p 4000`. -p specifies the port, and you would find it at http://localhost:4000 (as long as you run the http command from the website's root folder). This doesn't solve every problem with testing the page locally, but it solves most.

Another good trick I used was deleting every unused file from the Three package folder. So first I imported the Three.js package from npm `npm install three #leave out the -g` into the page's folder, and then deleted from the package every folder and most files which my script didn't use. It reduced the size of Three from [28.7 MB](https://www.npmjs.com/package/three) as of March 2025, to a few kB or maybe a MB. I can always add back in any files as needed (which I do in the [next log](https://bkelldog.neocities.org/log/post.html?file=.%2Flog_files%2F3D%20Website%20Design%20Part%202.md) to add in PointerLockControls.js and GLTFLoader.js). It's good to keep the codebase small.

See the next article in this series [here](https://bkelldog.neocities.org/log/post.html?file=.%2Flog_files%2F3D%20Website%20Design%20Part%202.md).