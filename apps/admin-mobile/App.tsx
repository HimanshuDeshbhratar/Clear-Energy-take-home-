import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { colors } from "@clear-energy/shared";
import { PendingActionsScreen } from "./src/screens/PendingActionsScreen";

const queryClient = new QueryClient();

export type RootStackParamList = {
  PendingActions: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colors.brandDark },
              headerTintColor: colors.surface,
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen
              name="PendingActions"
              component={PendingActionsScreen}
              options={{ title: "Pending Actions" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
