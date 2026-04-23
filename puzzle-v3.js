// ===================================
// SIMPLE BROKEN MIRROR PUZZLE - V3
// Easy to use, clear visual feedback
// ===================================

class SimpleMirrorPuzzle {
    constructor() {
        this.totalPieces = 6;
        this.snapThreshold = 200; // Very forgiving
        this.purchaseURL = 'https://www.samsamplemusic.com/litmab';
        
        this.pieces = [];
        this.placedCount = 0;
        this.isDragging = false;
        this.currentPiece = null;
        
        // DOM Elements
        this.piecesArea = document.getElementById('pieces-area');
        this.targetArea = document.getElementById('target-area');
        this.completionOverlay = document.getElementById('completion-overlay');
        this.revealedContent = document.getElementById('revealed-content');
        this.unlockButton = document.getElementById('unlock-button');
        this.resetButton = document.getElementById('reset-button');
        this.hintButton = document.getElementById('hint-button');
        this.instructions = document.getElementById('instructions');
        this.piecesPlacedEl = document.getElementById('pieces-placed');
        this.totalPiecesEl = document.getElementById('total-pieces');
        
        this.init();
    }
    
    init() {
        this.totalPiecesEl.textContent = this.totalPieces;
        this.unlockButton.href = this.purchaseURL;
        this.createSimplePuzzle();
        this.setupEventListeners();
        
        setTimeout(() => {
            this.instructions.classList.remove('hidden');
        }, 500);
    }
    
    createSimplePuzzle() {
        // 6 broken mirror shards that fit together perfectly to form a 400x400px square
        // NO GAPS - Complete coverage
        const pieces = [
            // Top-left large shard (covers full left side of top half)
            {
                id: 1,
                path: 'M0,0 L200,0 L195,50 L200,100 L195,150 L200,200 L0,200 Z',
                viewBox: '0 0 200 200',
                targetX: 0,
                targetY: 0
            },
            // Top-right shard (covers right side of top half)
            {
                id: 2,
                path: 'M0,0 L200,0 L200,200 L5,200 L0,150 L5,100 L0,50 Z',
                viewBox: '0 0 200 200',
                targetX: 200,
                targetY: 0
            },
            // Middle-left shard
            {
                id: 3,
                path: 'M0,0 L130,0 L135,50 L130,100 L0,100 Z',
                viewBox: '0 0 135 100',
                targetX: 0,
                targetY: 200
            },
            // Middle-center shard
            {
                id: 4,
                path: 'M0,0 L135,0 L135,100 L0,100 Z',
                viewBox: '0 0 135 100',
                targetX: 130,
                targetY: 200
            },
            // Middle-right shard
            {
                id: 5,
                path: 'M0,0 L135,0 L135,100 L5,100 L0,50 Z',
                viewBox: '0 0 135 100',
                targetX: 265,
                targetY: 200
            },
            // Bottom shard (full width)
            {
                id: 6,
                path: 'M0,0 L400,0 L400,100 L0,100 Z',
                viewBox: '0 0 400 100',
                targetX: 0,
                targetY: 300
            }
        ];
        
        pieces.forEach(pieceData => {
            const piece = this.createPiece(pieceData);
            this.pieces.push(piece);
            this.piecesArea.appendChild(piece.element);
        });
        
        this.shufflePieces();
    }
    
    createPiece(data) {
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'puzzle-piece';
        pieceDiv.dataset.piece = data.id;
        
        // Use provided target positions
        const targetX = data.targetX;
        const targetY = data.targetY;
        
        // Create SVG with provided viewBox
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', data.viewBox);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.style.width = '100%';
        svg.style.height = '100%';
        
        // Create gradient
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', `grad-${data.id}`);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const stops = [
            { offset: '0%', color: '#ffffff' },
            { offset: '25%', color: '#f5f5f5' },
            { offset: '50%', color: '#e8e8e8' },
            { offset: '75%', color: '#f0f0f0' },
            { offset: '100%', color: '#e0e0e0' }
        ];
        
        stops.forEach(s => {
            const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop.setAttribute('offset', s.offset);
            stop.setAttribute('style', `stop-color:${s.color};stop-opacity:1`);
            gradient.appendChild(stop);
        });
        
        defs.appendChild(gradient);
        svg.appendChild(defs);
        
        // Create path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', data.path);
        path.setAttribute('fill', `url(#grad-${data.id})`);
        path.setAttribute('stroke', '#ffffff');
        path.setAttribute('stroke-width', '3');
        
        svg.appendChild(path);
        pieceDiv.appendChild(svg);
        
        // Store piece data
        const pieceObj = {
            id: data.id,
            element: pieceDiv,
            targetX: targetX,
            targetY: targetY,
            placed: false
        };
        
        this.addPieceListeners(pieceObj);
        
