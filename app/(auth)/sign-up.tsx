import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, Eye, EyeOff, Key } from 'lucide-react-native';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>
              We sent a verification code to {emailAddress}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Key size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Verification code"
                placeholderTextColor="#9CA3AF"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.buttonDisabled]}
              onPress={onPressVerify}
              disabled={loading}>
              <Text style={styles.signUpButtonText}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <User size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="First name"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoComplete="given-name"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <User size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Last name"
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                autoComplete="family-name"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#9CA3AF"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { paddingRight: 50 }]}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#9CA3AF" />
              ) : (
                <Eye size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.buttonDisabled]}
            onPress={onSignUpPress}
            disabled={loading}>
            <Text style={styles.signUpButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  nameRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  signUpButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  linkText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});