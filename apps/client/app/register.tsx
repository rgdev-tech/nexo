import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/lib/settings';
import { LEGAL_URLS } from '@/lib/constants';
import { openUrl } from '@/lib/openUrl';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useSettings();

  const handleRegister = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Éxito', 'Registro exitoso. Por favor verifica tu email.');
      router.replace('/login');
    }
    setLoading(false);
  };

  const isDark = theme === 'dark';
  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre Completo"
        placeholderTextColor={isDark ? '#888' : '#666'}
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={isDark ? '#888' : '#666'}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={isDark ? '#888' : '#666'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={[styles.legalText, { color: isDark ? '#aaa' : '#666' }]}>
        Al registrarte aceptas los{' '}
        <Pressable onPress={() => openUrl(LEGAL_URLS.terms)}>
          <Text style={styles.legalLink}>Términos y Condiciones</Text>
        </Pressable>
        {' '}y la{' '}
        <Pressable onPress={() => openUrl(LEGAL_URLS.privacy)}>
          <Text style={styles.legalLink}>Política de Privacidad</Text>
        </Pressable>
        .
      </Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.linkButton}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: isDark ? '#000' : '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: isDark ? '#fff' : '#000',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: isDark ? '#333' : '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: isDark ? '#fff' : '#000',
    backgroundColor: isDark ? '#111' : '#f9f9f9',
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  legalText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  legalLink: {
    color: '#007AFF',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
