export function getImageSharpness(imageInput) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context || (!imageInput?.videoWidth && !imageInput?.naturalWidth && !imageInput?.width)) return 0;

  const width = imageInput.videoWidth || imageInput.naturalWidth || imageInput.width;
  const height = imageInput.videoHeight || imageInput.naturalHeight || imageInput.height;
  canvas.width = width;
  canvas.height = height;
  context.drawImage(imageInput, 0, 0, width, height);

  const { data } = context.getImageData(0, 0, width, height);
  let score = 0;

  for (let y = 0; y < height - 1; y += 4) {
    for (let x = 0; x < width - 1; x += 4) {
      const index = (y * width + x) * 4;
      const right = index + 4;
      const down = index + width * 4;
      const gray = (data[index] + data[index + 1] + data[index + 2]) / 3;
      const grayRight = (data[right] + data[right + 1] + data[right + 2]) / 3;
      const grayDown = (data[down] + data[down + 1] + data[down + 2]) / 3;
      score += Math.abs(gray - grayRight) + Math.abs(gray - grayDown);
    }
  }

  return score;
}

export async function pickBestFaceFrame(captureFrame, tries = 3, delayMs = 120) {
  const frames = [];

  for (let index = 0; index < tries; index += 1) {
    const frame = await captureFrame();
    if (frame) frames.push({ ...frame, sharpness: getImageSharpness(frame.imageElement) });
    if (index < tries - 1) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  if (frames.length === 0) return null;
  return frames.reduce((best, current) => (current.sharpness > best.sharpness ? current : best));
}
