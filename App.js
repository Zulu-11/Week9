import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Button, PermissionsAndroid } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { StatusBar } from 'expo-status-bar';
import RNFS from 'react-native-fs';

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [storagePermission, setStoragePermission] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Izin Kamera",
            message: "Aplikasi membutuhkan akses ke kamera",
            buttonNeutral: "Tanya Nanti",
            buttonNegative: "Batal",
            buttonPositive: "OK"
          }
        );
        
        const storageGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Izin Penyimpanan",
            message: "Aplikasi membutuhkan akses penyimpanan",
            buttonNeutral: "Tanya Nanti",
            buttonNegative: "Batal",
            buttonPositive: "OK"
          }
        );

        setCameraPermission(cameraGranted === PermissionsAndroid.RESULTS.GRANTED);
        setStoragePermission(storageGranted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn(err);
      }
    };

    requestPermissions();
  }, []);

  const saveToDevice = async (uri) => {
    try {
      const picturesDir = RNFS.PicturesDirectoryPath + '/MyAppPhotos';
      await RNFS.mkdir(picturesDir);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `photo_${timestamp}.jpg`;
      const destPath = `${picturesDir}/${filename}`;

      await RNFS.moveFile(uri, destPath);
      
      console.log('Foto tersimpan di:', destPath);
      alert(`Foto disimpan di:\nPictures/MyAppPhotos/${filename}`);
    } catch (error) {
      console.error('Gagal menyimpan:', error);
      alert('Gagal menyimpan foto!');
    }
  };

  const handleImageResponse = async (response) => {
    if (response.didCancel) {
      console.log('User membatalkan');
    } else if (response.error) {
      console.log('Error: ', response.error);
    } else if (response.assets && response.assets.length > 0) {
      const uri = response.assets[0].uri;
      setImageUri(uri);
      await saveToDevice(uri); 
    }
  };

  const handleCameraLaunch = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 2000,
      maxHeight: 2000,
      quality: 1,
      saveToPhotos: true,
    };
    launchCamera(options, handleImageResponse);
  };

  const handleGalleryOpen = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 2000,
      maxHeight: 2000,
      quality: 1,
    };
    launchImageLibrary(options, handleImageResponse);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aplikasi Kamera & Galeri</Text>
      
      {imageUri && (
        <Image 
          source={{ uri: imageUri }}
          style={styles.imagePreview}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Buka Kamera"
          onPress={handleCameraLaunch}
          disabled={!cameraPermission}
        />
        <Button
          title="Buka Galeri"
          onPress={handleGalleryOpen}
        />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imagePreview: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 15,
    width: '80%',
  }
});