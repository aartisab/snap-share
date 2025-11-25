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
import * as FileSystem from "expo-file-system/legacy";
import { Buffer } from "buffer";

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
    // 1. Read the file as Base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });

    // 2. Convert base64 → binary
    const fileBytes = Buffer.from(base64, "base64");

    // 3. File path in Supabase Storage
    const filename = `${albumCode}/${Date.now()}.jpg`;

    // 4. Upload to Supabase
    const { data, error } = await supabase.storage
      .from("snapshare-photos")
      .upload(filename, fileBytes, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }

    // 5. Get public URL
    const { data: publicData } = supabase.storage
      .from("snapshare-photos")
      .getPublicUrl(filename);

    const publicUrl = publicData.publicUrl;

    // 6. Save URL to Firestore album
    await updateDoc(doc(db, "albums", albumCode), {
      photos: arrayUnion(publicUrl),
    });

    return publicUrl;
  } catch (err) {
    console.error("Upload Error:", err);
    throw err;
  }
}