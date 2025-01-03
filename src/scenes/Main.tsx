import { useSnapshot } from "valtio";
import { Cloud } from "../components/Cloud";
import { Coin } from "../components/Coin";
import { FallingPlatform } from "../components/FallingPlatform";
import { Flag } from "../components/Flag";
import { GrassPlatform } from "../components/GrassPlatform";
import { MediumPlatform } from "../components/MediumPlatform";
import { Platform } from "../components/Platform";
import { store, updateCoinCollected } from "../store";

export function Scene() {
  const snapshot = useSnapshot(store);
  const uncollectedCoins = snapshot.coins.allIds.filter(
    (id) => !snapshot.coins.byId[id].collected
  );
  const spawnedFallingPlatforms = snapshot.fallingPlatforms.allIds.filter(
    (id) => !snapshot.fallingPlatforms.byId[id].despawned
  );

  return (
    <>
      <GrassPlatform position={[-7, 1, -2]} rotation={[0, 0, 0]} />
      <Platform position={[0, 0, 0]} rotation={[0, -0.12217304763960307, 0]} />
      <Platform position={[-3, 2, -3]} rotation={[0, 0, 0]} />
      <Platform position={[-3, 3, -5]} rotation={[0, -0.2617993877991494, 0]} />
      <Platform
        position={[-15, 0, 4]}
        rotation={[0, -0.12217304763960307, 0]}
      />
      <MediumPlatform
        position={[-3, 0, 0]}
        rotation={[0, 0.08726646259971647, 0]}
      />
      <MediumPlatform position={[-5, 0, 4]} rotation={[0, 6, 0]} />
      <MediumPlatform position={[0, 3, -6]} rotation={[0, 0, 0]} />
      <MediumPlatform
        position={[-15, 1, 0]}
        rotation={[0, -0.3839724354387525, 0]}
      />
      <Flag position={[0, 3.5, -6]} rotation={[0, -0.7853981633974483, 0]} />
      {spawnedFallingPlatforms.map((id) => {
        const platform = snapshot.fallingPlatforms.byId[id];

        return (
          <FallingPlatform
            key={platform.id}
            platformId={platform.id}
            position={platform.position}
            rotation={[...platform.rotation]}
            onDespawn={() => {
              store.fallingPlatforms.byId[id].despawned = true;
            }}
          />
        );
      })}
      {uncollectedCoins.map((id) => {
        const coin = snapshot.coins.byId[id];

        return (
          <Coin
            key={coin.id}
            position={coin.position}
            coinId={coin.id}
            onCollect={() => updateCoinCollected(coin.id)}
          />
        );
      })}
      <Cloud position={[-7.66, 4, -5]} rotation={[0, 0, 0]} />
      <Cloud position={[-10.04, 3.5, 9]} rotation={[0, 0, 0]} />
      <Cloud position={[-11.52, 5, 8]} rotation={[0, 0, 0]} />
      <Cloud position={[-5.78, 3.5, -7.32]} rotation={[0, 0, 0]} />
      <Cloud position={[-12.08, -2, 9.08]} scale={3} rotation={[0, 0, 0]} />
      <Cloud position={[-10.7, 0, -8]} scale={3} rotation={[0, 0, 0]} />
    </>
  );
}

export default Scene;
