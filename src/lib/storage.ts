import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";

/** Armazenamento persistente dos stores. Trocar por MMKV aqui se o app migrar para dev build. */
export const persistStorage = createJSONStorage(() => AsyncStorage);
