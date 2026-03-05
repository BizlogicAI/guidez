import { Tabs } from 'expo-router';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

function DirectoryTabButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.dirWrapper} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.dirButton}>
        <Ionicons name="map" size={26} color={Colors.bgDark} />
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="directory"
        options={{
          tabBarButton: (props) => (
            <DirectoryTabButton onPress={props.onPress ? () => props.onPress!({} as any) : undefined} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden — files kept but removed from tab bar */}
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen name="create" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBar,
    borderTopWidth: 0,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 0,
  },
  dirWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
  },
  dirButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
