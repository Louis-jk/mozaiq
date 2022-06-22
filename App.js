import React, { useEffect } from 'react'
import {
  Text,
  TextInput,
  useColorScheme,
  View,
  Image,
  Platform,
  Alert
} from 'react-native'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import SplashScreen from 'react-native-splash-screen'
import Toast, {
  BaseToast,
  ErrorToast,
  ToastRef
} from 'react-native-toast-message'
import messaging from '@react-native-firebase/messaging'
import { store } from './src/store'
import { Provider } from 'react-redux'
import Router from './src/router/Router'
import notifee, {
  AndroidImportance,
  EventType,
  AuthorizationStatus
} from '@notifee/react-native'

Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.allowFontScaling = false

TextInput.defaultProps = TextInput.defaultProps || {}
TextInput.defaultProps.allowFontScaling = false

const App = () => {
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide()
    }, 1000)
  }, [])

  const displayNotification = async message => {
    console.log('App get remote message', message)

    const channelAnoucement = await notifee.createChannel({
      id: 'mozaiq',
      name: 'channel01',
      lights: false,
      visibility: true,
      importance: AndroidImportance.DEFAULT
    })

    if (Platform.OS === 'android') {
      await notifee.displayNotification({
        title: message.data.title,
        body: message.data.body,
        android: {
          channelId: channelAnoucement,
          // pressAction: message.data.intent,
          id: message.data.intent,
          smallIcon: 'ic_launcher' //
        }
      })
    } else {
      await notifee.displayNotification({
        title: message.data.title,
        body: message.data.body,
        ios: {
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true
          },
          attachments: {
            // Remote image
            url: 'https://cdn.dribbble.com/users/1061675/screenshots/14274177/media/871e64ccc581114bb7a2fb423339fb27.png?compress=1&resize=400x300&vertical=top'
          }
        }
      })
    }

    await notifee
      .incrementBadgeCount()
      .then(() => notifee.getBadgeCount())
      .then(count => console.log('Badge count incremented by 1 to: ', count))
  };

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    // console.log('Message handled in the background!', remoteMessage)
    displayNotification(remoteMessage)
  })

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail

    // Check if the user pressed the "Mark as read" action
    if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {
      // Decrement the count by 1
      await notifee.decrementBadgeCount()

      // Remove the notification
      await notifee.cancelNotification(notification.id)
    }
  })

  const toastConfig = {
    success: props => {
      console.log('success Toast props', props)
      return (
        <BaseToast
          {...props}
          style={{
            borderLeftWidth: 0,
            backgroundColor: '#000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 15
          }}
          contentContainerStyle={{
            paddingHorizontal: 15
          }}
          text1Style={{
            fontSize: 14,
            fontWeight: '400',
            color: '#fff'
          }}
          text2Style={{
            fontSize: 12,
            fontWeight: '400',
            color: '#fff'
          }}
          renderLeadingIcon={() => (
            <Image
              style={{ width: 35, height: 35 }}
              source={require('./src/images/logo_60.png')}
            />
          )}
          renderTrailingIcon={() => (
            <View
              style={{ padding: 5, borderRadius: 5, backgroundColor: '#fff' }}
            >
              <Text style={{ fontSize: 12, color: '#000' }}>이동</Text>
            </View>
          )}
        />
      )
    },

    error: props => (
      <ErrorToast
        {...props}
        style={{
          borderLeftWidth: 0,
          backgroundColor: '#B22727',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 15
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 14,
          fontWeight: '400',
          color: '#fff'
        }}
        text2Style={{
          fontSize: 12,
          fontWeight: '400',
          color: '#fff'
        }}
        renderLeadingIcon={() => (
          <Image
            style={{ width: 35, height: 35 }}
            source={require('./src/images/logo_60.png')}
          />
        )}
        renderTrailingIcon={() => (
          <View style={{ padding: 5, borderRadius: 5, backgroundColor: '#fff' }}>
            <Text style={{ fontSize: 12, color: '#000' }}>이동</Text>
          </View>
        )}
      />
    ),

    tomatoToast: ({ text1, props }) => {
      console.log('props', props)
      return (
        <View style={{ height: 60, width: '100%', backgroundColor: 'tomato' }}>
          <Text>{text1}</Text>
          <Text>{props.uuid}</Text>
        </View>
      )
    }
  }

  return (
    <Provider store={store}>
      <Router />
      <Toast
        config={toastConfig}
        topOffset={Platform.OS === 'ios' ? 50 : 10}
        ref={ToastRef}
      />
    </Provider>
  )
};

export default App
