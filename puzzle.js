// ===================================
// MIRROR PUZZLE - MAIN JAVASCRIPT
// ===================================

class MirrorPuzzle {
    constructor() {
        // Configuration
        this.totalPieces = 6;
        this.snapThreshold = 50; // pixels
        this.purchaseURL = 'https://www.samsamplemusic.com/litmab';
        
        // State
        this.pieces = [];
        this.placedCount = 0;
        this.isDragging = false;
        this.currentPiece = null;
        this.hintShown = false;
        
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
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set total pieces display
        this.totalPiecesEl.textContent = this.totalPieces;
        
        // Set purchase URL
        this.unlockButton.href = this.purchaseURL;
        
        // Create mirror pieces
        this.createMirrorPieces();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show instructions initially
        setTimeout(() => {
            this.instructions.classList.remove('hidden');
        }, 500);
    }
    
    createMirrorPieces() {
        // Define mirror shard shapes (SVG paths)
        const shardPaths = [
            // Piece 1 - Top shard
            'M60,10 L90,30 L80,70 L40,70 L30,30 Z',
            // Piece 2 - Top-right shard
            'M70,20 L110,40 L100,80 L60,70 Z',
            // Piece 3 - Bottom-right shard
            'M100,50 L110,90 L70,100 L60,60 Z',
            // Piece 4 - Bottom shard
            'M40,70 L80,70 L90,110 L30,110 Z',
            // Piece 5 - Bottom-left shard
            'M20,60 L60,70 L50,110 L10,90 Z',
            // Piece 6 - Top-left shard
            'M20,20 L60,30 L50,70 L10,50 Z'
        ];
        
        // Create each piece
        for (let i = 0; i < this.totalPieces; i++) {
            const piece = this.createPiece(i + 1, shardPaths[i]);
            this.pieces.push(piece);
            this.piecesArea.appendChild(piece.element);
        }
        
        // Shuffle pieces
        this.shufflePieces();
    }
    
    createPiece(id, path) {
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'mirror-piece';
        pieceDiv.dataset.piece = id;
        pieceDiv.setAttribute('tabindex', '0');
        pieceDiv.setAttribute('role', 'button');
        pieceDiv.setAttribute('aria-label', `Mirror piece ${id}`);
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 120 120');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        // Create gradient definitions
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Normal gradient
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', `mirrorGradient-${id}`);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('style', 'stop-color:#e0e0e0;stop-opacity:0.9');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '50%');
        stop2.setAttribute('style', 'stop-color:#ffffff;stop-opacity:0.95');
        
        const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop3.setAttribute('offset', '100%');
        stop3.setAttribute('style', 'stop-color:#c0c0c0;stop-opacity:0.9');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        gradient.appendChild(stop3);
        
        // Hover gradient
        const gradientHover = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradientHover.setAttribute('id', `mirrorGradientHover-${id}`);
        gradientHover.setAttribute('x1', '0%');
        gradientHover.setAttribute('y1', '0%');
        gradientHover.setAttribute('x2', '100%');
        gradientHover.setAttribute('y2', '100%');
        
        const stopH1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stopH1.setAttribute('offset', '0%');
        stopH1.setAttribute('style', 'stop-color:#f0f0f0;stop-opacity:1');
        
        const stopH2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stopH2.setAttribute('offset', '50%');
        stopH2.setAttribute('style', 'stop-color:#ffffff;stop-opacity:1');
        
        const stopH3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stopH3.setAttribute('offset', '100%');
        stopH3.setAttribute('style', 'stop-color:#d0d0d0;stop-opacity:1');
        
        gradientHover.appendChild(stopH1);
        gradientHover.appendChild(stopH2);
        gradientHover.appendChild(stopH3);
        
        defs.appendChild(gradient);
        defs.appendChild(gradientHover);
        svg.appendChild(defs);
        
        // Create path
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', path);
        pathElement.setAttribute('class', 'mirror-shard');
        pathElement.setAttribute('fill', `url(#mirrorGradient-${id})`);
        
        svg.appendChild(pathElement);
        pieceDiv.appendChild(svg);
        
        // Store piece data
        const pieceData = {
            id: id,
            element: pieceDiv,
            placed: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0
        };
        
        // Add event listeners
        this.addPieceListeners(pieceData);
        
        return pieceData;
    }
    
