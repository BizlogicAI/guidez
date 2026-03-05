import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface PostAvatarProps {
  username: string;
  size?: number;
}

export function PostAvatar({ username, size = 40 }: PostAvatarProps) {
  const initial = username.charAt(0).toUpperCase();
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: 'rgba(62,207,192,0.2)',
    borderWidth: 1.5,
    borderColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: Fonts.bold,
    color: Colors.teal,
  },
});
