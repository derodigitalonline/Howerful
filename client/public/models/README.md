# 3D Models Directory

## How to Add Your Howie Model

1. **Export from Blender:**
   - Select your Howie model (mesh + armature)
   - File → Export → glTF 2.0 (.glb)
   - Format: **glTF Binary (.glb)**
   - Include: ✅ Selected Objects, ✅ Apply Modifiers, ✅ UVs, ✅ Normals, ✅ Animation
   - Transform: ✅ +Y Up

2. **Save the file as:**
   - `Howie.glb`

3. **Place it here:**
   - `/client/public/models/Howie.glb`

4. **Refresh your app and navigate to the Profile page!**

## File Structure
```
client/
  public/
    models/
      Howie.glb          ← Your main Howie model
      README.md          ← This file
```

## Tips
- Keep file size under 5MB for best performance
- Low-poly models (< 10k triangles) work best for web
- Bake textures when possible
- Test animations in Blender before exporting
