# Fonts

This directory contains all custom fonts used in the site.

## Structure

```text
fonts/
├── geist/
│   ├── geist.woff2           # Geist Sans (variable font, 55KB)
│   └── geist-mono.woff2      # Geist Mono for code (variable font, 57KB)
├── noto-sans/
│   ├── noto-sans.woff2       # Noto Sans (variable font, subset, 190KB)
│   └── noto-sans-italic.woff2 # Noto Sans Italic (variable font, subset, 213KB)
└── messy-handwritten/
    └── messy-handwritten.ttf  # Messy Handwritten (16KB)
```

## Font Details

### Geist (Default)
* **Type**: Variable font (woff2)
* **Usage**: Main UI font
* **Weights**: 100-900
* **Always loaded**: Used for code blocks (Geist Mono)

### Noto Sans
* **Type**: Variable font (woff2), subset for novel writing
* **Usage**: Optional reading font
* **Weights**: 100-900
* **Character set**: Latin, Latin Extended, punctuation, symbols
* **Includes**: Accented characters, em-dashes, quotes, ellipses, currency symbols

### Messy Handwritten
* **Type**: Static font (ttf)
* **Usage**: Optional decorative font
* **Weight**: Regular only

## Optimization

All fonts are optimized for web delivery:
* Variable fonts use woff2 format (best compression)
* Noto Sans is subset to include only characters needed for novel writing
* Total font size: ~588KB (down from 50MB original)

## Adding New Fonts

1. Create a new folder: `public/fonts/font-name/`
2. Add font files with lowercase-kebab-case naming
3. Update `src/consts.ts` FONTS configuration
4. For large fonts, consider subsetting with fonttools
