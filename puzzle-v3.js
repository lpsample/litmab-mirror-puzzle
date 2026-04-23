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
        
        this.pieces.forEach(piece => {
            piece.placed = false;
            piece.element.classList.remove('placed');
            piece.element.style.position = 'relative';
            piece.element.style.left = '0';
            piece.element.style.top = '0';
            piece.element.style.width = '120px';
            piece.element.style.height = '120px';
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
