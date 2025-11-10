

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, Image, Button, Dimensions, Platform, StatusBar } from 'react-native';

const INITIAL_MEDIA = [
  { id: '1', uri: 'https://picsum.photos/seed/picsum1/400/400', uploader: 'Maya' },
  { id: '2', uri: 'https://picsum.photos/seed/picsum2/400/400', uploader: 'Anton' },
  { id: '3', uri: 'https://picsum.photos/seed/picsum3/400/400', uploader: 'Aarti' },
];


const createNewMediaItem = (currentCount) => {
  const newId = Date.now().toString(); 
  const seed = newId.slice(-5); 
  return {
    id: newId,
    uri: `https://picsum.photos/seed/${seed}/400/400`,
    uploader: 'You', 
  };
};

export default function UploadTest() {

  const [mediaItems, setMediaItems] = useState(INITIAL_MEDIA);

  useEffect(() => {

    if (mediaItems.length > INITIAL_MEDIA.length) {
      console.log('Album updated! A new photo was added.');
      console.log('Current number of photos:', mediaItems.length);
    }
  }, [mediaItems]); 

  const handleAddMedia = () => {
    const newItem = createNewMediaItem(mediaItems.length);
    
    setMediaItems(prevItems => [...prevItems, newItem]);
  };


  const renderItem = ({ item }) => (
    <View style={styles.mediaItemContainer}>
      <Image source={{ uri: item.uri }} style={styles.mediaImage} />
      <Text style={styles.uploaderText}>By: {item.uploader}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anton's BDAY</Text>
        <Text style={styles.headerSubtitle}>Join Code: XQ35G</Text>
      </View>

      {/* */}
      <FlatList
        data={mediaItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Simulate New Photo Upload"
          onPress={handleAddMedia}
          color="#F4A261"
        />
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const itemSize = (width / 3) - 10; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#264653',
    
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2A9D8F',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E9C46A',
    marginTop: 4,
  },
  gridContainer: {
    padding: 5,
  },
  mediaItemContainer: {
    width: itemSize,
    height: itemSize + 30,
    margin: 5,
    backgroundColor: '#2A9D8F',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: itemSize,
  },
  uploaderText: {
    color: 'white',
    fontSize: 12,
    padding: 5,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#264653',
  },
});