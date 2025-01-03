import { proxy } from "valtio";

interface Coin {
  id: string;
  position: [number, number, number];
  collected: boolean;
}

interface Coins {
  byId: Record<string, Coin>;
  allIds: string[];
}

interface FallingPlatform {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  despawned: boolean;
}

interface FallingPlatforms {
  byId: Record<string, FallingPlatform>;
  allIds: string[];
}

const coins: Coins = {
  byId: {
    "0": {
      id: "0",
      position: [-3, 1, 0],
      collected: false,
    },
    "1": {
      id: "1",
      position: [-5, 1, 4],
      collected: false,
    },
    "2": {
      id: "2",
      position: [-7, 2, -0.25],
      collected: false,
    },
    "3": {
      id: "3",
      position: [-7, 2, -1.25],
      collected: false,
    },
    "4": {
      id: "4",
      position: [-7, 2, -2.25],
      collected: false,
    },
    "5": {
      id: "5",
      position: [-12, 3, -2.5],
      collected: false,
    },
    "6": {
      id: "6",
      position: [-15, 2, 0],
      collected: false,
    },
    "7": {
      id: "7",
      position: [-15, 3, 0],
      collected: false,
    },
    "8": {
      id: "8",
      position: [-15, 1, 4],
      collected: false,
    },
    "9": {
      id: "9",
      position: [0, 5, -6],
      collected: false,
    },
  },
  allIds: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
};

const fallingPlatforms: FallingPlatforms = {
  byId: {
    "0": {
      id: "0",
      position: [-9, 0.5, 4],
      rotation: [0, 0.17453292519943295, 0],
      despawned: false,
    },
    "1": {
      id: "1",
      position: [-12, 0, 4],
      rotation: [0, -0.10471975511965978, 0],
      despawned: false,
    },
    "2": {
      id: "2",
      position: [-12, 2, -2.5],
      rotation: [0, 0.3490658503988659, 0],
      despawned: false,
    },
  },
  allIds: ["0", "1", "2"],
};

export const store = proxy({
  coins,
  fallingPlatforms,
  score: 0,
});

export const updateCoinCollected = (id: string) => {
  store.coins.byId[id].collected = true;
  store.score++;
};

export const resetStore = () => {
  store.coins.allIds.forEach((id) => {
    store.coins.byId[id].collected = false;
  });
  store.fallingPlatforms.allIds.forEach((id) => {
    store.fallingPlatforms.byId[id].despawned = false;
  });
  store.score = 0;
};
