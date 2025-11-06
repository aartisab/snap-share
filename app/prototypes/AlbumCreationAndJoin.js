import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";

const albumStore = new Map(); //map to store created albums in-memory for this prototype

//generate a random join code (length 5)
function generateJoinCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function AlbumCreationAndJoin() {
  //update albumName, created, join code put in by user, and last action states
  const [albumName, setAlbumName] = useState("");
  const [created, setCreated] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [lastAction, setLastAction] = useState(""); // "create" or "join"


  //lists for this user
  const [createdAlbums, setCreatedAlbums] = useState([]); //albums this user created
  const [joinedAlbums, setJoinedAlbums] = useState([]);  //albums this user joined

  //when creating a new album, generate 
  const onCreate = () => {
    const name = albumName;
    if (!name) return; //if user didnt type anything, do nothing
    let code = generateJoinCode();
    while (albumStore.has(code)) code = generateJoinCode(); //ensure we generate a NEW code
    const album = { name, code};
    albumStore.set(code, album);
    setCreated(album);
    setLastAction("create");

    //track in "created" list
    setCreatedAlbums((prev) => [...prev, album]);
  };

  const onJoin = () => {
    const code = joinCodeInput.toUpperCase();
    if (!code) return; //if didn't type anything, do nothing

    const album = albumStore.get(code);

    if (!album) {
     // if code doesn't exist, show message and stop
        alert("This join code does not exist. Please try again.");
        return;
    }

    // if it exists, proceed
    setCreated(album);

    //track in "joined" list
    setJoinedAlbums((prev) => [...prev, album]);
    setLastAction("join");
    };

  return (
    <View>
      <Text>Album Creation & Join</Text>

      <Text>Album Name</Text>
      <TextInput
        value={albumName}
        onChangeText={setAlbumName}
        placeholder="e.g., Anton's BDAY"
        style={{ height: 40, borderWidth: 1, paddingHorizontal: 8, marginBottom: 8 }}
      />
      <Button title="CREATE ALBUM" onPress={onCreate} />

      {created && (
        <View>
          <Text>Album “{created.name}” {lastAction === "create" ? "created!" : "joined!"}</Text>
          <Text>Join Code: {created.code}</Text>
        </View>
      )}

      <Text>Have a code?</Text>
      <TextInput
        value={joinCodeInput}
        onChangeText={(t) => setJoinCodeInput(t.toUpperCase())}
        placeholder="Enter join code"
        autoCapitalize="characters"
        style={{ height: 40, borderWidth: 1, paddingHorizontal: 8, marginBottom: 8 }}
      />
      <Button title="JOIN ALBUM" onPress={onJoin} />

      {/* Lists for reference - created/joined albums */}
      <View style={{ marginTop: 16 }}>
        <Text>Created Albums:</Text>
        {createdAlbums.map((album) => (
          <Text key={`created-${album.code}`}>
            {album.name} — Code: {album.code}
          </Text>
        ))}
      </View>

      <View style={{ marginTop: 16 }}>
        <Text>Joined Albums:</Text>
        {joinedAlbums.map((album) => (
          <Text key={`joined-${album.code}`}>
            {album.name} — Code: {album.code}
          </Text>
        ))}
      </View>
    </View>
  );
}