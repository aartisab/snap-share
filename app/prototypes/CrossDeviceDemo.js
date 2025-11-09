// components/CrossDeviceDemo.js
import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createAlbum, joinAlbum } from './serverMock';

function UserPane({ label, userState, setUserState }) {
  const { name, code, album } = userState;

  const onCreate = () => {
    const a = createAlbum(name);
    setUserState({ name, code: a.code, album: a }); 
  };

  const onJoin = () => {
    const a = joinAlbum(code);
    if (!a) {
      Alert.alert('Join failed', 'No album with that code.');
      return;
    }
    setUserState({ name, code, album: a }); 
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>{label}</Text>

      {/* Create */}
      <Text style={{ fontWeight: '600' }}>Create album</Text>
      <TextInput
        value={name}
        onChangeText={(t) => setUserState({ name: t, code, album })}
        placeholder="Album name"
        style={{ borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 8, padding: 8, marginTop: 6, marginBottom: 8 }}
      />
      <Button title="Create" onPress={onCreate} />

      <View style={{ height: 16 }} />

      {/* Join */}
      <Text style={{ fontWeight: '600' }}>Join album</Text>
      <TextInput
        value={code}
        onChangeText={(t) => setUserState({ name, code: t.toUpperCase(), album })}
        placeholder="Enter code"
        autoCapitalize="characters"
        style={{ borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 8, padding: 8, marginTop: 6, marginBottom: 8 }}
      />
      <Button title="Join" onPress={onJoin} />

      {album && (
        <View style={{ marginTop: 12, padding: 10, borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 10 }}>
          <Text style={{ fontWeight: '600' }}>
            {album.code === code ? 'Joined album' : 'Album created!'}
          </Text>
          <Text>Name: {album.name}</Text>
          <Text>Code: {album.code}</Text>
          <Text style={{ color: '#5E6A80', marginTop: 6 }}>Empty album (no photos yet).</Text>
        </View>
      )}
    </View>
  );
}

export default function CrossDeviceDemo() {
  const [tab, setTab] = useState('A'); // 'A' | 'B'

  // separate state containers for each user
  const [userA, setUserA] = useState({ name: '', code: '', album: null });
  const [userB, setUserB] = useState({ name: '', code: '', album: null });

  return (
    <View style={{ flex: 1, paddingTop: 10 }}>
      {/* Tabs */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
        {['A', 'B'].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10,
              backgroundColor: tab === t ? '#2C6CF0' : 'white',
              borderWidth: 1, borderColor: '#E8E8E8'
            }}
          >
            <Text style={{ color: tab === t ? 'white' : '#2C6CF0', fontWeight: '600' }}>
              {`User ${t}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* One user pane at a time; each has isolated state */}
      <View style={{ flex: 1 }}>
        {tab === 'A'
          ? <UserPane label="User A" userState={userA} setUserState={setUserA} />
          : <UserPane label="User B" userState={userB} setUserState={setUserB} />
        }
      </View>
    </View>
  );
}
