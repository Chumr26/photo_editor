import { ColorBalance } from '../store/editorStore';

export const applySharpen = (ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) => {
  if (amount === 0) return;
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  
  // Create output buffer
  const output = new Uint8ClampedArray(pixels);
  
  // Sharpen kernel (convolution matrix)
  // Amount scales the effect
  const divisor = amount / 25; // Scale 0-100 to reasonable values
  const kernel = [
    0, -divisor, 0,
    -divisor, 1 + 4 * divisor, -divisor,
    0, -divisor, 0
  ];
  
  // Apply convolution
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB channels only, skip alpha
        let sum = 0;
        
        // Apply kernel
        sum += pixels[((y - 1) * width + (x - 1)) * 4 + c] * kernel[0];
        sum += pixels[((y - 1) * width + x) * 4 + c] * kernel[1];
        sum += pixels[((y - 1) * width + (x + 1)) * 4 + c] * kernel[2];
        sum += pixels[(y * width + (x - 1)) * 4 + c] * kernel[3];
        sum += pixels[(y * width + x) * 4 + c] * kernel[4];
        sum += pixels[(y * width + (x + 1)) * 4 + c] * kernel[5];
        sum += pixels[((y + 1) * width + (x - 1)) * 4 + c] * kernel[6];
        sum += pixels[((y + 1) * width + x) * 4 + c] * kernel[7];
        sum += pixels[((y + 1) * width + (x + 1)) * 4 + c] * kernel[8];
        
        output[(y * width + x) * 4 + c] = Math.max(0, Math.min(255, sum));
      }
    }
  }
  
  // Copy output back
  for (let i = 0; i < pixels.length; i++) {
    if (i % 4 !== 3) { // Skip alpha channel
      pixels[i] = output[i];
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
};

export const applyColorBalance = (ctx: CanvasRenderingContext2D, width: number, height: number, colorBalance: ColorBalance) => {
  const { shadows, midtones, highlights, preserveLuminosity } = colorBalance;
  
  // Check if any adjustment is needed
  const hasShadows = shadows.cyanRed !== 0 || shadows.magentaGreen !== 0 || shadows.yellowBlue !== 0;
  const hasMidtones = midtones.cyanRed !== 0 || midtones.magentaGreen !== 0 || midtones.yellowBlue !== 0;
  const hasHighlights = highlights.cyanRed !== 0 || highlights.magentaGreen !== 0 || highlights.yellowBlue !== 0;
  
  if (!hasShadows && !hasMidtones && !hasHighlights) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const len = pixels.length;
  
  for (let i = 0; i < len; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    
    // Calculate luminosity (0-1)
    const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Weights using quadratic curves for better separation
    const weightShadows = Math.pow(1 - l, 2);
    const weightHighlights = Math.pow(l, 2);
    const weightMidtones = 1 - Math.pow(2 * l - 1, 2);

    let rNew = r;
    let gNew = g;
    let bNew = b;

    // Apply Shadows
    rNew += shadows.cyanRed * weightShadows;
    gNew += shadows.magentaGreen * weightShadows;
    bNew += shadows.yellowBlue * weightShadows;

    // Apply Midtones
    rNew += midtones.cyanRed * weightMidtones;
    gNew += midtones.magentaGreen * weightMidtones;
    bNew += midtones.yellowBlue * weightMidtones;

    // Apply Highlights
    rNew += highlights.cyanRed * weightHighlights;
    gNew += highlights.magentaGreen * weightHighlights;
    bNew += highlights.yellowBlue * weightHighlights;

    // Clamp
    rNew = Math.max(0, Math.min(255, rNew));
    gNew = Math.max(0, Math.min(255, gNew));
    bNew = Math.max(0, Math.min(255, bNew));

    if (preserveLuminosity) {
      const lNew = (0.299 * rNew + 0.587 * gNew + 0.114 * bNew) / 255;
      const lDiff = (l - lNew) * 255;
      
      rNew += lDiff;
      gNew += lDiff;
      bNew += lDiff;
      
      // Clamp again
      rNew = Math.max(0, Math.min(255, rNew));
      gNew = Math.max(0, Math.min(255, gNew));
      bNew = Math.max(0, Math.min(255, bNew));
    }

    pixels[i] = rNew;
    pixels[i + 1] = gNew;
    pixels[i + 2] = bNew;
  }
  
  ctx.putImageData(imageData, 0, 0);
};
