// ===================================
// BROKEN MIRROR PUZZLE - V2
// Shards fit together to form a square
// ===================================

class BrokenMirrorPuzzle {
    constructor() {
        // Configuration
        this.totalPieces = 6;
        this.snapThreshold = 150; // Much larger snap area - easier to place
        this.purchaseURL = 'https://www.samsamplemusic.com/litmab';
        this.mirrorSize = 400; // Square mirror size
        
        // State
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
        this.createBrokenMirror();
        this.setupEventListeners();
        
        setTimeout(() => {
            this.instructions.classList.remove('hidden');
        }, 500);
    }
    
    createBrokenMirror() {
        // Define 6 broken mirror shards that fit together perfectly into a square
        // Each shard has jagged, realistic crack patterns
        const shards = [
            // Shard 1: Top-left large piece
            {
                id: 1,
                path: 'M 0 0 L 220 0 L 215 80 L 225 160 L 218 240 L 110 238 L 115 160 L 105 80 L 0 82 Z',
                viewBox: '0 0 225 240',
                targetX: 0,
                targetY: 0
            },
            // Shard 2: Top-right piece
            {
                id: 2,
                path: 'M 5 0 L 180 0 L 180 82 L 75 80 L 65 160 L 72 238 L 2 240 L 10 160 L 0 80 Z',
                viewBox: '0 0 180 240',
                targetX: 220,
                targetY: 0
            },
            // Shard 3: Middle-left piece
            {
                id: 3,
                path: 'M 0 2 L 110 0 L 115 80 L 105 158 L 0 160 Z',
                viewBox: '0 0 115 160',
                targetX: 0,
                targetY: 238
            },
            // Shard 4: Middle-center piece
            {
                id: 4,
                path: 'M 5 0 L 108 2 L 103 80 L 113 158 L 5 160 L 0 80 Z',
                viewBox: '0 0 113 160',
                targetX: 105,
                targetY: 238
            },
            // Shard 5: Middle-right piece
            {
                id: 5,
                path: 'M 2 0 L 110 2 L 110 160 L 0 158 L 10 80 Z',
                viewBox: '0 0 110 160',
                targetX: 218,
                targetY: 238
            },
            // Shard 6: Bottom piece
            {
                id: 6,
                path: 'M 0 0 L 400 2 L 400 82 L 0 80 Z',
                viewBox: '0 0 400 82',
                targetX: 0,
                targetY: 398
            }
        ];
        
        shards.forEach(shard => {
            const piece = this.createShard(shard);
            this.pieces.push(piece);
            this.piecesArea.appendChild(piece.element);
        });
        
        this.shufflePieces();
    }
    
    createShard(shard) {
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'mirror-shard';
        pieceDiv.dataset.piece = shard.id;
        pieceDiv.setAttribute('tabindex', '0');
        
        // Create SVG with realistic mirror effect
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', shard.viewBox);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.style.width = '100%';
        svg.style.height = '100%';
        
        // Create defs for gradients and effects
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Silver mirror gradient
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', `mirror-grad-${shard.id}`);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const stops = [
            { offset: '0%', color: '#ffffff', opacity: '1' },
            { offset: '20%', color: '#f5f5f5', opacity: '1' },
            { offset: '40%', color: '#e0e0e0', opacity: '1' },
            { offset: '60%', color: '#f8f8f8', opacity: '1' },
            { offset: '80%', color: '#d8d8d8', opacity: '1' },
            { offset: '100%', color: '#f0f0f0', opacity: '1' }
        ];
        
        stops.forEach(s => {
            const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop.setAttribute('offset', s.offset);
            stop.setAttribute('style', `stop-color:${s.color};stop-opacity:${s.opacity}`);
            gradient.appendChild(stop);
        });
        
        defs.appendChild(gradient);
        
        // Add filter for glass effect
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', `glass-${shard.id}`);
        
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'SourceAlpha');
        feGaussianBlur.setAttribute('stdDeviation', '2');
        filter.appendChild(feGaussianBlur);
        
        defs.appendChild(filter);
        svg.appendChild(defs);
        
        // Create the shard path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', shard.path);
        path.setAttribute('fill', `url(#mirror-grad-${shard.id})`);
        path.setAttribute('stroke', '#ffffff');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('filter', 'drop-shadow(0px 4px 8px rgba(0,0,0,0.4))');
        
        svg.appendChild(path);
        pieceDiv.appendChild(svg);
        
        // Store piece data
        const pieceData = {
            id: shard.id,
            element: pieceDiv,
            targetX: shard.targetX,
            targetY: shard.targetY,
            placed: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0
        };
        
        this.addPieceListeners(pieceData);
        
        return pieceData;
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
        piece.startX = clientX - rect.left;
        piece.startY = clientY - rect.top;
        
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
        
        piece.currentX = clientX - piece.startX;
        piece.currentY = clientY - piece.startY;
        
        piece.element.style.position = 'fixed';
        piece.element.style.left = piece.currentX + 'px';
        piece.element.style.top = piece.currentY + 'px';
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
        
        // Calculate target position
        const targetX = targetRect.left + piece.targetX;
        const targetY = targetRect.top + piece.targetY;
        
        const pieceCenterX = pieceRect.left + pieceRect.width / 2;
        const pieceCenterY = pieceRect.top + pieceRect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(pieceCenterX - (targetX + pieceRect.width / 2), 2) +
            Math.pow(pieceCenterY - (targetY + pieceRect.height / 2), 2)
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
        
        const targetRect = this.targetArea.getBoundingClientRect();
        
        piece.element.style.position = 'absolute';
        piece.element.style.left = piece.targetX + 'px';
        piece.element.style.top = piece.targetY + 'px';
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
        this.revealedContent.classList.add('visible');
        
        setTimeout(() => {
            this.completionOverlay.classList.remove('hidden');
        }, 1500);
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
        this.targetArea.style.outline = '3px solid rgba(74, 158, 255, 0.8)';
        setTimeout(() => {
            this.targetArea.style.outline = '';
        }, 2000);
    }
    
    resetPuzzle() {
        this.placedCount = 0;
        this.updateProgress();
        
        this.pieces.forEach(piece => {
            piece.placed = false;
            piece.element.classList.remove('placed');
            piece.element.style.position = 'relative';
            piece.element.style.left = '0';
            piece.element.style.top = '0';
            piece.element.style.zIndex = '1';
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
    const puzzle = new BrokenMirrorPuzzle();
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
    if (e.target.closest('.mirror-shard')) {
        e.preventDefault();
    }
});

// Made with Bob
