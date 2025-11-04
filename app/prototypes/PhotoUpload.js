import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function PhotoUpload() {
    const [selectedImage, setSelectedImage] = useState(null);

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

    return (
       <View>
            <Text> Photo Upload Prototype </Text>
            <Button title="Upload Photo" onPress={pickImage} />
            {selectedImage && (
                <View>
                <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200 }} />
                <Text> Uploaded by: You</Text>
                </View>
            )}
       </View>
    );
}