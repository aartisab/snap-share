import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";

import {
  createAlbum,
  joinAlbum,
  subscribeToAlbum,
  uploadPhoto,
  addReactionToPhoto,
} from "./firebaseAlbumService";

const SCREENS = {
  HOME: "HOME",
  CREATE: "CREATE",
  JOIN: "JOIN",
  ALBUM: "ALBUM",
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PADDING = 24;
const GRID_GAP = 10;
const NUM_COLUMNS = 3;
const TILE_SIZE =
  (SCREEN_WIDTH - H_PADDING * 2 - GRID_GAP * NUM_COLUMNS) / NUM_COLUMNS;
const GRID_WIDTH = Math.min(
  SCREEN_WIDTH - H_PADDING * 2,
  TILE_SIZE * NUM_COLUMNS + GRID_GAP * NUM_COLUMNS
);
const DEFAULT_UPLOADER = "Unknown";
const REACTION_OPTIONS = [
  "😍",
  "😂",
  "🤩",
  "🔥",
  "🎉",
  "👍",
  "👏",
  "😭",
  "🤯",
  "😎",
];

const normalizePhotos = (album) =>
  (album?.photos ?? [])
    .map((photo) => {
      if (typeof photo === "string") {
        return { uri: photo, uploader: DEFAULT_UPLOADER };
      }

      const uri =
        typeof photo?.uri === "string" && photo.uri.length > 0
          ? photo.uri
          : null;
      if (!uri) return null;

      const rawUploader =
        typeof photo?.uploader === "string" ? photo.uploader.trim() : "";
      const uploader = rawUploader.length ? rawUploader : DEFAULT_UPLOADER;
      const reactions = Array.isArray(photo?.reactions)
        ? photo.reactions.filter(
            (reaction) => typeof reaction === "string" && reaction.length > 0
          )
        : [];

      return { uri, uploader, reactions };
    })
    .filter(Boolean);

export default function App() {
  const [user, setUser] = useState({
    displayName: "",
    albumName: "",
    albumCode: "",
    album: null,
  });

  const [screen, setScreen] = useState(SCREENS.HOME);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [selectedReaction, setSelectedReaction] = useState(
    REACTION_OPTIONS[0]
  );
  const [reactionMenuVisible, setReactionMenuVisible] = useState(false);
  const [reactionSending, setReactionSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const [viewerImageLoading, setViewerImageLoading] = useState(false);
  const [confettiBursts, setConfettiBursts] = useState([]);

  useEffect(() => {
    if (!user.albumCode) return;

    const unsub = subscribeToAlbum(user.albumCode, (updatedAlbum) => {
      setUser((prev) => ({ ...prev, album: updatedAlbum }));
    });

    return unsub;
  }, [user.albumCode]);

  useEffect(() => {
    const photos = normalizePhotos(user.album);
    if (!photos.length) {
      setViewerIndex(null);
      return;
    }
    if (viewerIndex !== null && viewerIndex > photos.length - 1) {
      setViewerIndex(photos.length - 1);
    }
  }, [user.album?.photos, viewerIndex]);

  useEffect(() => {
    setLoadedImages({});
  }, [user.album?.code]);

  useEffect(() => {
    if (viewerIndex === null) {
      setReactionMenuVisible(false);
      setViewerImageLoading(false);
      setConfettiBursts([]);
    } else {
      setViewerImageLoading(true);
    }
  }, [viewerIndex]);

  const openPhotoViewer = (startIndex = 0) => {
    const photos = normalizePhotos(user.album);
    if (!photos.length) return;
    const safeIndex = Math.min(Math.max(startIndex, 0), photos.length - 1);
    setViewerIndex(safeIndex);
    setViewerImageLoading(true);
    setSelectedReaction((prev) =>
      REACTION_OPTIONS.includes(prev) ? prev : REACTION_OPTIONS[0]
    );
  };

  const closePhotoViewer = () => setViewerIndex(null);

  const showPrevPhoto = () => {
    if (viewerIndex === null || viewerIndex === 0) return;
    setViewerIndex((prev) => (prev === null ? prev : prev - 1));
  };

  const showNextPhoto = () => {
    const photos = normalizePhotos(user.album);
    if (
      viewerIndex === null ||
      !photos.length ||
      viewerIndex >= photos.length - 1
    )
      return;
    setViewerIndex((prev) => (prev === null ? prev : prev + 1));
  };

  const toggleReactionMenu = () =>
    setReactionMenuVisible((prev) => !prev);

  const handleSelectReaction = (emoji) => {
    setSelectedReaction(emoji);
    setReactionMenuVisible(false);
  };

  const handleSendReaction = async () => {
    if (viewerIndex === null || !user.album || reactionSending) return;

    const trimmedReaction =
      typeof selectedReaction === "string" ? selectedReaction.trim() : "";
    if (!trimmedReaction) return;

    try {
      setReactionSending(true);
      await addReactionToPhoto(
        user.album.code,
        viewerIndex,
        trimmedReaction
      );
      triggerReactionBurst(trimmedReaction);
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Error",
        "Could not send reaction. Please try again."
      );
    } finally {
      setReactionSending(false);
    }
  };

  const markImageLoaded = (uri) => {
    if (!uri) return;
    setLoadedImages((prev) =>
      prev[uri] ? prev : { ...prev, [uri]: true }
    );
  };

  const triggerReactionBurst = (emoji) => {
    const count = 35;
    const newBurst = Array.from({ length: count }).map((_, i) => {
      const anim = new Animated.Value(0);
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 140;
      const translateX = distance * Math.cos(angle);
      const translateY = distance * Math.sin(angle) * -1;
      const rotation = Math.floor(Math.random() * 360);
      const scaleTo = 0.8 + Math.random() * 0.7;
      const delay = Math.random() * 150;
      const startX = (Math.random() - 0.5) * 200;
      const startY = (Math.random() - 0.5) * 200;
      return {
        id: `${Date.now()}-${i}`,
        emoji,
        anim,
        translateX,
        translateY,
        rotation,
        scaleTo,
        delay,
        startX,
        startY,
      };
    });

    setConfettiBursts((prev) => [...prev, ...newBurst]);

    newBurst.forEach((burst) => {
      Animated.timing(burst.anim, {
        toValue: 1,
        duration: 1200,
        delay: burst.delay,
        useNativeDriver: true,
      }).start(() => {
        setConfettiBursts((prev) => prev.filter((b) => b.id !== burst.id));
      });
    });
  };

  const handleCreateAlbum = async () => {
    const trimmedAlbumName = user.albumName.trim();
    const trimmedDisplayName = user.displayName.trim();

    if (!trimmedAlbumName) {
      Alert.alert("Missing info", "Please enter an album name.");
      return;
    }
    if (!trimmedDisplayName) {
      Alert.alert("Missing info", "Please enter your name.");
      return;
    }

    try {
      const album = await createAlbum(trimmedAlbumName);

      setUser((prev) => ({
        ...prev,
        albumName: album.name,
        albumCode: album.code,
        album: { ...album, photos: [] },
      }));

      setScreen(SCREENS.ALBUM);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not create album. Please try again.");
    }
  };

  const handleJoinAlbum = async () => {
    const trimmedCode = user.albumCode.trim().toUpperCase();
    const trimmedDisplayName = user.displayName.trim();

    if (!trimmedCode) {
      Alert.alert("Missing info", "Please enter a join code.");
      return;
    }
    if (!trimmedDisplayName) {
      Alert.alert("Missing info", "Please enter your name.");
      return;
    }

    try {
      const album = await joinAlbum(trimmedCode);

      if (!album) {
        Alert.alert("Error", "Invalid join code.");
        return;
      }

      setUser((prev) => ({
        ...prev,
        albumCode: trimmedCode,
        albumName: album.name,
        album,
      }));

      setScreen(SCREENS.ALBUM);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not join album. Please try again.");
    }
  };

  const getUploaderName = () => {
    const trimmedDisplayName =
      typeof user.displayName === "string" ? user.displayName.trim() : "";
    return trimmedDisplayName || "Guest";
  };

  const uploadAssets = async (assets) => {
    if (!user.album || !assets || !assets.length) return;
    const uploaderName = getUploaderName();
    try {
      setUploading(true);
      for (const asset of assets) {
        await uploadPhoto(user.album.code, asset.uri, uploaderName);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to upload some photos.");
    } finally {
      setUploading(false);
    }
  };

  const uploadFromLibrary = async () => {
    if (!user.album || uploading) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Media library permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 0,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await uploadAssets(result.assets);
    }
  };

  const captureWithCamera = async () => {
    if (!user.album || uploading) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Camera access is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await uploadAssets(result.assets);
    }
  };

  const handleUpload = () => {
    if (!user.album || uploading) return;
    Alert.alert("Upload Photo", "Choose a source", [
      { text: "Camera", onPress: () => captureWithCamera() },
      { text: "Photo Library", onPress: () => uploadFromLibrary() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleDownload = async (uri) => {
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Media library access is required.");
      return;
    }

    try {
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Saved", "Photo saved to your device.");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Error saving photo.");
    }
  };

  const handleDownloadAll = async () => {
    const photos = normalizePhotos(user.album);
    if (!photos.length) return;

    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Media library access is required.");
      return;
    }

    try {
      for (const photo of photos) {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
      }
      Alert.alert("Saved", "All photos have been downloaded.");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Some photos could not be saved.");
    }
  };

  const renderHome = () => (
    <LinearGradient
      colors={["#FFE4C4", "#C5D4FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.logo}>SnapShare</Text>
          <Text style={styles.userLabel}>
            Create and share photo albums instantly across devices.
          </Text>

          <View style={{ marginTop: 40 }}>
            <TouchableOpacity
              style={styles.primaryButtonLarge}
              onPress={() => setScreen(SCREENS.CREATE)}
            >
              <Text style={styles.primaryButtonText}>Create New Album</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButtonLarge}
              onPress={() => setScreen(SCREENS.JOIN)}
            >
              <Text style={styles.secondaryButtonText}>Join with Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderCreate = () => (
    <LinearGradient
      colors={["#FFE4C4", "#C5D4FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setScreen(SCREENS.HOME)}
        >
          <Text style={styles.backText}>‹ Home</Text>
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <View style={styles.formInner}>
            <Text style={styles.title}>New Album</Text>

            <View style={styles.formField}>
              <Text style={styles.label}>Album name:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Anton's BDAY"
                placeholderTextColor="#B5C0DC"
                value={user.albumName}
                onChangeText={(t) =>
                  setUser((prev) => ({ ...prev, albumName: t }))
                }
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Your name:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Anton Bakhurov"
                placeholderTextColor="#B5C0DC"
                value={user.displayName}
                onChangeText={(t) =>
                  setUser((prev) => ({ ...prev, displayName: t }))
                }
              />
            </View>

            <TouchableOpacity
              style={styles.primaryButtonLarge}
              onPress={handleCreateAlbum}
            >
              <Text style={styles.primaryButtonText}>Create Album</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderJoin = () => (
    <LinearGradient
      colors={["#FFE4C4", "#C5D4FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setScreen(SCREENS.HOME)}
        >
          <Text style={styles.backText}>‹ Home</Text>
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <View style={styles.formInner}>
            <Text style={styles.title}>Join Album</Text>

            <View style={styles.formField}>
              <Text style={styles.label}>Enter code:</Text>
              <TextInput
                style={styles.input}
                placeholder="Album code"
                placeholderTextColor="#B5C0DC"
                autoCapitalize="characters"
                value={user.albumCode}
                onChangeText={(t) =>
                  setUser((prev) => ({ ...prev, albumCode: t }))
                }
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Your name:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Anton Bakhurov"
                placeholderTextColor="#B5C0DC"
                value={user.displayName}
                onChangeText={(t) =>
                  setUser((prev) => ({ ...prev, displayName: t }))
                }
              />
            </View>

            <TouchableOpacity
              style={styles.primaryButtonLarge}
              onPress={handleJoinAlbum}
            >
              <Text style={styles.primaryButtonText}>Join Album</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderAlbum = () => {
    const photos = normalizePhotos(user.album);
    const hasPhotos = photos.length > 0;
    const gridData = hasPhotos ? [...photos, "__add_tile__"] : [];
    const currentPhoto =
      viewerIndex !== null && photos[viewerIndex] ? photos[viewerIndex] : null;
    const currentPhotoUri = currentPhoto?.uri ?? null;
    const currentUploader = currentPhoto?.uploader ?? DEFAULT_UPLOADER;
    const currentReactions = currentPhoto?.reactions ?? [];
    const canGoPrev = viewerIndex !== null && viewerIndex > 0;
    const canGoNext =
      viewerIndex !== null && viewerIndex < photos.length - 1;
    const viewerName =
      typeof user.displayName === "string" && user.displayName.trim().length
        ? user.displayName.trim()
        : "Guest";

    return (
      <LinearGradient
        colors={["#FFE4C4", "#C5D4FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeAreaAlbum}>
          {/* top row */}
          <View style={styles.albumTopRow}>
            <TouchableOpacity
              style={styles.albumHomeButton}
              onPress={() => setScreen(SCREENS.HOME)}
            >
              <Text style={styles.albumHomeText}>‹ Home</Text>
            </TouchableOpacity>
          </View>

          {/* centered title & code */}
          <View style={styles.albumHeader}>
            <Text style={styles.albumTitleBig}>{user.album?.name}</Text>
            <Text style={styles.albumCodeText}>
              Join Code: {user.album?.code}
            </Text>
          </View>

          <View style={styles.albumMain}>
            {!hasPhotos ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📷</Text>
                <Text style={styles.emptyTextLine1}>
                  No photos/videos yet...
                </Text>
                <Text style={styles.emptyTextLine2}>
                  Be the first one to add!
                </Text>
              </View>
            ) : (
              <FlatList
                data={gridData}
                keyExtractor={(item, i) =>
                  typeof item === "string"
                    ? `add-${i}`
                    : item.uri || `photo-${i}`
                }
                numColumns={NUM_COLUMNS}
                style={styles.gridList}
                contentContainerStyle={styles.gridContent}
                renderItem={({ item, index }) => {
                  if (item === "__add_tile__") {
                    return (
                      <TouchableOpacity
                        style={[
                          styles.addTile,
                          uploading && styles.addTileDisabled,
                        ]}
                        onPress={handleUpload}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <ActivityIndicator color="#3565F0" />
                            <Text style={styles.addLabel}>Uploading...</Text>
                          </>
                        ) : (
                          <>
                            <Text style={styles.addPlus}>+</Text>
                            <Text style={styles.addLabel}>Upload More</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    );
                  }

                  const isLoaded = !!loadedImages[item.uri];
                  return (
                    <TouchableOpacity
                      style={styles.gridImageWrapper}
                      onPress={() => openPhotoViewer(index)}
                      activeOpacity={0.85}
                    >
                      {!isLoaded && (
                        <View style={styles.imagePlaceholder}>
                          <ActivityIndicator color="#3565F0" />
                        </View>
                      )}
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.gridImage}
                        onLoad={() => markImageLoaded(item.uri)}
                      />
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
          {uploading && (
            <View style={styles.uploadingBanner}>
              <ActivityIndicator color="#3565F0" size="small" />
              <Text style={styles.uploadingText}>Uploading photos...</Text>
            </View>
          )}

          <View style={styles.albumBottom}>
            {hasPhotos ? (
              <View style={styles.bottomButtonsRow}>
                <TouchableOpacity
                  style={styles.viewAlbumButton}
                  onPress={() => openPhotoViewer(0)}
                >
                  <Text style={styles.viewAlbumText}>View Album</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.downloadAllButton}
                  onPress={handleDownloadAll}
                >
                  <Text style={styles.downloadAllText}>Download All</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.primaryButtonLarge,
                  uploading && styles.primaryButtonLargeDisabled,
                ]}
                onPress={handleUpload}
                disabled={uploading}
              >
                <Text style={styles.primaryButtonText}>
                  {uploading ? "Uploading..." : "Upload Photo/Video"}
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.viewerText}>
              Viewing album as <Text style={{ fontWeight: "700" }}>{viewerName}</Text>
            </Text>
          </View>
        </SafeAreaView>
        {viewerIndex !== null && currentPhotoUri && (
          <Modal
            transparent
            animationType="fade"
            visible
            onRequestClose={closePhotoViewer}
          >
            <View style={styles.viewerModalContainer}>
              <TouchableWithoutFeedback onPress={closePhotoViewer}>
                <View style={styles.viewerBackdrop} />
              </TouchableWithoutFeedback>
              <View style={styles.viewerCard}>
                <Text style={styles.viewerTitle}>{user.album?.name}</Text>
                <View style={styles.reactionRow}>
                  <Text style={styles.reactLabel}>React:</Text>
                  <View style={styles.reactPickerWrapper}>
                    <TouchableOpacity
                      style={styles.reactPickerButton}
                      onPress={toggleReactionMenu}
                    >
                      <Text style={styles.reactPickerEmoji}>
                        {selectedReaction}
                      </Text>
                      <Text style={styles.reactPickerCaret}>⌄</Text>
                    </TouchableOpacity>
                    {reactionMenuVisible && (
                      <View style={styles.reactDropdown}>
                        {REACTION_OPTIONS.map((emoji) => (
                          <TouchableOpacity
                            key={emoji}
                            style={styles.reactDropdownOption}
                            onPress={() => handleSelectReaction(emoji)}
                          >
                            <Text style={styles.reactDropdownEmoji}>
                              {emoji}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.reactSendButton,
                      reactionSending && styles.reactSendButtonDisabled,
                    ]}
                    onPress={handleSendReaction}
                    disabled={reactionSending}
                  >
                    <Text style={styles.reactSendButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.viewerImageWrapper}>
                  {viewerImageLoading && (
                    <View style={styles.viewerImageLoader}>
                      <ActivityIndicator color="#FFFFFF" />
                    </View>
                  )}
                  <Image
                    source={{ uri: currentPhotoUri }}
                    style={styles.viewerImage}
                    resizeMode="cover"
                    onLoadEnd={() => setViewerImageLoading(false)}
                  />
                  <View style={styles.confettiLayer} pointerEvents="none">
                    {confettiBursts.map((burst) => (
                      <Animated.Text
                        key={burst.id}
                        style={[
                          styles.confettiEmoji,
                          {
                            opacity: burst.anim.interpolate({
                              inputRange: [0, 0.8, 1],
                              outputRange: [1, 1, 0],
                            }),
                            transform: [
                              {
                              translateX: burst.anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [burst.startX, burst.startX + burst.translateX],
                              }),
                            },
                            {
                              translateY: burst.anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [burst.startY, burst.startY + burst.translateY],
                              }),
                            },
                              {
                              scale: burst.anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.7, burst.scaleTo],
                              }),
                            },
                              {
                                rotate: burst.anim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ["0deg", `${burst.rotation}deg`],
                                }),
                              },
                            ],
                          },
                        ]}
                      >
                        {burst.emoji}
                      </Animated.Text>
                    ))}
                  </View>
                  {currentReactions.length > 0 && (
                    <View style={styles.reactionStack}>
                      {currentReactions.slice(-6).map((reaction, idx) => (
                        <Text
                          key={`${reaction}-${idx}`}
                          style={styles.reactionEmoji}
                        >
                          {reaction}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
                <Text style={styles.viewerUploader}>
                  Uploaded by: {currentUploader}
                </Text>
                <View style={styles.viewerControls}>
                  <TouchableOpacity
                    style={[
                      styles.viewerControlButton,
                      !canGoPrev && styles.viewerControlButtonDisabled,
                    ]}
                    onPress={showPrevPhoto}
                    disabled={!canGoPrev}
                  >
                    <Text style={styles.viewerControlIcon}>‹</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.viewerControlButton}
                    onPress={() => handleDownload(currentPhotoUri)}
                  >
                    <Text style={styles.viewerControlIcon}>⤓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.viewerControlButton,
                      !canGoNext && styles.viewerControlButtonDisabled,
                    ]}
                    onPress={showNextPhoto}
                    disabled={!canGoNext}
                  >
                    <Text style={styles.viewerControlIcon}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </LinearGradient>
    );
  };

  if (screen === SCREENS.CREATE) return renderCreate();
  if (screen === SCREENS.JOIN) return renderJoin();
  if (screen === SCREENS.ALBUM && user.album) return renderAlbum();
  return renderHome();
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#3565F0",
    textAlign: "center",
  },
  userLabel: {
    marginTop: 12,
    fontSize: 18,
    color: "#4E5A7A",
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 24,
    alignSelf: "center",
  },

  primaryButtonLarge: {
    backgroundColor: "#3565F0",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
    minWidth: 260,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  primaryButtonLargeDisabled: {
    opacity: 0.6,
  },
  secondaryButtonLarge: {
    borderWidth: 2,
    borderColor: "#3565F0",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: "center",
    minWidth: 260,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  secondaryButtonText: {
    color: "#3565F0",
    fontSize: 18,
    fontWeight: "700",
  },

  backButton: {
    marginTop: 8,
  },
  backText: {
    fontSize: 16,
    color: "#3565F0",
    fontWeight: "600",
  },

  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formInner: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#3565F0",
    marginBottom: 32,
    textAlign: "center",
  },
  formField: {
    marginBottom: 18,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4E5A7A",
    marginBottom: 6,
  },
  input: {
    borderWidth: 2,
    borderColor: "#3565F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  /* album screen */
  safeAreaAlbum: {
    flex: 1,
    paddingHorizontal: H_PADDING,
  },
  albumTopRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 8,
  },
  albumHomeButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  albumHomeText: {
    fontSize: 16,
    color: "#3565F0",
    fontWeight: "600",
  },
  albumHeader: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: "center",          // <— center block
  },
  albumTitleBig: {
    fontSize: 30,
    fontWeight: "800",
    color: "#3565F0",
    textAlign: "center",           // <— center text
  },
  albumCodeText: {
    marginTop: 4,
    fontSize: 16,
    color: "#7F8BA8",
    textAlign: "center",           // <— center text
  },

  albumMain: {
    flex: 1,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    fontSize: 60,
    color: "#3565F0",
    marginBottom: 12,
  },
  emptyTextLine1: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3565F0",
  },
  emptyTextLine2: {
    fontSize: 16,
    color: "#4E5A7A",
    marginTop: 4,
  },
  
  gridList: {
    width: GRID_WIDTH,
    alignSelf: "center",
  },

  gridContent: {
    paddingBottom: 12,
    paddingTop: 4,
    paddingHorizontal: GRID_GAP / 2,
  },
  gridImageWrapper: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    marginHorizontal: GRID_GAP / 2,
    marginBottom: GRID_GAP,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#3565F0",
    backgroundColor: "rgba(53,101,240,0.08)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(53,101,240,0.08)",
  },
  gridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  uploadingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  uploadingText: {
    marginLeft: 8,
    color: "#3565F0",
    fontWeight: "600",
  },
  addTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3565F0",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: GRID_GAP / 2,
    marginBottom: GRID_GAP,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  addPlus: {
    fontSize: 30,
    color: "#3565F0",
    fontWeight: "700",
    marginBottom: 2,
    textAlign: "center",
  },
  addLabel: {
    fontSize: 12,
    color: "#3565F0",
    fontWeight: "600",
    textAlign: "center",
  },
  addTileDisabled: {
    opacity: 0.6,
  },

  viewerModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  viewerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  viewerCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: "#3565F0",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  viewerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#3565F0",
    marginBottom: 16,
  },
  reactionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  reactLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F38A45",
    marginRight: 10,
  },
  reactPickerWrapper: {
    position: "relative",
    marginRight: 12,
  },
  reactPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#3565F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "white",
    minWidth: 64,
    justifyContent: "space-between",
  },
  reactPickerEmoji: {
    fontSize: 20,
  },
  reactPickerCaret: {
    fontSize: 16,
    color: "#3565F0",
    marginLeft: 6,
  },
  reactDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: 6,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    width: 180,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  reactDropdownOption: {
    width: "33.33%",
    paddingVertical: 6,
    alignItems: "center",
  },
  reactDropdownEmoji: {
    fontSize: 22,
  },
  reactSendButton: {
    backgroundColor: "#3565F0",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  reactSendButtonDisabled: {
    opacity: 0.5,
  },
  reactSendButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  viewerImageWrapper: {
    width: "100%",
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#3565F0",
    position: "relative",
  },
  viewerImage: {
    width: "100%",
    aspectRatio: 3 / 4,
  },
  viewerImageLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  reactionStack: {
    position: "absolute",
    left: 8,
    bottom: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    maxWidth: "70%",
    zIndex: 3,
  },
  reactionEmoji: {
    fontSize: 24,
    marginRight: 4,
    marginBottom: 2,
  },
  viewerUploader: {
    fontSize: 16,
    color: "#F38A45",
    fontWeight: "700",
  },
  viewerControls: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 20,
  },
  viewerControlButton: {
    width: 64,
    height: 64,
    marginHorizontal: 12,
    backgroundColor: "#3565F0",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  viewerControlButtonDisabled: {
    opacity: 0.4,
  },
  viewerControlIcon: {
    color: "white",
    fontSize: 26,
    fontWeight: "800",
  },
  confettiLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: 2,
  },
  confettiEmoji: {
    fontSize: 34,
  },

  albumBottom: {
    paddingBottom: 24,
    paddingTop: 8,
    alignItems: "center",
  },
  bottomButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  viewAlbumButton: {
    backgroundColor: "#3565F0",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginRight: 12,
  },
  viewAlbumText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  downloadAllButton: {
    borderWidth: 2,
    borderColor: "#3565F0",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  downloadAllText: {
    color: "#3565F0",
    fontSize: 16,
    fontWeight: "700",
  },

  viewerText: {
    fontSize: 15,
    color: "#4E5A7A",
    marginBottom: 4,
    textAlign: "center",
  },
});
