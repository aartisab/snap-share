import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export default function PhotoUpload() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [permission, requestPermission] = ImagePicker.useMediaLibraryPermissions();

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert("Permission to access camera roll is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const downloadImage = async() => {
        if (!selectedImage) return;
        if (!permission || !permission.granted) {
            const {status} = await requestPermission();
            if (status !== 'granted') {
                alert('Permission to access media library is required!');
                return;
            }
        }

        try {
            await MediaLibrary.saveToLibraryAsync(selectedImage);
            alert('Image saved to media library!');
        } catch (error) {
            console.error('Error saving image: ', error);
            alert('Failed to save image.');
        }
    }

    return (
       <View>
            <Text> Photo Upload Prototype </Text>
            <Button title="Upload Photo" onPress={pickImage} />
            {selectedImage && (
                <View>
                <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200 }} />
                <Text> Uploaded by: You</Text>
                <Button title="Download Photo" onPress={downloadImage} />
                </View>
            )}
       </View>
    );
}
