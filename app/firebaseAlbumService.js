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

export function generateJoinCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createAlbum(name) {
  const code = generateJoinCode();

  await setDoc(doc(db, "albums", code), {
    name,
    code,
    photos: [],
  });

  return { name, code };
}

export async function joinAlbum(code) {
  const ref = doc(db, "albums", code);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return snap.data();
}

export function subscribeToAlbum(code, callback) {
  const ref = doc(db, "albums", code);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

export async function uploadPhoto(albumCode, uri, uploader = "Unknown") {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });
    const fileBytes = Buffer.from(base64, "base64");
    const filename = `${albumCode}/${Date.now()}.jpg`;
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
    const { data: publicData } = supabase.storage
      .from("snapshare-photos")
      .getPublicUrl(filename);

    const publicUrl = publicData.publicUrl;
    const uploaderName =
      typeof uploader === "string" && uploader.trim().length > 0
        ? uploader.trim()
        : "Unknown";

    const photoEntry = {
      uri: publicUrl,
      uploader: uploaderName,
      reactions: [],
    };

    await updateDoc(doc(db, "albums", albumCode), {
      photos: arrayUnion(photoEntry),
    });

    return photoEntry;
  } catch (err) {
    console.error("Upload Error:", err);
    throw err;
  }
}

export async function addReactionToPhoto(albumCode, photoIndex, reaction) {
  if (!albumCode || typeof photoIndex !== "number" || photoIndex < 0) return;

  const trimmedReaction =
    typeof reaction === "string" ? reaction.trim() : "";
  if (!trimmedReaction) return;

  const ref = doc(db, "albums", albumCode);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const photos = Array.isArray(data.photos) ? [...data.photos] : [];

  if (!photos[photoIndex]) return;

  const photoEntry = photos[photoIndex];
  const existingReactions = Array.isArray(photoEntry.reactions)
    ? [...photoEntry.reactions]
    : [];
  existingReactions.push(trimmedReaction);

  photos[photoIndex] = {
    ...photoEntry,
    reactions: existingReactions,
  };

  await updateDoc(ref, { photos });
}
