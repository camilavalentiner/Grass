"""Turn the chosen 1024px master into every size the app needs. Usage: python3 scripts/make-icons.py daisy|blade|book"""
import sys, os
from PIL import Image
name = sys.argv[1]
here = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "design", "icon")
repo = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
master = Image.open(os.path.join(here, f"{name}-1024.png")).convert("RGB")
os.makedirs(f"{repo}/public/icons", exist_ok=True)
def save(img, size, path): img.resize((size, size), Image.LANCZOS).save(path, optimize=True)
save(master, 192, f"{repo}/public/icons/icon-192.png")
save(master, 512, f"{repo}/public/icons/icon-512.png")
save(master, 180, f"{repo}/src/app/apple-icon.png")   # iPhone home screen
save(master, 512, f"{repo}/src/app/icon.png")          # browser tab
# maskable: Android may crop to a circle, so keep the drawing inside the middle 80%
mask = Image.new("RGB", (1024, 1024), master.getpixel((8, 8)))
mask.paste(master.resize((820, 820), Image.LANCZOS), (102, 102))
save(mask, 512, f"{repo}/public/icons/icon-maskable-512.png")
print("icons written for", name)
