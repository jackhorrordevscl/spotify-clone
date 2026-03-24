import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar, Platform } from "react-native";
import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  React.useEffect(() => {
    if (Platform.OS === "android") {
      // 1. Configuración estética de la barra superior
      StatusBar.setBarStyle("light-content");
      StatusBar.setBackgroundColor("transparent", true);
      StatusBar.setTranslucent(true);

      // 2. Ocultar barras (Superior e Inferior) de forma inmersiva
      // El modo 'sticky-immersive' es clave: oculta las barras y solo las muestra
      // brevemente si el usuario desliza desde el borde, ocultándolas de nuevo solas.
      StatusBar.setHidden(true, "none");
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
