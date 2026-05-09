import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

const TAB_BG = "#0F1A2D";
const TAB_BORDER = "#1F3250";
const TAB_ACTIVE = "#4DD9FF";
const TAB_INACTIVE = "#7F95B7";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 0.2,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarStyle: {
          left: 12,
          right: 12,

          height: 64,
          borderTopWidth: 1,
          borderTopColor: TAB_BORDER,
          backgroundColor: TAB_BG,
          paddingTop: 4,
          paddingBottom: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 14,
          elevation: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Extract DNA",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "musical-notes" : "musical-notes-outline"}
              size={focused ? 24 : 22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          title: "DNA Lab",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "flask" : "flask-outline"}
              size={focused ? 24 : 22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
