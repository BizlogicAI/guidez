import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface PostAvatarProps {
  username: string;
  avatarUrl?: string | null;
  milestoneBadge?: string | null;
  size?: number;
}

export function PostAvatar({ username, avatarUrl, milestoneBadge, size = 40 }: PostAvatarProps) {
  const badgeSize = Math.round(size * 0.44);

  const inner = avatarUrl ? (
    <Image
      source={{ uri: avatarUrl }}
      style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
    />
  ) : (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>
        {username.charAt(0).toUpperCase()}
      </Text>
    </View>
  );

  if (!milestoneBadge) return inner;

  return (
    <View style={{ width: size, height: size }}>
      {inner}
      <View
        style={[
          styles.badge,
          { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 },
        ]}
      >
        <Text style={{ fontSize: badgeSize * 0.65 }}>{milestoneBadge}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderWidth: 1.5,
    borderColor: Colors.teal,
  },
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
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.bgDark,
    borderWidth: 1,
    borderColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
