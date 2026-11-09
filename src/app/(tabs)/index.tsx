import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui";
import { SignOutButton } from "@/features/auth/SignOutButton";

// Placeholder até a Fase 6 (abas Hoje/Progresso/Hábitos/Perfil).
export default function Today() {
  return (
    <View style={styles.container}>
      <Text>Edit src/app/(tabs)/index.tsx to edit this screen.</Text>
      {__DEV__ ? (
        <Link href="/playground">
          <Text tone="acc" variant="bodyStrong">
            Abrir playground
          </Text>
        </Link>
      ) : null}
      <SignOutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
});
