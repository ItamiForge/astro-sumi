#!/bin/bash
# resize-web-images.sh
# Resize an input image into multiple web icon sizes using ImageMagick
# Usage: ./resize-web-images.sh input.png

# Exit on error
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 input-image"
  exit 1
fi

INPUT="$1"
BASENAME=$(basename "$INPUT")
NAME="${BASENAME%.*}"
EXT="${BASENAME##*.}"

# Define the sizes you want (add or remove as needed)
SIZES=(192 512)

echo "Resizing $INPUT into multiple sizes..."

for SIZE in "${SIZES[@]}"; do
  OUTFILE="web-app-manifest-${SIZE}x${SIZE}.${EXT}"
  magick "$INPUT" -resize "${SIZE}x${SIZE}" "$OUTFILE"
  echo "✅ Created $OUTFILE"
done

echo "🎉 Done! All resized images are in the '$OUTPUT_DIR' folder."
