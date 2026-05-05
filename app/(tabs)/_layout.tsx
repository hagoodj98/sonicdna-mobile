import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Extract DNA",
          tabBarIcon: () => (
            <Ionicons name="musical-notes" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "DNA Lab",
          tabBarIcon: () => <Ionicons name="flask" size={24} color="black" />,
        }}
      />
    </Tabs>
  );
}
