import React, {useEffect} from 'react';
import {
  Text,
  TextInput,
  useColorScheme,
  View,
  Image,
  Platform,
  Alert,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import SplashScreen from 'react-native-splash-screen';
import Toast, {
  BaseToast,
  ErrorToast,
  ToastRef,
} from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import {store} from './src/store';
import {Provider} from 'react-redux';
import Router from './src/router/Router';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);
  }, []);

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });

  const toastConfig = {
    success: props => (
      <BaseToast
        {...props}
        style={{
          borderLeftWidth: 0,
          backgroundColor: '#000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 15,
        }}
        contentContainerStyle={{
          paddingHorizontal: 15,
        }}
        text1Style={{
          fontSize: 14,
          fontWeight: '400',
          color: '#fff',
        }}
        text2Style={{
          fontSize: 12,
          fontWeight: '400',
          color: '#fff',
        }}
        renderLeadingIcon={() => (
          <Image
            style={{width: 35, height: 35}}
            source={require('./src/images/logo_60.png')}
          />
        )}
        renderTrailingIcon={() => (
          <View style={{padding: 5, borderRadius: 5, backgroundColor: '#fff'}}>
            <Text style={{fontSize: 12, color: '#000'}}>이동</Text>
          </View>
        )}
      />
    ),

    error: props => (
      <ErrorToast
        {...props}
        style={{
          borderLeftWidth: 0,
          backgroundColor: '#B22727',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 15,
        }}
        contentContainerStyle={{paddingHorizontal: 15}}
        text1Style={{
          fontSize: 14,
          fontWeight: '400',
          color: '#fff',
        }}
        text2Style={{
          fontSize: 12,
          fontWeight: '400',
          color: '#fff',
        }}
        renderLeadingIcon={() => (
          <Image
            style={{width: 35, height: 35}}
            source={require('./src/images/logo_60.png')}
          />
        )}
        renderTrailingIcon={() => (
          <View style={{padding: 5, borderRadius: 5, backgroundColor: '#fff'}}>
            <Text style={{fontSize: 12, color: '#000'}}>이동</Text>
          </View>
        )}
      />
    ),

    tomatoToast: ({text1, props}) => (
      <View style={{height: 60, width: '100%', backgroundColor: 'tomato'}}>
        <Text>{text1}</Text>
        <Text>{props.uuid}</Text>
      </View>
    ),
  };

  return (
    <Provider store={store}>
      <Router />
      <Toast
        config={toastConfig}
        topOffset={Platform.OS === 'ios' ? 50 : 10}
        ref={ToastRef}
      />
    </Provider>
  );
};

export default App;
