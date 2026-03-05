import { Tabs } from 'expo-router';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

function SOSTabButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.sosWrapper} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.sosButton}>
        <Text style={styles.sosText}>SOS</Text>
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
        name="messages"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbox" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          tabBarButton: (props) => (
            <SOSTabButton onPress={props.onPress ?? undefined} />
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
        name="create"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add" size={size + 4} color={color} />
          ),
        }}
      />
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
  sosWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
  },
  sosButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.sos,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  sosText: {
    color: Colors.sosText,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
