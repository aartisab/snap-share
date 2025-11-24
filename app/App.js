import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, Image, Alert, StyleSheet 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";

import {
  createAlbum,
  joinAlbum,
  subscribeToAlbum,
  uploadPhoto,
} from "./firebaseAlbumService";

export default function App() {
  const [activeUser, setActiveUser] = useState("A");

  const [userA, setUserA] = useState({ name: "", albumCode: "", album: null });
  const [userB, setUserB] = useState({ name: "", albumCode: "", album: null });

  const user = activeUser === "A" ? userA : userB;
  const setUser = activeUser === "A" ? setUserA : setUserB;

  /* -----------------------------
      CREATE ALBUM
  ------------------------------ */
  const handleCreate = async () => {
    if (!user.name.trim()) return;

    const album = await createAlbum(user.name);
    setUser({ ...user, albumCode: album.code, album });
  };

  /* -----------------------------
      JOIN ALBUM
  ------------------------------ */
  const handleJoin = async () => {
    const album = await joinAlbum(user.albumCode);

    if (!album) {
      Alert.alert("Error", "Invalid join code.");
      return;
    }

    setUser({ ...user, album });
  };

  /* -----------------------------
      REAL-TIME SUBSCRIPTION
  ------------------------------ */
  useEffect(() => {
    if (!user.albumCode) return;

    const unsub = subscribeToAlbum(user.albumCode, (updatedAlbum) => {
      setUser((prev) => ({ ...prev, album: updatedAlbum }));
    });

    return unsub;
  }, [user.albumCode]);

  /* -----------------------------
      UPLOAD PHOTO
  ------------------------------ */
  const handleUpload = async () => {
    if (!user.album) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      alert("Media library permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      await uploadPhoto(user.album.code, result.assets[0].uri);
    }
  };

  /* -----------------------------
      DOWNLOAD PHOTO
  ------------------------------ */
  const handleDownload = async (uri) => {
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) {
      alert("Media library access required.");
      return;
    }

    try {
      await MediaLibrary.saveToLibraryAsync(uri);
      alert("Saved to device!");
    } catch (e) {
      console.error(e);
      alert("Error saving.");
    }
  };

  /* -----------------------------
      ALBUM PAGE
  ------------------------------ */
  if (user.album) {
    return (
      <View style={styles.container}>
        <Text style={styles.h1}>{user.album.name}</Text>
        <Text style={styles.code}>Join Code: {user.album.code}</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleUpload}>
          <Text style={styles.primaryText}>Upload Photo</Text>
        </TouchableOpacity>

        <FlatList
          data={user.album.photos}
          keyExtractor={(item, i) => i.toString()}
          numColumns={3}
          style={{ marginTop: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleDownload(item)}>
              <Image 
                source={{ uri: item }} 
                style={styles.image} 
              />
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity 
          style={styles.tertiaryButton} 
          onPress={() => setActiveUser(activeUser === "A" ? "B" : "A")}
        >
          <Text style={styles.tertiaryText}>
            Switch to User {activeUser === "A" ? "B" : "A"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* -----------------------------
      CREATE/JOIN PAGE
  ------------------------------ */
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>SnapShare</Text>
      <Text style={styles.sub}>User {activeUser}</Text>

      <TextInput
        placeholder="Album name"
        style={styles.input}
        value={user.name}
        onChangeText={(t) => setUser({ ...user, name: t })}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
        <Text style={styles.primaryText}>Create Album</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Enter join code"
        style={styles.input}
        autoCapitalize="characters"
        value={user.albumCode}
        onChangeText={(t) => setUser({ ...user, albumCode: t })}
      />

      <TouchableOpacity style={styles.secondaryButton} onPress={handleJoin}>
        <Text style={styles.secondaryText}>Join Album</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tertiaryButton} 
        onPress={() => setActiveUser(activeUser === "A" ? "B" : "A")}
      >
        <Text style={styles.tertiaryText}>
          Switch to User {activeUser === "A" ? "B" : "A"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, paddingTop: 60, paddingHorizontal: 20 
  },
  h1: {
    fontSize: 28, fontWeight: "700", color: "#2C6CF0"
  },
  sub: { fontSize: 18, color: "#5E6A80", marginBottom: 20 },
  code: { fontSize: 16, color: "#5E6A80", marginTop: 8 },

  input: {
    borderWidth: 1, borderColor: "#E8E8E8",
    padding: 12, borderRadius: 10, marginBottom: 12
  },

  primaryButton: {
    backgroundColor: "#2C6CF0",
    paddingVertical: 12, borderRadius: 10, marginTop: 8
  },
  primaryText: { 
    color: "white", fontWeight: "600", textAlign: "center" 
  },

  secondaryButton: {
    borderWidth: 1, borderColor: "#2C6CF0",
    paddingVertical: 12, borderRadius: 10, marginTop: 10
  },
  secondaryText: { 
    color: "#2C6CF0", fontWeight: "600", textAlign: "center" 
  },

  tertiaryButton: { marginTop: 20 },
  tertiaryText: { 
    color: "#2C6CF0", fontWeight: "600", textAlign: "center" 
  },

  image: {
    width: 110,
    height: 110,
    margin: 4,
    borderRadius: 8
  }
});
