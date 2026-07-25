import urllib.request
import json
import os

models_dir = os.path.join(os.path.dirname(__file__), 'public', 'models')
os.makedirs(models_dir, exist_ok=True)

base_url = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/'
manifests = [
    'face_landmark_68_model-weights_manifest.json',
    'face_recognition_model-weights_manifest.json',
    'ssd_mobilenetv1_model-weights_manifest.json'
]

def download(url, dest):
    if not os.path.exists(dest):
        print(f"Downloading {os.path.basename(dest)}...")
        urllib.request.urlretrieve(url, dest)
    else:
        print(f"Already exists: {os.path.basename(dest)}")

for manifest in manifests:
    manifest_url = base_url + manifest
    manifest_dest = os.path.join(models_dir, manifest)
    download(manifest_url, manifest_dest)
    
    with open(manifest_dest, 'r') as f:
        data = json.load(f)
        for weights in data:
            for path in weights.get('paths', []):
                download(base_url + path, os.path.join(models_dir, path))

print("All models downloaded successfully.")
