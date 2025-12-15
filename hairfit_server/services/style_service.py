import json
import os
import shutil
from pathlib import Path

# 스타일 ID와 참조 이미지 경로 매핑 (동적으로 관리)
STYLE_IMAGES = {}
STYLE_METADATA = {}
METADATA_FILE = Path("assets/styles/metadata.json")

def load_style_metadata():
    """Load style metadata from JSON file"""
    global STYLE_METADATA
    if METADATA_FILE.exists():
        try:
            with open(METADATA_FILE, "r", encoding="utf-8") as f:
                STYLE_METADATA = json.load(f)
            print(f"Loaded metadata for {len(STYLE_METADATA)} styles")
        except Exception as e:
            print(f"Error loading metadata: {e}")
            STYLE_METADATA = {}
    else:
        STYLE_METADATA = {}

def save_style_metadata():
    """Save style metadata to JSON file"""
    try:
        # Ensure directory exists
        METADATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(METADATA_FILE, "w", encoding="utf-8") as f:
            json.dump(STYLE_METADATA, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving metadata: {e}")

def load_style_images():
    """Load all style images from assets/styles directory"""
    global STYLE_IMAGES
    STYLE_IMAGES.clear()

    styles_dir = Path("assets/styles")
    if not styles_dir.exists():
        styles_dir.mkdir(parents=True, exist_ok=True)
        return

    # Scan for image files
    for file_path in styles_dir.glob("*"):
        if file_path.is_file() and file_path.suffix.lower() in ['.jpg', '.jpeg', '.png']:
            # Extract style_id from filename (e.g., style_1.jpg -> style_1)
            style_id = file_path.stem
            if style_id.startswith("style_"):
                # Convert Windows backslashes to forward slashes for consistency
                STYLE_IMAGES[style_id] = str(file_path).replace('\\', '/')
                
                # Initialize metadata if not exists
                if style_id not in STYLE_METADATA:
                    STYLE_METADATA[style_id] = {
                        "tags": [],
                        "gender": "neutral",
                        "category": "unknown"
                    }

    # Save initialized metadata
    save_style_metadata()
    print(f"Loaded {len(STYLE_IMAGES)} style images: {list(STYLE_IMAGES.keys())}")
