import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import type { User } from '@repo/shared';

const mockUser: User = {
  id: '1',
  email: 'alice@example.com',
  name: 'Alice',
  createdAt: new Date('2025-01-01T00:00:00Z'),
};

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mockUser.name}</Text>
      <Text>{mockUser.email}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