    addPieceListeners(piece) {
        const element = piece.element;
        
        // Mouse events
        element.addEventListener('mousedown', (e) => this.onDragStart(e, piece));
        
        // Touch events
        element.addEventListener('touchstart', (e) => this.onDragStart(e, piece), { passive: false });
        
        // Keyboard events
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.onPieceClick(piece);
            }
        });
    }
    
    onDragStart(e, piece) {
        if (piece.placed) return;
        
        e.preventDefault();
        
        this.isDragging = true;
        this.currentPiece = piece;
        
        piece.element.classList.add('dragging');
        
        // Get initial position
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        const rect = piece.element.getBoundingClientRect();
        piece.startX = clientX - rect.left;
        piece.startY = clientY - rect.top;
        
        // Add move and end listeners
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
        
        // Calculate new position
        piece.currentX = clientX - piece.startX;
        piece.currentY = clientY - piece.startY;
        
        // Apply transform
        piece.element.style.position = 'fixed';
        piece.element.style.left = piece.currentX + 'px';
        piece.element.style.top = piece.currentY + 'px';
        piece.element.style.zIndex = '1000';
    }
    
    onDragEnd = (e) => {
        if (!this.isDragging || !this.currentPiece) return;
        
        const piece = this.currentPiece;
        piece.element.classList.remove('dragging');
        
        // Check if piece is near its target
        this.checkPlacement(piece);
        
        // Cleanup
        this.isDragging = false;
        this.currentPiece = null;
        
        // Remove listeners
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragEnd);
        document.removeEventListener('touchmove', this.onDragMove);
        document.removeEventListener('touchend', this.onDragEnd);
    }
    
    checkPlacement(piece) {
        const pieceRect = piece.element.getBoundingClientRect();
        const targetSlot = document.querySelector(`.target-slot[data-piece="${piece.id}"]`);
        const targetRect = targetSlot.getBoundingClientRect();
        
        // Calculate distance between piece center and target center
        const pieceCenterX = pieceRect.left + pieceRect.width / 2;
        const pieceCenterY = pieceRect.top + pieceRect.height / 2;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(pieceCenterX - targetCenterX, 2) +
            Math.pow(pieceCenterY - targetCenterY, 2)
        );
        
        if (distance < this.snapThreshold) {
            // Snap to position
            this.snapPiece(piece, targetSlot);
        } else {
            // Return to pieces area
            this.returnPiece(piece);
        }
    }
    
    snapPiece(piece, targetSlot) {
        piece.placed = true;
        piece.element.classList.add('placed');
        
        // Position piece at target
        const targetRect = targetSlot.getBoundingClientRect();
        piece.element.style.position = 'absolute';
        piece.element.style.left = targetRect.left + 'px';
        piece.element.style.top = targetRect.top + 'px';
        piece.element.style.zIndex = '100';
        
        // Move to target area
        this.targetArea.appendChild(piece.element);
        
        // Update count
        this.placedCount++;
        this.updateProgress();
        
        // Play snap sound (if available)
        this.playSound('snap');
        
        // Check if puzzle is complete
        if (this.placedCount === this.totalPieces) {
            setTimeout(() => this.onPuzzleComplete(), 500);
        }
    }
    
    returnPiece(piece) {
        // Reset position
        piece.element.style.position = 'relative';
        piece.element.style.left = '0';
        piece.element.style.top = '0';
        piece.element.style.zIndex = '1';
    }
    
    updateProgress() {
        this.piecesPlacedEl.textContent = this.placedCount;
        
        // Animate progress
        this.piecesPlacedEl.style.transform = 'scale(1.3)';
        setTimeout(() => {
            this.piecesPlacedEl.style.transform = 'scale(1)';
        }, 200);
    }
    
    onPuzzleComplete() {
        // Add complete class to target area
        this.targetArea.classList.add('complete');
        
        // Show revealed content
        this.revealedContent.classList.add('visible');
        
        // Play completion sound
        this.playSound('complete');
        
        // Show completion overlay
        setTimeout(() => {
            this.completionOverlay.classList.remove('hidden');
        }, 1500);
    }
    
    shufflePieces() {
        // Fisher-Yates shuffle
        const elements = Array.from(this.piecesArea.children);
        for (let i = elements.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            this.piecesArea.appendChild(elements[j]);
        }
    }
    
    onPieceClick(piece) {
        // For keyboard/accessibility - auto-place piece
        if (!piece.placed) {
            const targetSlot = document.querySelector(`.target-slot[data-piece="${piece.id}"]`);
            this.snapPiece(piece, targetSlot);
        }
    }
    
    setupEventListeners() {
        // Close instructions
        const closeBtn = this.instructions.querySelector('.close-instructions');
        closeBtn.addEventListener('click', () => {
            this.instructions.classList.add('hidden');
        });
        
        // Hint button
        this.hintButton.addEventListener('click', () => this.showHint());
        
        // Reset button
        this.resetButton.addEventListener('click', () => this.resetPuzzle());
        
        // Prevent default drag behavior
        document.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    showHint() {
        if (this.hintShown) return;
        
        this.hintShown = true;
        this.hintButton.classList.add('active');
        
        // Highlight target slots briefly
        const slots = document.querySelectorAll('.target-slot');
        slots.forEach(slot => {
            slot.style.border = '2px dashed rgba(74, 158, 255, 0.6)';
            slot.style.background = 'rgba(74, 158, 255, 0.1)';
        });
        
        setTimeout(() => {
            slots.forEach(slot => {
                slot.style.border = '';
                slot.style.background = '';
            });
            this.hintButton.classList.remove('active');
        }, 3000);
    }
    
    resetPuzzle() {
        // Reset state
        this.placedCount = 0;
        this.updateProgress();
        
        // Reset pieces
        this.pieces.forEach(piece => {
            piece.placed = false;
            piece.element.classList.remove('placed');
            piece.element.style.position = 'relative';
            piece.element.style.left = '0';
            piece.element.style.top = '0';
            piece.element.style.zIndex = '1';
            this.piecesArea.appendChild(piece.element);
        });
        
        // Shuffle pieces
        this.shufflePieces();
        
        // Reset UI
        this.targetArea.classList.remove('complete');
        this.revealedContent.classList.remove('visible');
        this.completionOverlay.classList.add('hidden');
        this.hintShown = false;
    }
    
    playSound(type) {
        // Optional: Add sound effects
        // You can add audio files and play them here
        // Example:
        // const audio = new Audio(`assets/sounds/${type}.mp3`);
        // audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

// ===================================
// INITIALIZE PUZZLE
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    const puzzle = new MirrorPuzzle();
    
    // Make puzzle accessible globally for debugging
    window.mirrorPuzzle = puzzle;
});

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Prevent zoom on double-tap (mobile)
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Prevent context menu on long press (mobile)
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.mirror-piece')) {
        e.preventDefault();
    }
});

// Made with Bob
