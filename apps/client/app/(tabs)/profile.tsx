import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useSettings } from '@/lib/settings';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme } = useSettings();
  const router = useRouter();
  const isDark = theme === 'dark';
  const styles = getStyles(isDark);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Inicia sesión para ver tu perfil</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.email?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.email}>{user.email}</Text>
        {user.user_metadata?.full_name && (
          <Text style={styles.name}>{user.user_metadata.full_name}</Text>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color={isDark ? '#fff' : '#000'} />
          <Text style={styles.menuText}>Configuración</Text>
          <Ionicons name="chevron-forward" size={24} color={isDark ? '#666' : '#ccc'} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, styles.signOutButton]} onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={[styles.menuText, { color: '#FF3B30' }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#000' : '#f2f2f7',
    padding: 20,
  },
  message: {
    fontSize: 18,
    color: isDark ? '#fff' : '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 18,
    color: isDark ? '#fff' : '#000',
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    color: isDark ? '#aaa' : '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: isDark ? '#1c1c1e' : '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: isDark ? '#fff' : '#000',
  },
  signOutButton: {
    borderBottomWidth: 0,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
