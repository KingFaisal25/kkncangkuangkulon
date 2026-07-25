const fs = require('fs');
const https = require('https');
const path = require('path');

const modelsDir = path.join(__dirname, 'public', 'models');

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Model files from face-api.js repository
const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const files = [
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model.weights.bin',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.weights.bin',
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model.weights.bin',
];

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      console.log(`Already exists: ${path.basename(dest)}`);
      return resolve();
    }
    
    console.log(`Downloading ${path.basename(dest)}...`);
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      } else {
        fs.unlink(dest, () => reject(`Failed to download, status code: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err.message));
    });
  });
};

const run = async () => {
  for (const file of files) {
    await downloadFile(`${baseUrl}${file}`, path.join(modelsDir, file));
  }
  console.log('All models downloaded successfully.');
};

run().catch(console.error);
