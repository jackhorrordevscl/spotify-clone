// mobile/App.tsx
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar, Platform } from "react-native";
import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  React.useEffect(() => {
    StatusBar.setBarStyle("light-content");
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor("#080d12");
      StatusBar.setTranslucent(true);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
