document.addEventListener('DOMContentLoaded', () => {
    initThemeSwitcher();
    initNetworkCanvas();
    initCursorGlow();
    initScrollObserver();
    initThreeBrain();
    initImageFallback();
});

/* =========================================
   0. Theme Switcher
========================================= */
let currentThemeColor = '#00ffff';

function initThemeSwitcher() {
    const themeDots = document.querySelectorAll('.theme-dot');
    
    // Set initial active dot
    themeDots[0].classList.add('active');

    themeDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            // Remove active from all
            themeDots.forEach(d => d.classList.remove('active'));
            // Add active to clicked
            e.target.classList.add('active');
            
            // Get color and apply to root CSS variable
            const color = e.target.getAttribute('data-color');
            currentThemeColor = color;
            document.documentElement.style.setProperty('--accent-color', color);
        });
    });
}

/* =========================================
   1. Interactive Neural Network Background
========================================= */
function initNetworkCanvas() {
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    const spacing = 35; // Finer grid spacing
    let cols, rows;
    let scrollAlpha = 1;

    let mouse = {
        x: null,
        y: null,
        radius: 120 // Subtle interaction radius
    };

    window.addEventListener('scroll', () => {
        let fadeStart = 100;
        let fadeEnd = window.innerHeight * 0.8;
        let scrolled = window.scrollY;
        
        if (scrolled < fadeStart) {
            scrollAlpha = 1;
        } else if (scrolled > fadeEnd) {
            scrollAlpha = 0;
        } else {
            scrollAlpha = 1 - ((scrolled - fadeStart) / (fadeEnd - fadeStart));
        }
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    }
    
    window.addEventListener('resize', resize);
    
    class Particle {
        constructor(x, y) {
            this.baseX = x;
            this.baseY = y;
            this.x = x;
            this.y = y;
        }

        update(time) {
            // Subtle wiggle effect (wavey)
            let waveX = Math.sin(time * 0.001 + this.baseY * 0.02) * 4;
            let waveY = Math.cos(time * 0.001 + this.baseX * 0.02) * 4;
            
            let targetX = this.baseX + waveX;
            let targetY = this.baseY + waveY;

            // Mouse interaction (push outward/bulge gently)
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.baseX;
                let dy = mouse.y - this.baseY;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Push particles away from mouse (subtler)
                    targetX -= (dx / distance) * force * 30; 
                    targetY -= (dy / distance) * force * 30;
                }
            }
            
            // Smoothly move to target position
            this.x += (targetX - this.x) * 0.1;
            this.y += (targetY - this.y) * 0.1;
        }

        draw(ctx, rgb) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        cols = Math.ceil(width / spacing) + 1;
        rows = Math.ceil(height / spacing) + 1;
        
        for (let i = 0; i < cols; i++) {
            let col = [];
            for (let j = 0; j < rows; j++) {
                col.push(new Particle(i * spacing, j * spacing));
            }
            particles.push(col);
        }
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 255, b: 255};
    }

    function animate(time) {
        ctx.clearRect(0, 0, width, height);
        
        // Performance optimization: skip drawing if fully scrolled down
        if (scrollAlpha <= 0) {
            requestAnimationFrame(animate);
            return;
        }

        ctx.globalAlpha = scrollAlpha;
        const rgb = hexToRgb(currentThemeColor);
        
        // Update logic
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                particles[i][j].update(time);
            }
        }
        
        // Draw mesh lines (more transparent for subtlety)
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`;
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let p = particles[i][j];
                
                // Draw horizontal line
                if (i < cols - 1) {
                    let right = particles[i+1][j];
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(right.x, right.y);
                    ctx.stroke();
                }
                
                // Draw vertical line
                if (j < rows - 1) {
                    let down = particles[i][j+1];
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(down.x, down.y);
                    ctx.stroke();
                }
            }
        }
        
        // Draw grid dots
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                particles[i][j].draw(ctx, rgb);
            }
        }
        
        requestAnimationFrame(animate);
    }

    resize();
    requestAnimationFrame(animate);
}

/* =========================================
   2. AI Scanner Cursor Glow
========================================= */
function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
}

/* =========================================
   3. Scroll Observer & Decoding Text
========================================= */
function initScrollObserver() {
    const decodeElements = document.querySelectorAll('.decode-text');
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (!el.classList.contains('visible')) {
                    el.classList.add('visible');
                    decodeText(el);
                }
            }
        });
    }, { threshold: 0.1 });

    decodeElements.forEach(el => {
        // Store original text
        el.dataset.value = el.innerText;
        observer.observe(el);
    });

    function decodeText(element) {
        let iterations = 0;
        const originalText = element.dataset.value;
        
        const interval = setInterval(() => {
            element.innerText = originalText.split("").map((letter, index) => {
                // Keep spaces intact
                if (letter === ' ') return ' ';
                
                if(index < iterations) {
                    return originalText[index];
                }
                return letters[Math.floor(Math.random() * letters.length)]
            }).join("");
            
            if(iterations >= originalText.length){
                clearInterval(interval);
            }
            
            iterations += 1 / 2;
        }, 20);
    }
}

/* =========================================
   4. WebGL 3D Voxel Brain (Three.js)
========================================= */
function initThreeBrain() {
    const container = document.getElementById('three-brain-container');
    if (!container || typeof THREE === 'undefined') return;

    // Setup Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 25;
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(200, 200);
    container.appendChild(renderer.domElement);

    // Create a group to hold all voxels
    const brainGroup = new THREE.Group();

    // Voxel Materials - Black solid cube with glowing outline
    const geometry = new THREE.BoxGeometry(0.85, 0.85, 0.85);
    const edges = new THREE.EdgesGeometry(geometry);
    
    // We will update the edge color dynamically
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
    const solidMaterial = new THREE.MeshBasicMaterial({ color: 0x040810, transparent: true, opacity: 0.95 });

    // 1. Try to load external 3D Model
    const loader = new THREE.GLTFLoader();
    loader.load(
        'models/brain.gltf',
        function (gltf) {
            const model = gltf.scene;
            
            // Override materials to match our theme (wireframe + glowing solid)
            model.traverse((child) => {
                if (child.isMesh) {
                    // Create glowing wireframe edges
                    const edges = new THREE.EdgesGeometry(child.geometry);
                    const edgeLines = new THREE.LineSegments(edges, lineMaterial);
                    
                    // Replace material with our dark solid material
                    child.material = solidMaterial;
                    
                    child.add(edgeLines);
                }
            });
            
            // Scale and center the model dynamically
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            
            // Normalize scale so it fits perfectly (assuming target size of ~8 units)
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 8 / maxDim;
            model.scale.set(scale, scale, scale);
            
            model.position.x = -center.x * scale;
            model.position.y = -center.y * scale;
            model.position.z = -center.z * scale;
            
            brainGroup.add(model);
        },
        undefined,
        function (error) {
            console.log('No custom brain.glb found in models/ folder. Using fallback voxel brain.');
            generateFallbackBrain();
        }
    );

    function generateFallbackBrain() {
        // Generate Custom Voxel Brain Shape
        for (let x = -4; x <= 4; x++) {
            for (let y = -4; y <= 3; y++) {
                for (let z = -4; z <= 6; z++) {
                    let addCube = false;
                    let isCenter = (x === 0);
                    
                    // 1. MAIN BODY
                    if (!isCenter) {
                        if (Math.abs(x) <= 3) {
                            if (y === 3 && z >= -1 && z <= 2) addCube = true;
                            if (y === 2 && z >= -2 && z <= 3) addCube = true;
                            if (y === 1 && z >= -3 && z <= 4) addCube = true;
                            if (y === 0 && z >= -3 && z <= 4) addCube = true;
                            if (y === -1 && z >= -2 && z <= 3) addCube = true;
                        }
                    } else {
                        if (y === 2 && z >= -1 && z <= 2) addCube = true;
                        if (y === 1 && z >= -2 && z <= 3) addCube = true;
                        if (y === 0 && z >= -3 && z <= 3) addCube = true;
                        if (y === -1 && z >= -2 && z <= 2) addCube = true;
                    }
                    
                    // 2. BRAIN STEM
                    if (Math.abs(x) <= 1) { 
                        if (y === -1 && z >= 2 && z <= 4) addCube = true;
                        if (y === -2 && z >= 3 && z <= 5) addCube = true;
                        if (y === -3 && z >= 4 && z <= 6) addCube = true;
                        if (y === -4 && z >= 5 && z <= 6) addCube = true;
                    }
                    
                    if (addCube) {
                        const cube = new THREE.Mesh(geometry, solidMaterial);
                        cube.position.set(x, y, z);
                        
                        const edgeLines = new THREE.LineSegments(edges, lineMaterial);
                        edgeLines.position.set(x, y, z);
                        
                        brainGroup.add(cube);
                        brainGroup.add(edgeLines);
                    }
                }
            }
        }
    }

    scene.add(brainGroup);

    function hexToRgbNum(hex) {
        return parseInt(hex.replace(/^#/, ''), 16);
    }

    function animate() {
        requestAnimationFrame(animate);

        // Update colors based on the current CSS theme variable
        const themeColorHex = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        if(themeColorHex) {
            lineMaterial.color.setHex(hexToRgbNum(themeColorHex));
        }

        // Spin and float
        brainGroup.rotation.y += 0.015;
        brainGroup.rotation.x = Math.sin(Date.now() * 0.0015) * 0.15; // gentle nod
        brainGroup.position.y = Math.sin(Date.now() * 0.002) * 0.5;   // float up and down

        renderer.render(scene, camera);
    }

    animate();
}

/* =========================================
   5. Graceful Image Fallbacks
========================================= */
function initImageFallback() {
    const images = document.querySelectorAll('.repo-image');
    images.forEach(img => {
        img.onerror = function() {
            // Prevent infinite loop if fallback also fails
            this.onerror = null; 
            // Replace with a sleek, dark placeholder that fits the aesthetic
            this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='300'%3E%3Crect width='100%25' height='100%25' fill='%230a111a'/%3E%3Ctext x='50%25' y='50%25' font-family='monospace' font-size='16' fill='%23445566' text-anchor='middle' dominant-baseline='middle'%3EPreview Unavailable%3C/text%3E%3C/svg%3E";
            this.style.opacity = '0.5';
        };
    });
}