        return pieceObj;
    }
    
    addPieceListeners(piece) {
        const element = piece.element;
        
        element.addEventListener('mousedown', (e) => this.onDragStart(e, piece));
        element.addEventListener('touchstart', (e) => this.onDragStart(e, piece), { passive: false });
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.snapPiece(piece);
            }
        });
    }
    
    onDragStart(e, piece) {
        if (piece.placed) return;
        
        e.preventDefault();
        
        this.isDragging = true;
        this.currentPiece = piece;
        
        piece.element.classList.add('dragging');
        
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        const rect = piece.element.getBoundingClientRect();
        piece.offsetX = clientX - rect.left;
        piece.offsetY = clientY - rect.top;
        
        document.addEventListener('mousemove', this.onDragMove);
        document.addEventListener('mouseup', this.onDragEnd);
        document.addEventListener('touchmove', this.onDragMove, { passive: false });
        document.addEventListener('touchend', this.onDragEnd);
    }
    
    onDragMove = (e) => {
        if (!this.isDragging || !this.currentPiece) return;
        
        e.preventDefault();
        
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        const piece = this.currentPiece;
        
        piece.element.style.position = 'fixed';
        piece.element.style.left = (clientX - piece.offsetX) + 'px';
        piece.element.style.top = (clientY - piece.offsetY) + 'px';
        piece.element.style.zIndex = '1000';
    }
    
    onDragEnd = (e) => {
        if (!this.isDragging || !this.currentPiece) return;
        
        const piece = this.currentPiece;
        piece.element.classList.remove('dragging');
        
        this.checkPlacement(piece);
        
        this.isDragging = false;
        this.currentPiece = null;
        
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragEnd);
        document.removeEventListener('touchmove', this.onDragMove);
        document.removeEventListener('touchend', this.onDragEnd);
    }
    
    checkPlacement(piece) {
        const pieceRect = piece.element.getBoundingClientRect();
        const targetRect = this.targetArea.getBoundingClientRect();
        
        // Check if piece is anywhere near the target area
        const pieceCenterX = pieceRect.left + pieceRect.width / 2;
        const pieceCenterY = pieceRect.top + pieceRect.height / 2;
        
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(pieceCenterX - targetCenterX, 2) +
            Math.pow(pieceCenterY - targetCenterY, 2)
        );
        
        if (distance < this.snapThreshold) {
            this.snapPiece(piece);
        } else {
            this.returnPiece(piece);
        }
    }
    
    snapPiece(piece) {
        piece.placed = true;
        piece.element.classList.add('placed');
        piece.element.classList.remove('dragging');
        
        // Position piece at exact target location
        piece.element.style.position = 'absolute';
        piece.element.style.left = piece.targetX + 'px';
        piece.element.style.top = piece.targetY + 'px';
        
        // Set size based on redesigned shard dimensions (NO GAPS)
        if (piece.id === 1) {
            piece.element.style.width = '200px';
            piece.element.style.height = '200px';
        } else if (piece.id === 2) {
            piece.element.style.width = '200px';
            piece.element.style.height = '200px';
        } else if (piece.id === 3) {
            piece.element.style.width = '130px';
            piece.element.style.height = '100px';
        } else if (piece.id === 4) {
            piece.element.style.width = '135px';
            piece.element.style.height = '100px';
        } else if (piece.id === 5) {
            piece.element.style.width = '135px';
            piece.element.style.height = '100px';
        } else if (piece.id === 6) {
            piece.element.style.width = '400px';
            piece.element.style.height = '100px';
        }
        
        piece.element.style.zIndex = '100';
        
        this.targetArea.appendChild(piece.element);
        
        this.placedCount++;
        this.updateProgress();
        
        if (this.placedCount === this.totalPieces) {
            setTimeout(() => this.onPuzzleComplete(), 800);
        }
    }
    
    returnPiece(piece) {
        piece.element.style.position = 'relative';
        piece.element.style.left = '0';
        piece.element.style.top = '0';
        piece.element.style.width = '120px';
        piece.element.style.height = '120px';
        piece.element.style.zIndex = '1';
    }
    
    updateProgress() {
        this.piecesPlacedEl.textContent = this.placedCount;
        this.piecesPlacedEl.style.transform = 'scale(1.3)';
        setTimeout(() => {
            this.piecesPlacedEl.style.transform = 'scale(1)';
        }, 200);
    }
    
    onPuzzleComplete() {
        this.targetArea.classList.add('complete');
        
        // Play glass breaking sound
        this.playShatterSound();
        
        // VIOLENT shatter effect - each piece breaks into smaller shards
        setTimeout(() => {
            this.pieces.forEach((piece, index) => {
                // Create 4-6 smaller shards from each piece
                const shardCount = 4 + Math.floor(Math.random() * 3);
                
                for (let i = 0; i < shardCount; i++) {
                    const shard = this.createShard(piece.element, i, shardCount);
                    this.targetArea.appendChild(shard);
                }
                
                // Hide original piece immediately
                piece.element.style.opacity = '0';
                piece.element.style.transition = 'opacity 0.1s';
            });
            
            // Show album art after pieces start shattering
            setTimeout(() => {
                this.revealedContent.classList.add('visible');
            }, 200);
            
            // Show completion overlay
            setTimeout(() => {
                this.completionOverlay.classList.remove('hidden');
            }, 1500);
        }, 100);
    }
    
    createShard(originalPiece, shardIndex, totalShards) {
        const shard = document.createElement('div');
        shard.className = 'glass-shard';
        
        // Get original piece position
        const rect = originalPiece.getBoundingClientRect();
        const targetRect = this.targetArea.getBoundingClientRect();
        
        // Create jagged shard shape
        const size = 20 + Math.random() * 40;
        shard.style.width = size + 'px';
        shard.style.height = size + 'px';
        shard.style.position = 'absolute';
        shard.style.left = (rect.left - targetRect.left + Math.random() * rect.width) + 'px';
        shard.style.top = (rect.top - targetRect.top + Math.random() * rect.height) + 'px';
        
        // Create jagged SVG shard
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.style.width = '100%';
        svg.style.height = '100%';
        
        // Create jagged polygon path
        const points = [];
        const numPoints = 5 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const radius = 30 + Math.random() * 40;
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            points.push(`${x},${y}`);
        }
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', points.join(' '));
        polygon.setAttribute('fill', 'url(#shard-grad)');
        polygon.setAttribute('stroke', '#ffffff');
        polygon.setAttribute('stroke-width', '2');
        
        // Add gradient
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'shard-grad');
        gradient.innerHTML = `
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
            <stop offset="50%" style="stop-color:#e8e8e8;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#d0d0d0;stop-opacity:0.7" />
        `;
        defs.appendChild(gradient);
        svg.appendChild(defs);
        svg.appendChild(polygon);
        shard.appendChild(svg);
        
        // Apply violent explosion effect
        const angle = Math.random() * Math.PI * 2;
        const distance = 400 + Math.random() * 600;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const rotation = Math.random() * 1440 - 720;
        
        shard.style.filter = 'drop-shadow(0 0 10px rgba(255,255,255,0.8))';
        shard.style.zIndex = '200';
        
        // Animate shard explosion
        setTimeout(() => {
            shard.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            shard.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotation}deg) scale(0.1)`;
            shard.style.opacity = '0';
        }, 50);
        
        return shard;
    }
    
    playShatterSound() {
        // Create audio context for glass breaking sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create multiple overlapping sounds for realistic glass break
        const now = audioContext.currentTime;
        
        // Main crash sound
        for (let i = 0; i < 8; i++) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Random frequencies for chaotic glass sound
            oscillator.frequency.value = 800 + Math.random() * 2000;
            oscillator.type = 'square';
            
            // Sharp attack, quick decay
            gainNode.gain.setValueAtTime(0.3, now + i * 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.02 + 0.3);
            
            oscillator.start(now + i * 0.02);
            oscillator.stop(now + i * 0.02 + 0.3);
        }
        
        // Add white noise for realistic shatter
        const bufferSize = audioContext.sampleRate * 0.5;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = audioContext.createBufferSource();
        const noiseGain = audioContext.createGain();
        
        noise.buffer = buffer;
        noise.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        noise.start(now);
        noise.stop(now + 0.5);
    }
    
    shufflePieces() {
        const elements = Array.from(this.piecesArea.children);
        for (let i = elements.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            this.piecesArea.appendChild(elements[j]);
        }
    }
    
    setupEventListeners() {
        const closeBtn = this.instructions.querySelector('.close-instructions');
        closeBtn.addEventListener('click', () => {
            this.instructions.classList.add('hidden');
        });
        
        this.hintButton.addEventListener('click', () => this.showHint());
        this.resetButton.addEventListener('click', () => this.resetPuzzle());
        
        document.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    showHint() {
        this.targetArea.style.outline = '4px solid rgba(74, 158, 255, 0.9)';
        this.targetArea.style.outlineOffset = '4px';
        setTimeout(() => {
            this.targetArea.style.outline = '';
            this.targetArea.style.outlineOffset = '';
        }, 3000);
    }
    
    resetPuzzle() {
        this.placedCount = 0;
        this.updateProgress();
        
        // Remove all glass shards
        const shards = this.targetArea.querySelectorAll('.glass-shard');
        shards.forEach(shard => shard.remove());
        
        // Reset all pieces
        this.pieces.forEach(piece => {
            piece.placed = false;
            piece.element.classList.remove('placed');
            piece.element.style.position = 'relative';
            piece.element.style.left = '0';
            piece.element.style.top = '0';
            piece.element.style.width = '120px';
            piece.element.style.height = '120px';
            piece.element.style.zIndex = '1';
            piece.element.style.opacity = '1';
            piece.element.style.transform = '';
            piece.element.style.transition = '';
            this.piecesArea.appendChild(piece.element);
        });
        
        this.shufflePieces();
        this.targetArea.classList.remove('complete');
        this.revealedContent.classList.remove('visible');
        this.completionOverlay.classList.add('hidden');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const puzzle = new SimpleMirrorPuzzle();
    window.mirrorPuzzle = puzzle;
});

// Prevent zoom on mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.puzzle-piece')) {
        e.preventDefault();
    }
});

// Made with Bob
