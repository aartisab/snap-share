import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  blue: '#2C6CF0',      // primary
  peach: '#FFA771',     // accent
  peachTint: '#FFE3CC', // accent tint
  slate: '#5E6A80',     // secondary text
  bg: '#FAFAFA',        // surface background
  divider: '#E8E8E8'    // lines
};

function Chip({ label }) {
  return (
    <View style={{
      alignSelf: 'flex-start',
      backgroundColor: COLORS.peachTint,
      paddingHorizontal: 10, paddingVertical: 6,
      borderRadius: 16
    }}>
      <Text style={{ color: COLORS.slate, fontFamily: 'Inter_500Medium' }}>{label}</Text>
    </View>
  );
}

function Swatch({ name, hex }) {
  return (
    <View style={{ alignItems: 'center', marginRight: 12 }}>
      <View style={{ width: 54, height: 54, borderRadius: 12, backgroundColor: hex, borderWidth: 1, borderColor: COLORS.divider }} />
      <Text style={{ marginTop: 6, fontFamily: 'Inter_400Regular', color: COLORS.slate }}>{name}</Text>
      <Text style={{ fontFamily: 'Inter_400Regular', color: COLORS.slate }}>{hex}</Text>
    </View>
  );
}

function PrimaryButton({ title, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: COLORS.blue,
        opacity: disabled ? 0.45 : 1,
        paddingVertical: 12, paddingHorizontal: 16,
        borderRadius: 10
      }}>
      <Text style={{ color: 'white', fontFamily: 'Inter_500Medium' }}>{title}</Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({ title, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: 'white',
        borderWidth: 1, borderColor: COLORS.blue,
        opacity: disabled ? 0.45 : 1,
        paddingVertical: 12, paddingHorizontal: 16,
        borderRadius: 10
      }}>
      <Text style={{ color: COLORS.blue, fontFamily: 'Inter_500Medium' }}>{title}</Text>
    </TouchableOpacity>
  );
}

function TertiaryButton({ title, onPress, disabled }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text style={{ color: COLORS.blue, opacity: disabled ? 0.45 : 1, fontFamily: 'Inter_500Medium' }}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function StyleGuide() {
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  if (!fontsLoaded) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: 20, gap: 22 }}>
      {/* Typography */}
      <View>
        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 28, color: COLORS.blue }}>SnapShare</Text>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 20, marginTop: 8, color: 'black' }}>Album title / H2</Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 22, marginTop: 6, color: COLORS.slate }}>
          Friendly, minimal typography system using Poppins for headings and Inter for body and UI text.
        </Text>
      </View>

      {/* Colors */}
      <View>
        <Text style={{ fontFamily: 'Inter_600SemiBold', marginBottom: 10 }}>Colors</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Swatch name="Primary Blue" hex={COLORS.blue} />
          <Swatch name="Peach" hex={COLORS.peach} />
          <Swatch name="Peach Tint" hex={COLORS.peachTint} />
          <Swatch name="Slate" hex={COLORS.slate} />
          <Swatch name="Background" hex={COLORS.bg} />
          <Swatch name="Divider" hex={COLORS.divider} />
        </ScrollView>
      </View>

      {/* Icons */}
      <View>
        <Text style={{ fontFamily: 'Inter_600SemiBold', marginBottom: 10 }}>Icons</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
          <View style={{ alignItems: 'center' }}>
            <MaterialIcons name="qr-code-2" size={32} color="black" />
            <Text style={{ fontFamily: 'Inter_400Regular', color: COLORS.slate }}>QR</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialIcons name="add-photo-alternate" size={32} color="black" />
            <Text style={{ fontFamily: 'Inter_400Regular', color: COLORS.slate }}>Upload</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialIcons name="file-download" size={32} color="black" />
            <Text style={{ fontFamily: 'Inter_400Regular', color: COLORS.slate }}>Download</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialIcons name="ios-share" size={32} color="black" />
            <Text style={{ fontFamily: 'Inter_400Regular', color: COLORS.slate }}>Share</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="emoticon-happy-outline" size={32} color="black" />
            <Text style={{ fontFamily: 'Inter_400Regular', color: COLORS.slate }}>Reaction</Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={{ gap: 12 }}>
        <Text style={{ fontFamily: 'Inter_600SemiBold' }}>Buttons</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <PrimaryButton title="Primary" onPress={() => Alert.alert('Primary pressed')} />
          <SecondaryButton title="Secondary" onPress={() => Alert.alert('Secondary pressed')} />
          <TertiaryButton title="Tertiary" onPress={() => Alert.alert('Tertiary pressed')} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <PrimaryButton title="Primary (disabled)" disabled onPress={() => {}} />
          <SecondaryButton title="Secondary (disabled)" disabled onPress={() => {}} />
          <TertiaryButton title="Tertiary (disabled)" disabled onPress={() => {}} />
        </View>
      </View>

      {/* Inputs & Chip */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontFamily: 'Inter_600SemiBold' }}>Inputs & Chip</Text>
        <TextInput
          placeholder="Album name"
          placeholderTextColor={COLORS.slate}
          style={{
            borderWidth: 1, borderColor: COLORS.divider,
            borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
            fontFamily: 'Inter_400Regular'
          }}
        />
        <Chip label="Guest #3" />
      </View>

      {/* Card sample */}
      <View>
        <Text style={{ fontFamily: 'Inter_600SemiBold', marginBottom: 10 }}>Card</Text>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 16,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          borderWidth: 1,
          borderColor: COLORS.divider
        }}>
          <Text style={{ fontFamily: 'Inter_500Medium' }}>Album Tile</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', color: COLORS.slate, marginTop: 4 }}>
            Shows how surfaces/elevation will look in the app.
          </Text>
        </View>
      </View>

      <Text style={{ fontFamily: 'Inter_400Regular', color: COLORS.slate }}>
        These tokens drive the SnapShare UI—fonts, colors, icons, and components shown here are used across screens.
      </Text>
    </ScrollView>
  );
}
