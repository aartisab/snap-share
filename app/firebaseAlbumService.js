import { db } from "./firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";

import { supabase } from "./supabaseClient";
import * as FileSystem from "expo-file-system";
import { Blob } from "react-native";


// -------------------------
// Generate Join Code
// -------------------------
export function generateJoinCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// -------------------------
// CREATE ALBUM
// -------------------------
export async function createAlbum(name) {
  const code = generateJoinCode();

  await setDoc(doc(db, "albums", code), {
    name,
    code,
    photos: [],
  });

  return { name, code };
}

// -------------------------
// JOIN ALBUM
// -------------------------
export async function joinAlbum(code) {
  const ref = doc(db, "albums", code);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return snap.data();
}

// -------------------------
// LIVE LISTENER
// -------------------------
export function subscribeToAlbum(code, callback) {
  const ref = doc(db, "albums", code);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

// -------------------------
// UPLOAD PHOTO → SUPABASE
// (Expo Blob official way)
// -------------------------
// UPLOAD PHOTO → SUPABASE STORAGE
export async function uploadPhoto(albumCode, uri) {
  try {
    // 1. Fetch the local file into a Blob (MODERN EXPO WAY)
    const response = await fetch(uri);
    const blob = await response.blob();

    // 2. Create a unique filename
    const filename = `${albumCode}/${Date.now()}.jpg`;

    // 3. Upload Blob to Supabase Storage
    const { data, error } = await supabase.storage
      .from("snapshare-photos")
      .upload(filename, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.log("Supabase Upload Error:", error);
      throw error;
    }

    // 4. Get public URL
    const { data: publicData } = supabase.storage
      .from("snapshare-photos")
      .getPublicUrl(filename);

    const publicUrl = publicData.publicUrl;

    // 5. Save URL in Firestore
    await updateDoc(doc(db, "albums", albumCode), {
      photos: arrayUnion(publicUrl),
    });

    return publicUrl;
  } catch (e) {
    console.error("Upload Error:", e);
    throw e;
  }
}