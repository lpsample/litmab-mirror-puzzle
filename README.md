# Interactive Mirror Puzzle

An engaging puzzle where visitors piece together broken mirror shards to unlock access to your album.

## 🚀 Quick Setup

### 1. Add Your Album Artwork
- Place your album cover in `assets/album-art.jpg`
- Recommended: 800x800px square image

### 2. Test Locally
- Open `index.html` in your browser
- Drag pieces to complete the puzzle
- The purchase URL is already set to: https://www.samsamplemusic.com/litmab

## 🌐 Deploy to Squarespace

### Option A: GitHub Pages (Free & Easy)

1. **Create GitHub repository:**
```bash
cd mirror-puzzle
git init
git add .
git commit -m "Mirror puzzle"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/mirror-puzzle.git
git push -u origin main
```

2. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Select "main" branch → Save
   - Your URL: `https://YOUR-USERNAME.github.io/mirror-puzzle/`

3. **Embed in Squarespace:**
   - Add a Code Block to your page
   - Paste:
```html
<iframe 
    src="https://YOUR-USERNAME.github.io/mirror-puzzle/"
    width="100%" 
    height="900px"
    style="border:none; display:block;">
</iframe>
```

### Option B: Netlify (Alternative Free Hosting)

1. Drag the `mirror-puzzle` folder to [Netlify Drop](https://app.netlify.com/drop)
2. Get your URL (e.g., `https://random-name.netlify.app`)
3. Use the same iframe code above with your Netlify URL

## 🎨 Customization

**Change text:** Edit `index.html`
- Line 18: Title
- Line 19: Subtitle  
- Line 56-57: Completion message
- Line 59: Button text

**Change colors:** Edit `styles.css`
- Search for `#4a9eff` (blue accent) and replace with your color

**Adjust difficulty:** Edit `puzzle.js`
- Line 9: Change `totalPieces` (6 is optimal)
- Line 10: Change `snapThreshold` (50 = medium difficulty)

## 📱 Features

✅ Drag-and-drop (desktop) & touch (mobile)
✅ Fully responsive design
✅ Keyboard accessible
✅ Progress indicator
✅ Hint system
✅ Reset/replay button
✅ No dependencies

## 🐛 Troubleshooting

**Album image not showing?**
- Verify `assets/album-art.jpg` exists
- Check the path in `index.html` line 42

**Pieces won't drag?**
- Check browser console (F12) for errors
- Try a different browser
- Ensure JavaScript is enabled

**Mobile issues?**
- Test on actual device, not just browser resize
- Clear cache and reload

## 📊 File Structure

```
mirror-puzzle/
├── index.html       # Main page
├── styles.css       # All styling
├── puzzle.js        # Puzzle logic
├── README.md        # This file
└── assets/
    ├── album-art.jpg    # Your album cover (ADD THIS)
    └── sounds/          # Optional sound effects
```

## 🎵 Tips

- Keep it at 6 pieces for best conversion rate
- Test on multiple devices before launch
- Use a high-quality album image
- Consider adding your own sound effects in `assets/sounds/`

---

**Ready to launch!** Add your album artwork and deploy. 🚀
