import messaging from '@react-native-firebase/messaging'
import { Alert } from 'react-native'

export async function requestPermission () {
  const authStatus = await messaging().requestPermission()
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL

  if (enabled) {
    console.log('Authorization status:', authStatus)
    getFcmToken()
  }
}

const getFcmToken = async () => {
  try {
    const fcmToken = await messaging().getToken()
    console.log('fcm token generated', fcmToken)
    Alert.alert('fcm token generated', fcmToken)
  } catch (error) {
    console.log('error in fcmToken', error)
    Alert.alert('error in fcmToken', error)
  }
}
