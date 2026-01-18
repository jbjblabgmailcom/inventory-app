import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import * as ImagePicker from "react-native-image-crop-picker";




export const pickImage = (setImageUri) => {
  ImagePicker.openPicker({
    width: 600,
    height: 400,
    cropping: true,
    includeBase64: false,
  })
    .then(async (image) => {
      console.log("Cropped file:", image.path);

      try {
        const savedUri = await CameraRoll.save(image.path, { type: 'photo' });
        console.log("Saved to gallery:", savedUri);
        setImageUri(savedUri);  // update state
      } catch (err) {
        console.log("CameraRoll error:", err);
      }
    })
    .catch((err) => {
      console.log("Image pick error:", err);
    });
};




export const takePhoto = async (setImageUri) => {
  try {
    const image = await ImagePicker.openCamera({
      width: 600,
      height: 400,
      cropping: true,
      includeBase64: false,
      forceJpg: true,       // optional but recommended
    });

    if (!image || !image.path) {
      console.warn("No image returned from camera.");
      return;
    }

    console.log("Captured & cropped file:", image.path);

    let savedUri;
    try {
      savedUri = await CameraRoll.save(image.path, { type: "photo" });
    } catch (saveErr) {
      console.error("Could not save to gallery:", saveErr);
      // still allow using local image.path
      setImageUri(image.path);
      return;
    }

    console.log("Saved to gallery:", savedUri);
    setImageUri(savedUri);

  } catch (err) {
    // user cancel / permission denied / other errors
    if (err?.message?.includes("cancelled") || err?.code === "E_PICKER_CANCELLED") {
      console.log("User cancelled camera.");
      return;
    }

    if (err?.message?.includes("permission")) {
      console.error("Camera or file permission denied:", err);
      Alert.alert("Permission error", "Camera or storage permission denied.");
      return;
    }

    console.error("Unexpected camera error:", err);
    Alert.alert("Error", "Could not take photo. Try again.");
  }
};