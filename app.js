window.addEventListener("load", () => {
    setTimeout(() => {
        const welcomeScreen = document.getElementById("welcome-screen");
        if (welcomeScreen) {
            welcomeScreen.style.display = "none";
        }
    }, 4000);
});

/* ==========================================================================
   FUTURISTIC ECE PORTFOLIO INTERACTION LOGIC (AISHWARYA L)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------------
    // 1. Audio System (SFX Management)
    // ----------------------------------------------------------------------
    const clickSound = document.getElementById('clickSound');
    const downloadSound = document.getElementById('downloadSound');
    const successSound = document.getElementById('successSound');
    const soundToggleBtn = document.getElementById('soundToggle');
    const soundStatus = soundToggleBtn.querySelector('.sound-status');
    const soundIcon = soundToggleBtn.querySelector('.sound-icon');
    
    // Set audio files volumes to be subtle
    if (clickSound) clickSound.volume = 0.2;
    if (downloadSound) downloadSound.volume = 0.35;
    if (successSound) successSound.volume = 0.35;

    let soundEnabled = false; // Default to false to avoid browser autoplay blocks, user toggles

    function updateSoundUI() {
        if (soundEnabled) {
            soundStatus.textContent = 'AUDIO ON';
            soundToggleBtn.classList.add('active');
            soundIcon.style.color = 'var(--cyan)';
        } else {
            soundStatus.textContent = 'AUDIO OFF';
            soundToggleBtn.classList.remove('active');
            soundIcon.style.color = 'var(--text-muted)';
        }
    }

    soundToggleBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        updateSoundUI();
        if (soundEnabled) {
            playSFX(clickSound);
        }
    });

    function playSFX(audioElement) {
        if (soundEnabled && audioElement) {
            audioElement.currentTime = 0;
            audioElement.play().catch(err => console.log('Audio playback blocked: ', err));
        }
    }

    // Play hover clicks on interactive elements
    const interactiveElements = document.querySelectorAll('.cyber-btn, .nav-link, .mobile-link, .glass-card, .sound-toggle');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (el.classList.contains('glass-card') || el.classList.contains('cyber-btn')) {
                playSFX(clickSound);
            } else {
                // minor delay or softer check
                playSFX(clickSound);
            }
        });
    });

    // ----------------------------------------------------------------------
    // 2. Custom Neon Cursor Glow Follower
    // ----------------------------------------------------------------------
    const cursorGlow = document.getElementById('cursor-glow');
    
    // Check if user is on a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        cursorGlow.style.display = 'none';
    } else {
        document.addEventListener('mousemove', (e) => {
            // Use requestAnimationFrame for high performance tracking
            window.requestAnimationFrame(() => {
                cursorGlow.style.left = `${e.clientX}px`;
                cursorGlow.style.top = `${e.clientY}px`;
            });
        });

        // Shrink/grow glow on click
        document.addEventListener('mousedown', () => {
            cursorGlow.style.width = '200px';
            cursorGlow.style.height = '200px';
        });
        document.addEventListener('mouseup', () => {
            cursorGlow.style.width = '300px';
            cursorGlow.style.height = '300px';
        });
    }

    // ----------------------------------------------------------------------
    // 3. High-Performance Canvas Sparks Particle System
    // ----------------------------------------------------------------------
    const canvas = document.getElementById('sparks-canvas');
    const ctx = canvas.getContext('2d');
    
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particles = [];
    const maxParticles = 65; // Balanced, calm density
    
    // Mouse coords for particle repulsion
    let mouse = { x: null, y: null, radius: 140 };
    
    if (!isTouchDevice) {
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        
        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
    }

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height + 20;
            this.size = Math.random() * 2.5 + 0.8;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = -(Math.random() * 0.5 + 0.2); // Calm slow drift upwards
            this.alpha = 0;
            this.targetAlpha = Math.random() * 0.45 + 0.15;
            this.fadeSpeed = Math.random() * 0.01 + 0.005;
            this.waveOffset = Math.random() * 100;
            this.waveSpeed = Math.random() * 0.02 + 0.005;
            this.waveRange = Math.random() * 0.5 + 0.2;
        }

        update() {
            // Drift upwards
            this.y += this.speedY;
            
            // Gentle horizontal sine wave movement
            this.waveOffset += this.waveSpeed;
            this.x += Math.sin(this.waveOffset) * this.waveRange + this.speedX;

            // Fade in/out triggers
            if (this.alpha < this.targetAlpha) {
                this.alpha += this.fadeSpeed;
            }

            // Mouse Repulsion logic
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Move sparks gently away
                    const forceX = (dx / distance) * force * 1.2;
                    const forceY = (dy / distance) * force * 1.2;
                    this.x += forceX;
                    this.y += forceY;
                }
            }

            // Recycle if off-screen top or side bounds
            if (this.y < -20 || this.x < -20 || this.x > width + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            
            // Soft violet glow fill
            ctx.fillStyle = `rgba(124, 58, 237, ${this.alpha})`;
            ctx.shadowBlur = this.size * 5;
            ctx.shadowColor = 'var(--violet)';
            ctx.fill();
            ctx.restore();
        }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    // Canvas animation loop
    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        
        // Redraw dark gradient backdrop
        const grad = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, Math.max(width, height));
        grad.addColorStop(0, '#fdfcff');
        grad.addColorStop(1, '#ede9fe');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Draw HUD ambient lighting overlays in top-right and bottom-left
        ctx.beginPath();
        ctx.arc(width, 0, 400, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(124, 58, 237, 0.04)';
        ctx.filter = 'blur(100px)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, height, 400, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(167, 139, 250, 0.05)';
        ctx.fill();
        ctx.filter = 'none';

        // Update and draw each particle
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();

    // Resize Handler
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // ----------------------------------------------------------------------
    // 4. Automated Typewriter Subtitle Loop
    // ----------------------------------------------------------------------
    const typingText = document.getElementById('typing-text');
    const subtitlePhrases = [
        "Aishwarya L",
        "ECE Student",
        "Embedded Systems Enthusiast",
        "Future Hardware Engineer"
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function handleTypewriter() {
        const currentPhrase = subtitlePhrases[phraseIndex];
        
        if (isDeleting) {
            typingText.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Backspace faster
        } else {
            typingText.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // Normal typing speed
        }

        // Handle boundaries
        if (!isDeleting && charIndex === currentPhrase.length) {
            // Completed typing word, pause
            typingSpeed = 2000; 
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Completed erasing, move to next word
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % subtitlePhrases.length;
            typingSpeed = 500; // Small delay before next word
        }

        setTimeout(handleTypewriter, typingSpeed);
    }
    
    handleTypewriter();

    // ----------------------------------------------------------------------
    // 5. Grid Oscilloscope Telemetry Simulator (TinyML Project 3)
    // ----------------------------------------------------------------------
    const scopeCanvas = document.getElementById('oscilloscope-canvas');
    if (scopeCanvas) {
        const sCtx = scopeCanvas.getContext('2d');
        const sWidth = scopeCanvas.width;
        const sHeight = scopeCanvas.height;
        
        let oscTime = 0;
        let isAnomaly = false;
        let anomalyTimer = 0;
        
        const scopeFreq = document.getElementById('scopeFreq');
        const anomalyAlert = document.getElementById('anomalyAlert');
        const mlConfidence = document.getElementById('mlConfidence');
        const theftStatus = document.getElementById('theftStatus');
        
        // Loop telemetry anomaly states (Every 7 seconds, anomaly triggers for 3 seconds)
        setInterval(() => {
            isAnomaly = true;
            anomalyTimer = Date.now();
            
            // Adjust telemetry values to indicate anomaly
            if (scopeFreq) scopeFreq.textContent = '47.12 Hz';
            if (anomalyAlert) {
                anomalyAlert.textContent = 'WARNING: GRID ANOMALY';
                anomalyAlert.classList.add('anomaly');
            }
            if (mlConfidence) mlConfidence.textContent = '94.2% (Spike)';
            if (theftStatus) {
                theftStatus.textContent = 'FAULT DETECTED';
                theftStatus.classList.add('anomaly');
            }
            
            setTimeout(() => {
                isAnomaly = false;
                if (scopeFreq) scopeFreq.textContent = '50.00 Hz';
                if (anomalyAlert) {
                    anomalyAlert.textContent = 'NORMAL OPERATION';
                    anomalyAlert.classList.remove('anomaly');
                }
                if (mlConfidence) mlConfidence.textContent = '99.8%';
                if (theftStatus) {
                    theftStatus.textContent = 'SECURE';
                    theftStatus.classList.remove('anomaly');
                }
            }, 3000);
        }, 8000);

        function drawOscilloscope() {
            // Dark grid background
            sCtx.fillStyle = '#060609';
            sCtx.fillRect(0, 0, sWidth, sHeight);
            
            // Grid lines drawing (scopes layout)
            sCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            sCtx.lineWidth = 1;
            
            // Vertical divisions
            for (let x = 0; x < sWidth; x += 30) {
                sCtx.beginPath();
                sCtx.moveTo(x, 0);
                sCtx.lineTo(x, sHeight);
                sCtx.stroke();
            }
            // Horizontal divisions
            for (let y = 0; y < sHeight; y += 30) {
                sCtx.beginPath();
                sCtx.moveTo(0, y);
                sCtx.lineTo(sWidth, y);
                sCtx.stroke();
            }
            
            // Central reference line
            sCtx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
            sCtx.beginPath();
            sCtx.moveTo(0, sHeight/2);
            sCtx.lineTo(sWidth, sHeight/2);
            sCtx.stroke();

            // Trace wave rendering
            sCtx.strokeStyle = isAnomaly ? '#ef4444' : 'var(--cyan)';
            sCtx.shadowColor = isAnomaly ? '#ef4444' : 'var(--cyan)';
            sCtx.shadowBlur = 8;
            sCtx.lineWidth = 2.5;
            sCtx.beginPath();
            
            oscTime += 0.15;
            
            for (let x = 0; x < sWidth; x++) {
                let y;
                
                if (isAnomaly) {
                    // Wild, chaotic current distortion representing grid theft and power cuts
                    const sinePrimary = Math.sin(x * 0.06 + oscTime) * 35;
                    const spikeFactor = Math.sin(x * 0.2 + oscTime * 2) * 20 * Math.sin(oscTime);
                    const highFreqNoise = Math.random() * 4 - 2;
                    y = sHeight / 2 + sinePrimary + spikeFactor + highFreqNoise;
                } else {
                    // Elegant, clean alternating current sine wave
                    const primarySine = Math.sin(x * 0.045 + oscTime) * 30;
                    const minorHarmonic = Math.sin(x * 0.09 + oscTime * 2) * 5;
                    const stableHum = Math.sin(x * 0.3) * 0.8;
                    y = sHeight / 2 + primarySine + minorHarmonic + stableHum;
                }
                
                if (x === 0) {
                    sCtx.moveTo(x, y);
                } else {
                    sCtx.lineTo(x, y);
                }
            }
            sCtx.stroke();
            sCtx.shadowBlur = 0; // Reset blur for other operations
            
            requestAnimationFrame(drawOscilloscope);
        }
        
        drawOscilloscope();
    }

    // ----------------------------------------------------------------------
    // 6. Navigation Link Highlighting on Scroll
    // ----------------------------------------------------------------------
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSecId = '';
        
        sections.forEach(sec => {
            const secTop = sec.offsetTop;
            const secHeight = sec.clientHeight;
            // Highlight link if scroll reaches 40% of the section area
            if (window.scrollY >= (secTop - 280)) {
                currentSecId = sec.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSecId}`) {
                link.classList.add('active');
            }
        });
    });

    // ----------------------------------------------------------------------
    // 7. Scroll Reveal Fades Observer
    // ----------------------------------------------------------------------
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Keep observing or unobserve depending on design preference (keep for premium feel)
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));

    // ----------------------------------------------------------------------
    // 8. Mobile Menu Toggle Overlay Interaction
    // ----------------------------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu() {
        menuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
    }

    menuToggle.addEventListener('click', toggleMenu);
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu();
            playSFX(clickSound);
        });
    });

    // ----------------------------------------------------------------------
    // 9. Contact Form Telemetry Serializer Overlay Simulation
    // ----------------------------------------------------------------------
    const contactForm = document.getElementById('contactForm');
    const successOverlay = document.getElementById('successOverlay');
    const successDismiss = document.getElementById('successDismiss');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Trigger transmission process
            playSFX(successSound);
            successOverlay.classList.add('active');

            // Format simulated logs with user's info
            const senderName = document.getElementById('name').value;
            const senderEmail = document.getElementById('email').value;
            const senderMessage = document.getElementById('message').value;

            const logContent = successOverlay.querySelector('.success-log');
            logContent.innerHTML = `> PACKET SERIALIZED SUCCESSFUL.<br>
> SOURCE_IP: 192.168.1.104<br>
> SENDER_TAG: "${senderName.substring(0, 15)}"<br>
> TRANSCIEVER: "${senderEmail}"<br>
> LENGTH: ${senderMessage.length} bytes<br>
> SYNC_TIME: ${new Date().toISOString().slice(0,19)}Z<br>
> PORT: 8080 // TRANSMITTING...<br>
> TELEMETRY: OK (RESP_CODE: 200)`;
            
            // Clear inputs
            contactForm.reset();
        });
    }

    if (successDismiss) {
        successDismiss.addEventListener('click', () => {
            playSFX(clickSound);
            successOverlay.classList.remove('active');
        });
    }

    // ----------------------------------------------------------------------
    // 10. Simulated High-Tech Resume Downloader
    // ----------------------------------------------------------------------
    const resumeBtn = document.getElementById('resumeBtn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            playSFX(downloadSound);
            
            // Dynamic text indicator on button for tech feel
            const btnContent = resumeBtn.querySelector('.btn-content');
            const originalText = btnContent.innerHTML;
            
            btnContent.innerHTML = `<span>⏳ COMPILING CORE_CV.PDF...</span>`;
            resumeBtn.style.pointerEvents = 'none';
            resumeBtn.style.opacity = '0.7';

            setTimeout(() => {
                btnContent.innerHTML = `<span>📥 DOWNLOAD STARTED</span>`;
                
                // Programmatic download
                const dummyLink = document.createElement('a');
                dummyLink.href = '#'; // In real usage, linked to actual pdf
                dummyLink.download = 'Aishwarya_L_ECE_Resume.pdf';
                // Trigger dummy download alert
                alert('Telemetry compiled! Initiating download for Aishwarya_L_ECE_Resume.pdf (Academic Portfolio Profile CV).');
                
                setTimeout(() => {
                    btnContent.innerHTML = originalText;
                    resumeBtn.style.pointerEvents = 'auto';
                    resumeBtn.style.opacity = '1';
                }, 2000);

            }, 1800);
        });
    }
});
