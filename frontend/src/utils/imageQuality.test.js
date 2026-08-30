import assert from 'node:assert/strict';
import { getImageSharpness } from './imageQuality.js';

globalThis.document = {
  createElement: () => ({
    getContext: () => ({
      drawImage: () => {},
      getImageData: () => ({ data: new Uint8ClampedArray(8 * 8 * 4) }),
    }),
  }),
};

assert.equal(getImageSharpness({ width: 8, height: 8 }), 0, 'Uniform image should have zero sharpness');
