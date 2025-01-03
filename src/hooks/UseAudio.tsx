import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";

interface UrlSoundMap {
  [key: string]: THREE.Audio<GainNode>;
}

export function useAudio(url: string) {
  const camera = useThree((state) => state.camera);
  const [sounds, setSounds] = useState<UrlSoundMap>({});

  useEffect(() => {
    if (!camera || !url || !sounds) return;

    if (sounds[url]) return;

    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    const sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(url, function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(0.5);

      setSounds((audioStore) => ({
        ...audioStore,
        [url]: sound,
      }));
    });
  }, [camera, sounds, url]);

  return [sounds[url]];
}
