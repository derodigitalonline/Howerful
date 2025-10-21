import { EquippedCosmetics } from '@shared/schema';
import { getCosmeticById } from '@/constants/cosmetics';
import DefaultSprite from '@/assets/DefaultSprite.png';

/**
 * LayeredAvatar Component
 *
 * This component renders a customized Howie by layering PNG images on top of each other.
 * Think of it like Photoshop layers or a paper doll system.
 *
 * HOW IT WORKS:
 * 1. We have a base sprite (DefaultSprite.png) - the "naked" Howie
 * 2. We overlay cosmetic PNGs on top (hat, shirt, pants, etc.)
 * 3. CSS position: absolute + z-index controls the stacking order
 * 4. All images are the same size (168x168px by default) and aligned perfectly
 *
 * LAYER ORDER (bottom to top):
 * z-index 1: Cape (goes behind Howie - think superhero cape flowing behind)
 * z-index 2: Base Sprite (the actual Howie body)
 * z-index 3: Pants (covers lower body)
 * z-index 4: Shirt (covers upper body)
 * z-index 5: Facewear (glasses, masks - sits on the face)
 * z-index 6: Hat (sits on top of head)
 * z-index 7: Pet (rendered beside Howie, not on top)
 *
 * WHY THIS STRUCTURE?
 * - The z-index order ensures proper visual layering
 * - Capes go behind so they look like they're flowing
 * - Shirts layer over pants (like real clothing!)
 * - Hats are always visible on top
 * - Pets are positioned to the side with custom offsets
 */

interface LayeredAvatarProps {
  equippedCosmetics?: EquippedCosmetics; // What the user has equipped
  size?: number;                         // Size in pixels (default 168)
  className?: string;                    // Additional Tailwind classes
  showPet?: boolean;                     // Option to hide pets (for small previews)
}

export default function LayeredAvatar({
  equippedCosmetics = {},  // Default to empty object if not provided
  size = 168,              // Default size matches our sprite dimensions
  className = '',
  showPet = true,
}: LayeredAvatarProps) {

  // Convert equipped IDs to full cosmetic objects
  // getCosmeticById returns undefined if the ID doesn't exist (item was removed from game)
  const cape = equippedCosmetics.cape ? getCosmeticById(equippedCosmetics.cape) : null;
  const pants = equippedCosmetics.pants ? getCosmeticById(equippedCosmetics.pants) : null;
  const shirt = equippedCosmetics.shirt ? getCosmeticById(equippedCosmetics.shirt) : null;
  const facewear = equippedCosmetics.facewear ? getCosmeticById(equippedCosmetics.facewear) : null;
  const hat = equippedCosmetics.hat ? getCosmeticById(equippedCosmetics.hat) : null;
  const pet = equippedCosmetics.pet ? getCosmeticById(equippedCosmetics.pet) : null;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/*
        LAYER 1: CAPE (z-index: 1)
        Rendered first so it appears behind everything
        Only renders if: cape exists AND imagePath is not empty
      */}
      {cape && cape.imagePath && (
        <img
          src={cape.imagePath}
          alt={cape.name}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ zIndex: cape.zIndex || 1 }}
        />
      )}

      {/*
        LAYER 2: BASE SPRITE (z-index: 2)
        The core Howie character - always rendered
        This is our DefaultSprite.png
      */}
      <img
        src={DefaultSprite}
        alt="Howie"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ zIndex: 2 }}
      />

      {/*
        LAYER 3: PANTS (z-index: 3)
        Covers the lower body of the base sprite
        Only renders if equipped and has an imagePath
      */}
      {pants && pants.imagePath && (
        <img
          src={pants.imagePath}
          alt={pants.name}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ zIndex: pants.zIndex || 3 }}
        />
      )}

      {/*
        LAYER 4: SHIRT (z-index: 4)
        Covers the upper body, goes over pants
        This is realistic - shirts layer over pants!
      */}
      {shirt && shirt.imagePath && (
        <img
          src={shirt.imagePath}
          alt={shirt.name}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ zIndex: shirt.zIndex || 4 }}
        />
      )}

      {/*
        LAYER 5: FACEWEAR (z-index: 5)
        Glasses, masks, and other face accessories
        Sits on the face, under the hat
      */}
      {facewear && facewear.imagePath && (
        <img
          src={facewear.imagePath}
          alt={facewear.name}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ zIndex: facewear.zIndex || 5 }}
        />
      )}

      {/*
        LAYER 6: HAT (z-index: 6)
        Always on top so it's clearly visible
        Hats should never be hidden behind anything
      */}
      {hat && hat.imagePath && (
        <img
          src={hat.imagePath}
          alt={hat.name}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ zIndex: hat.zIndex || 6 }}
        />
      )}

      {/*
        LAYER 7: PET (z-index: 7)
        Pets are special - they're positioned BESIDE the avatar, not on top
        Uses absolute positioning with custom offsets
        Default position: 60% to the right, centered vertically
        Pets are 40% the size of the main avatar
      */}
      {showPet && pet && pet.imagePath && (
        <img
          src={pet.imagePath}
          alt={pet.name}
          className="absolute object-contain pointer-events-none"
          style={{
            zIndex: 7,
            width: size * 0.4,    // Pets are smaller
            height: size * 0.4,
            // Position can be customized per-pet via the cosmetic item
            left: size * 0.6,     // Default: 60% to the right
            top: size * 0.5,      // Default: centered vertically
          }}
        />
      )}
    </div>
  );
}

/**
 * USAGE EXAMPLES:
 *
 * 1. Basic usage with equipped items from profile:
 * <LayeredAvatar equippedCosmetics={profile.equippedCosmetics} />
 *
 * 2. Custom size (for profile page vs. small icons):
 * <LayeredAvatar
 *   equippedCosmetics={profile.equippedCosmetics}
 *   size={256}
 * />
 *
 * 3. Preview mode without pet (for customization UI):
 * <LayeredAvatar
 *   equippedCosmetics={tempEquipped}
 *   showPet={false}
 * />
 *
 * 4. Empty state (no cosmetics equipped):
 * <LayeredAvatar equippedCosmetics={{}} />
 * // Shows just the base sprite
 */
