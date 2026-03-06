import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
  Raleway_800ExtraBold,
} from '@expo-google-fonts/raleway';
import { AuthProvider } from '../lib/context/AuthContext';
import { supabase } from '../lib/supabase';
import { scheduleLocalNotification } from '../lib/localNotifications';

const BROADCAST_KEY = 'broadcast_last_seen';

function BroadcastNotificationListener() {
  useEffect(() => {
    // Set up real-time subscription immediately (not inside async)
    const channel = supabase
      .channel('broadcast-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'broadcast_notifications' },
        async (payload) => {
          const { title, body, created_at } = payload.new as {
            title: string;
            body: string;
            created_at: string;
          };
          await scheduleLocalNotification(title, body);
          await AsyncStorage.setItem(BROADCAST_KEY, created_at);
        }
      )
      .subscribe();

    // Separately fetch any broadcasts missed while the app was closed
    const fetchMissed = async () => {
      const lastSeen = await AsyncStorage.getItem(BROADCAST_KEY);
      const since = lastSeen ?? new Date(0).toISOString();
      const { data: missed } = await supabase
        .from('broadcast_notifications')
        .select('id, title, body, created_at')
        .gt('created_at', since)
        .order('created_at', { ascending: true });
      if (missed && missed.length > 0) {
        for (const n of missed) {
          await scheduleLocalNotification(n.title, n.body);
        }
        await AsyncStorage.setItem(BROADCAST_KEY, missed[missed.length - 1].created_at);
      }
    };

    fetchMissed().catch(() => {});

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
    Raleway_800ExtraBold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    AsyncStorage.getItem('onboarding_seen').then((val) => {
      if (!val) router.replace('/onboarding');
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#17587A' }} />;
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <BroadcastNotificationListener />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="directory/index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="feed/[postId]/comments" />
        <Stack.Screen name="messages/[userId]/index" />
        <Stack.Screen name="notifications" />
      </Stack>
    </AuthProvider>
  );
}
