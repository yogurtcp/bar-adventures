#!/usr/bin/env python3
"""Crop the nine reviewed scene tiles and the reused 4 x 4 vocabulary atlases."""
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SCENES = ROOT / "public/assets/scenes"
OBJECTS = ROOT / "public/assets/objects"
MEALS = ROOT / "public/assets/meal-items"
SOURCE = Path("/home/yevgeny/Documents/Codex/2026-10-02/i-wa/work/little-language-quest/assets/objects")

sheet = Image.open(ROOT / "art-source/nine-scenes-contact-sheet.png").convert("RGB")
w, h = sheet.size
assert w % 3 == 0 and h % 3 == 0, f"Expected a uniform 3x3 grid, got {sheet.size}"
cell_w, cell_h = w // 3, h // 3
ids = ["race", "food", "rocket", "goal", "fish", "tree", "treasure", "pancake", "dino"]
SCENES.mkdir(parents=True, exist_ok=True)
manifest = {"characterReference": "art-source/bar-character-reference.png", "scenes": {}, "objects": {}}
for i, scene_id in enumerate(ids):
    x, y = (i % 3) * cell_w, (i // 3) * cell_h
    tile = sheet.crop((x, y, x + cell_w, y + cell_h)).resize((768, 768), Image.Resampling.LANCZOS)
    target = SCENES / f"{scene_id}.webp"
    tile.save(target, "WEBP", quality=91, method=6)
    manifest["scenes"][scene_id] = {"path": f"public/assets/scenes/{scene_id}.webp", "width": 768, "height": 768, "sourceCell": [i % 3, i // 3]}

# A second, reviewed scene set supplies specific gentle reactions to mistakes.
mistake_source = ROOT / "art-source/mistake-contact-sheet.png"
if mistake_source.exists():
    sheet = Image.open(mistake_source).convert("RGB")
    w, h = sheet.size
    assert w % 3 == 0 and h % 3 == 0, f"Expected a uniform 3x3 reaction sheet, got {sheet.size}"
    cell_w, cell_h = w // 3, h // 3
    for i, scene_id in enumerate(ids):
        x, y = (i % 3) * cell_w, (i // 3) * cell_h
        tile = sheet.crop((x, y, x + cell_w, y + cell_h)).resize((768, 768), Image.Resampling.LANCZOS)
        target = SCENES / f"{scene_id}-oops.webp"
        tile.save(target, "WEBP", quality=91, method=6)
        manifest["scenes"][f"{scene_id}-oops"] = {"path": f"public/assets/scenes/{scene_id}-oops.webp", "width": 768, "height": 768, "sourceCell": [i % 3, i // 3]}

victory_source = ROOT / "art-source/victory-contact-sheet.png"
if victory_source.exists():
    sheet = Image.open(victory_source).convert("RGB")
    w, h = sheet.size
    assert w % 3 == 0 and h % 3 == 0, f"Expected a uniform 3x3 victory sheet, got {sheet.size}"
    cell_w, cell_h = w // 3, h // 3
    for i, scene_id in enumerate(ids):
        x, y = (i % 3) * cell_w, (i // 3) * cell_h
        tile = sheet.crop((x, y, x + cell_w, y + cell_h)).resize((768, 768), Image.Resampling.LANCZOS)
        target = SCENES / f"{scene_id}-win.webp"
        tile.save(target, "WEBP", quality=91, method=6)
        manifest["scenes"][f"{scene_id}-win"] = {"path": f"public/assets/scenes/{scene_id}-win.webp", "width": 768, "height": 768, "sourceCell": [i % 3, i // 3]}

meal_source = ROOT / "art-source/meal-items-contact-sheet.png"
if meal_source.exists():
    sheet = Image.open(meal_source).convert("RGBA")
    w, h = sheet.size
    assert w % 3 == 0 and h % 3 == 0, f"Expected a uniform 3x3 meal sheet, got {sheet.size}"
    cell_w, cell_h = w // 3, h // 3
    names = ["chicken", "eggs", "cucumbers", "tuna", "milk", "frog", "worm", "can", "diaper"]
    MEALS.mkdir(parents=True, exist_ok=True)
    manifest["mealItems"] = {}
    for i, name in enumerate(names):
        x, y = (i % 3) * cell_w, (i // 3) * cell_h
        tile = sheet.crop((x, y, x + cell_w, y + cell_h)).resize((384, 384), Image.Resampling.LANCZOS)
        target = MEALS / f"{name}.webp"
        tile.save(target, "WEBP", lossless=True, method=6)
        manifest["mealItems"][name] = {"path": f"public/assets/meal-items/{name}.webp", "width": 384, "height": 384, "sourceCell": [i % 3, i // 3]}

atlas_ids = {
    "animals": ["dog", "cat", "cow", "duck", "rabbit", "bear", "lion", "elephant", "giraffe", "monkey", "horse", "sheep", "pig", "mouse", "frog", "turtle"],
    "nature": ["fish", "butterfly", "bee", "snail", "bird", "rooster", "penguin", "sun", "tree", "flower", "star", "moon", "cloud", "rainbow", "snowman", "leaf"],
    "food": ["juice", "sausage", "banana", "milk", "chocolate", "candy", "cake", "apple", "pear", "orange", "lemon", "strawberry", "grapes", "watermelon", "carrot", "tomato"],
    "home": ["cucumber", "bread", "cheese", "egg", "icecream", "pizza", "house", "window", "clock", "book", "umbrella", "key", "chair", "bed", "cup", "spoon"],
    "objects": ["car", "bus", "train", "plane", "boat", "bicycle", "rocket", "balloon", "ball", "shoe", "brush", "pencil", "scissors", "hat", "shirt", "sock"],
    "extras": ["mitten", "drum", "guitar", "kite", "mushroom", "shell"],
}
for name, vocab in atlas_ids.items():
    atlas = Image.open(SOURCE / f"{name}.webp").convert("RGBA")
    sw, sh = atlas.size
    cw, ch = sw // 4, sh // 4
    for idx, ident in enumerate(vocab):
        cell = atlas.crop(((idx % 4) * cw, (idx // 4) * ch, (idx % 4 + 1) * cw, (idx // 4 + 1) * ch))
        cell.save(OBJECTS / f"{ident}.webp", "WEBP", lossless=True, method=6)
        manifest["objects"][ident] = f"public/assets/objects/{ident}.webp"

character = Image.open(ROOT / "art-source/bar-character-reference.png").convert("RGBA")
SCENES.mkdir(parents=True, exist_ok=True)
# Keep the approved canonical look sheet available for the adult art gallery.
character.thumbnail((768, 1152), Image.Resampling.LANCZOS)
character.save(SCENES / "bar-reference.webp", "WEBP", lossless=True, method=6)
manifest["canonicalCharacter"] = "public/assets/scenes/bar-reference.webp"
(ROOT / "public/assets/asset-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
