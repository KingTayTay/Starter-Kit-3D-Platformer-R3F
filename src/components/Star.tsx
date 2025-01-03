import { useTexture } from "@react-three/drei";
import { SpriteProps } from "@react-three/fiber";

export const Star = (props: SpriteProps) => {
  const starTexture = useTexture("/assets/sprites/star.png");

  return (
    <sprite {...props} renderOrder={1}>
      <spriteMaterial
        map={starTexture}
        premultipliedAlpha={false}
        transparent={true}
        alphaTest={0.01}
      />
    </sprite>
  );
};

export default Star;
