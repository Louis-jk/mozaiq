import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  Image,
  BackHandler,
  Alert,
  Linking,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {WebView} from 'react-native-webview';
import Toast from 'react-native-toast-message';
import {useSelector} from 'react-redux';

// import iid from '@react-native-firebase/iid'
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import queryString from 'query-string';
import {Settings, LoginManager, Profile} from 'react-native-fbsdk-next';

const Home = props => {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      Settings.setAppID('1369382873562859');
      Settings.initializeSDK();
    }
  }, []);

  // useEffect(() => {
  //   if (Platform.OS === 'ios') {
  //     window.addEventListener('message', () => {
  //       const params = JSON.stringify({
  //         type: 'iphone',
  //         data: '',
  //       });
  //       webViews.current.postMessage(params);

  //       console.log('웹뷰 보내는 param', params);
  //     });
  //   }
  // }, []);

  const {height} = Dimensions.get('window');
  const {route, navigation} = props;

  const {currRoute} = useSelector(state => state.routeReducer);

  // 웹작업 토큰이 회원테이블에 있으면 자동로그인 없으면 로그인 페이지로 작업
  const domainUrl = 'mozaiq.kr';
  const appDomain = `https://${domainUrl}/`;
  const url = appDomain + 'auth.php?chk_app=Y&app_token=';
  const [webviewUrl, setWebviewUrl] = useState(url);
  const [urls, setUrls] = useState('ss');
  const [isLoading, setLoading] = useState(false);
  const [userAgent, setUserAgent] = useState('');
  const [navState, setNavState] = useState();
  const [isSNSLogin, setSNSLogin] = useState(false);

  const webViews = React.useRef();

  useEffect(() => {
    Linking.getInitialURL() // 최초 실행 시에 Universal link 또는 URL scheme요청이 있었을 때 여기서 찾을 수 있음
      .then(value => {
        const replaceUrl = value.replace('mozaiq://', '');
        const fullUrl = `https://${replaceUrl}`;
        setWebviewUrl(fullUrl);
      });

    const linkEvent = Linking.addEventListener('url', e => {
      // 앱이 실행되어있는 상태에서 요청이 왔을 때 처리하는 이벤트 등록
      const replaceUrl = e.url.replace('mozaiq://', '');
      const fullUrl = `https://${replaceUrl}`;

      setWebviewUrl(fullUrl);

      const redirectTo = 'window.location = "' + fullUrl + '"';
      webViews.current.injectJavaScript(redirectTo);
    });

    return () => {
      linkEvent.remove();
    };
  }, []);

  const onRemoteNotification = notification => {
    const isClicked = notification.getData().userInteraction === 1;

    if (isClicked) {
      // Navigate user to another screen
    } else {
      // Do something else with push notification
    }
  };

  // 기기토큰 가져오기
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      // console.log('Authorization status:', authStatus);
      getToken();
    }
  };

  const getToken = async () => {
    messaging()
      .getToken()
      .then(token => {
        // console.log('FCM token >> ', token);

        if (token) {
          const type = route.params?.type;
          const response = route.params?.response;

          if (response) {
            const query = queryString.stringify(response);
            if (type === 'payment') {
              const impURL = url + token + '&' + query;
              // console.log('impURL ', impURL)
              setWebviewUrl(impURL);
            }

            if (type === 'paymentError') {
              const redirectUrl = `${appDomain}payment_fail.php?error_msg=${response.error_msg}`;
              // console.log('결제 취소 실패 redirectUrl ', redirectUrl)
              setWebviewUrl(redirectUrl);
            }
          } else {
            setWebviewUrl(url + token);

            // const redirectTo = 'window.location = "' + url + token + '"';
            // webViews.current.injectJavaScript(redirectTo);
          }

          return true;
        } else {
          return false;
        }
      })
      .catch(error => console.error('token Error:', error));
  };

  useEffect(() => {
    // 푸시 갯수 초기화
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
    } else {
      PushNotification.setApplicationIconBadgeNumber(0);
    }

    requestUserPermission();

    setLoading(true);

    return messaging().onTokenRefresh(token => {
      setWebviewUrl(url + token);
    });
  }, []);

  PushNotification.configure({
    onNotification: notification => {
      if (notification) {
        console.log(notification);
      }
    },
  });

  useEffect(() => {
    // 푸시메세지 처리

    // 포그라운드 상태
    messaging().onMessage(remoteMessage => {
      if (remoteMessage) {
        // 푸시 data 에 intent값 으로 웹뷰에 스크립트 처리
        let newURL = '';
        if (remoteMessage.data.intent) {
          newURL = remoteMessage.data.intent;
        }
        const redirectTo = 'window.location = "' + newURL + '"';

        Toast.show({
          type: remoteMessage.data.type,
          text1: remoteMessage.notification.title,
          text2: remoteMessage.notification.body,
          onPress: () => webViews.current.injectJavaScript(redirectTo),
        });
      }
    });

    // 백그라운드 상태
    messaging().onNotificationOpenedApp(remoteMessage => {
      if (Platform.OS === 'ios') {
        PushNotificationIOS.addNotificationRequest({
          id: remoteMessage.messageId,
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body,
          repeats: false,
        });
      }

      if (remoteMessage) {
        // 푸시 data 에 intent값 으로 웹뷰에 스크립트 처리
        let newURL = '';
        if (remoteMessage.data.intent) {
          newURL = remoteMessage.data.intent;
        }
        const redirectTo = 'window.location = "' + newURL + '"';

        webViews.current.injectJavaScript(redirectTo);
      }
    });

    // 종료상태
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          if (Platform.OS === 'ios') {
            PushNotificationIOS.addNotificationRequest({
              id: remoteMessage.messageId,
              title: remoteMessage.notification.title,
              body: remoteMessage.notification.body,
              repeats: false,
            });
          }

          // 푸시 data 에 intent값 으로 웹뷰에 스크립트 처리
          let newURL = '';
          if (remoteMessage.data.intent) {
            newURL = remoteMessage.data.intent;
          }
          const redirectTo = 'window.location = "' + newURL + '"';
          webViews.current.injectJavaScript(redirectTo);

          // Alert.alert(
          //   remoteMessage.notification.title,
          //   '내용을 확인하시겠습니까?',
          //   [
          //     { text: '아니요' },
          //     {
          //       text: '네',
          //       onPress: () => webViews.current.injectJavaScript(redirectTo)
          //     }
          //   ]
          // )
        }
      })
      .catch(error => console.error('FCM messaging error::', error));
  }, []);

  // facebook
  const getFbProfile = () => {
    Profile.getCurrentProfile().then(function (currentProfile) {
      if (currentProfile) {
        console.log(
          'The current logged user is: ' +
            currentProfile.name +
            '. His profile id is: ' +
            currentProfile.userID,
        );

        const params = JSON.stringify({
          type: 'facebook_login',
          data: currentProfile,
        });

        webViews.current.postMessage(params);
      }
    });
  };

  const onWebViewMessage = async webViews => {
    const jsonData = JSON.parse(webViews.nativeEvent.data);

    if (
      jsonData.type === 'sns_login' &&
      jsonData.act !== 'login' &&
      jsonData.login_type !== 'facebook'
    ) {
      setTimeout(() => {
        setSNSLogin(true);
      }, 500);
    } else {
      setSNSLogin(false);
    }

    if (jsonData.act === 'useragent') {
      setUserAgent(jsonData.useragent);
    }

    if (jsonData?.type === 'Payment') {
      navigation.navigate('Payment', {
        ...jsonData.data,
        usercode: jsonData.usercode,
        beforePath: urls,
      });
    }

    if (jsonData.act === 'login' && jsonData.login_type === 'facebook') {
      // setSNSLogin(true);
      LoginManager.logInWithPermissions(['public_profile']).then(
        function (result) {
          if (result.isCancelled) {
            console.log('Login cancelled');
          } else {
            console.log(
              'Login success with permissions: ' +
                result.grantedPermissions.toString(),
            );
            getFbProfile();
          }
        },
        function (error) {
          console.log('Login fail with error: ' + error);
        },
      );
    } else {
      setSNSLogin(false);
    }
  };

  const handleBackButton = () => {
    // 제일 첫페이지에서 뒤로가기시 어플 종료
    if (navigation.isFocused() === true) {
      // 다른 화면갔을경우 뒤로가기 막기 위한 요소

      if (urls === appDomain || urls === `${appDomain}login.php`) {
        Alert.alert(
          '어플을 종료할까요?',
          '',
          [
            {text: '아니요'},
            {text: '네', onPress: () => BackHandler.exitApp()},
          ],
          {
            cancelable: true,
          },
        );
      } else if (navState) {
        webViews.current.goBack();
      } else {
        return false;
      }
      return true;
    } else {
      return false;
    }
  };

  const onNavigationStateChange = webViewState => {
    // if (!webViewState.url.includes(domainUrl)) {
    //   Linking.openURL(webViewState.url).catch(err => {
    //     console.log('onNavigationStateChange Linking.openURL', err);
    //   });
    //   webViews.current.stopLoading();
    // }

    const {url} = webViewState;

    setNavState(webViewState.canGoBack);
    setUrls(webViewState.url);

    // 안드로이드 뒤로가기 버튼 처리
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
  };

  const onShouldStartLoadWithRequest = event => {
    const {url, lockIdentifier} = event;
    const URIJS = require('urijs');
    const uri = new URIJS(url);

    if (
      /* && react-native-webview 버전이 v10.8.3 이상 */
      event.lockIdentifier === 0
    ) {
      /**
       * [feature/react-native-webview] 웹뷰 첫 렌더링시 lockIdentifier === 0
       * 이때 무조건 onShouldStartLoadWithRequest를 true 처리하기 때문에
       * Error Loading Page 에러가 발생하므로
       * 강제로 lockIdentifier를 1로 변환시키도록 아래 네이티브 코드 호출
       */
      webViews.onShouldStartLoadWithRequestCallback(
        false,
        event.lockIdentifier,
      );
    }

    console.log('uri ??', uri);

    if (
      event.url.startsWith('mozaiq://') ||
      event.url.startsWith('http://') ||
      event.url.startsWith('https://') ||
      event.url.startsWith('about:blank')
    ) {
      if (uri.hostname() !== '' && uri.hostname() !== 'm.facebook.com') {
        let chkUri = 'Y';

        if (uri.hostname() === domainUrl) {
          chkUri = 'N';
        }
        // if (uri.hostname() === 'mozaiq-aos.firebaseapp.com') {
        //   chkUri = 'N'
        //   // setWebviewUrl(`https://${uri.hostname()}`)
        // }
        // if (uri.hostname() === 'accounts.google.com') {
        //   chkUri = 'N'
        //   setWebviewUrl(`https://${uri.hostname()}`)
        // }
        // if (uri.hostname() === 'accounts.youtube.com') {
        //   chkUri = 'N'
        //   setWebviewUrl(`https://${uri.hostname()}`)
        // }
        // if (uri.hostname() === 'myaccount.google.com') {
        //   chkUri = 'N'
        //   setWebviewUrl(`https://${uri.hostname()}`)
        // }
        if (uri.hostname() !== 'postcode.map.daum.net') {
          chkUri = 'N';
        }
        if (uri.hostname() !== 'kauth.kakao.com') {
          chkUri = 'N';
        }
        if (uri.hostname() !== 'appleid.apple.com') {
          chkUri = 'N';
        }
        if (uri.hostname() !== 'nid.naver.com') {
          chkUri = 'N';
        }
        if (uri.hostname() !== 'mobile.inicis.com') {
          chkUri = 'N';
        }
        if (uri.hostname() !== 'service.iamport.kr') {
          chkUri = 'N';
        }
        if (uri.hostname() !== 'ksmobile.inicis.com') {
          chkUri = 'N';
        }
        if (uri.hostname() !== 'mozaiq-aos.firebaseapp.com') {
          chkUri = 'N';
        }
        if (uri.hostname() !== 'accounts.google.com') {
          chkUri = 'N';
        }
        if (uri.hostname() !== 'firebaseapp.com') {
          chkUri = 'N';
        }
        if (uri.hostname() !== 'apis.google.com ') {
          chkUri = 'N';
        }

        // if (uri.hostname() === 'accounts.kakao.com') {
        //   chkUri = 'Y';
        // }
        if (uri.hostname() === 'bizmessage.kakao.com') {
          chkUri = 'Y';

          //plusfriend/home/@{channelSearchId}
          kakaoplus: return false;
        }
        if (uri.hostname() === 'bizmessage.kakao.com/chat') {
          chkUri = 'Y';
          return false;
        }

        if (chkUri === 'Y') {
          // Alert.alert('새창')

          Linking.openURL(event.url).catch(err => {
            console.log('onShouldStartLoadWithRequest Linking.openURL', err);
          });
          return false;
        }
      }

      if (uri.hostname() === 'm.facebook.com') {
        console.log('페이스북 로그인 시도');
      }

      return true;
    }
    if (
      event.url.startsWith('tel:') ||
      event.url.startsWith('mailto:') ||
      event.url.startsWith('maps:') ||
      event.url.startsWith('geo:') ||
      event.url.startsWith('sms:')
    ) {
      Linking.openURL(event.url).catch(er => {
        console.log('Failed to open Link: ' + er.message);
      });
      return false;
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="light-content" />

      <View
        style={{
          flex: 1,
          height: height,
        }}>
        {/* SNS 로그인 시 뒤로가기 버튼 표시 */}
        {isSNSLogin && (
          <View style={{backgroundColor: '#fff', paddingVertical: 10}}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
              onPress={() => webViews.current.goBack()}>
              <Image
                source={require('../../src/images/top_back.png')}
                style={{
                  width: 40,
                  height: 30,
                  resizeMode: 'contain',
                  marginLeft: 10,
                }}
              />
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>뒤로가기</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* // SNS 로그인 시 뒤로가기 버튼 표시 */}

        <WebView
          ref={webViews}
          textZoom={100}
          source={{uri: webviewUrl}}
          userAgent={
            urls.indexOf('accounts.google.com') > 0 && Platform.OS === 'android'
              ? 'mozilla/5.0 (linux; android 6.0; nexus 5 build/mra58n) applewebkit/537.36 (khtml, like gecko) chrome/102.0.5005.61 mobile safari/537.36'
              : userAgent
          }
          useWebKit={false}
          sharedCookiesEnabled
          onMessage={webViews => onWebViewMessage(webViews)}
          onNavigationStateChange={webViews =>
            onNavigationStateChange(webViews)
          }
          javaScriptEnabledAndroid
          allowFileAccess
          renderLoading
          mediaPlaybackRequiresUserAction={false}
          setJavaScriptEnabled={false}
          scalesPageToFit
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          originWhitelist={['*']}
          javaScriptEnabled
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          allowsBackForwardNavigationGestures
          // startInLoadingState
          scrollEnabled
          setSupportMultipleWindows
          javaScriptCanOpenWindowsAutomatically
          thirdPartyCookiesEnabled
          geolocationEnabled
          domStorageEnabled
          pullToRefreshEnabled={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default Home;
