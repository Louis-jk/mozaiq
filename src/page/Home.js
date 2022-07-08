import React, { useState, useEffect } from 'react'
import firebase from '@react-native-firebase/app'
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
  TouchableOpacity
} from 'react-native'
import { WebView } from 'react-native-webview'
import Toast from 'react-native-toast-message'
import { useSelector } from 'react-redux'
import SendIntentAndroid from 'react-native-send-intent'

// import iid from '@react-native-firebase/iid'
import messaging from '@react-native-firebase/messaging'
import PushNotification from 'react-native-push-notification'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import notifee, { AndroidImportance, EventType } from '@notifee/react-native'

import queryString from 'query-string'
import {
  Settings,
  LoginManager,
  Profile,
  AccessToken
} from 'react-native-fbsdk-next'

const Home = props => {
  const { height } = Dimensions.get('window')
  const { route, navigation } = props

  const { currRoute } = useSelector(state => state.routeReducer)

  // 웹작업 토큰이 회원테이블에 있으면 자동로그인 없으면 로그인 페이지로 작업
  const domainUrl = 'mozaiq.kr'
  const appDomain = `https://${domainUrl}`
  const url = appDomain + '/auth.php?chk_app=Y&app_token='
  const UniversalLink = `https://${domainUrl}/share.php?url=mozaiq://`
  // const url = appDomain + ''
  const [webviewUrl, setWebviewUrl] = useState(url)
  // const [webviewUrl, setWebviewUrl] = useState('')
  const [urls, setUrls] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [userAgent, setUserAgent] = useState('')
  const [navState, setNavState] = useState()
  const [isSNSLogin, setSNSLogin] = useState(false)

  const webViews = React.useRef()

  // const firebaseConfig = {
  //   apiKey: 'AIzaSyCRtAXmRNy_bRlBSkN1L5x59LZr59dKeGg',
  //   authDomain: 'mozaiq-aos.firebaseapp.com',
  //   projectId: 'mozaiq-aos',
  //   storageBucket: 'mozaiq-aos.appspot.com',
  //   messagingSenderId: '205343874302',
  //   appId: '1:205343874302:web:f9bcb07e5bf685123259af',
  //   measurementId: 'G-6HZ1R6TZVK'
  // }

  // firebase.initializeApp(firebaseConfig)

  useEffect(() => {
    if (Platform.OS === 'ios') {
      Settings.setAppID('1369382873562859')
      Settings.initializeSDK()
    }
  }, [])

  // 기기토큰 가져오기
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission({
      alert: true,
      sound: true,
      announcement: false,
      badge: true
    })
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (enabled) {
      // console.log('Authorization status:', authStatus);
      getToken()
    }
  }

  const getToken = async () => {
    messaging()
      .getToken()
      .then(token => {
        console.log('FCM token::', token)

        if (token) {
          const type = route.params?.type
          const response = route.params?.response

          console.log('token response', response)

          if (response) {
            const query = queryString.stringify(response)
            if (type === 'payment') {
              const impURL = url + token + '&' + query
              // console.log('impURL ', impURL)
              setWebviewUrl(impURL)
            }

            if (type === 'paymentError') {
              const redirectUrl = `${appDomain}payment_fail.php?error_msg=${response.error_msg}`
              // console.log('결제 취소 실패 redirectUrl ', redirectUrl)
              setWebviewUrl(redirectUrl)
            }
          } else {
            const newUrl = url + token
            if (webviewUrl !== newUrl) {
              setWebviewUrl(newUrl)
              // webViews.current.injectJavaScript(newUrl)
            }

            // console.count('token ?', token)
            // console.log('token ?', token)
            // console.count('newUrl ?', newUrl)
            // console.log('newUrl ?', newUrl)

            // setWebviewUrl(url + token)
            // const redirectUrl = url + token
            // webViews.current.injectJavaScript(redirectUrl)

            // const redirectTo = 'window.location = "' + url + token + '"';
            // webViews.current.injectJavaScript(redirectTo);
          }

          return false
        } else {
          return false
        }
      })
      .catch(error => console.error('token Error:', error))
  };

  useEffect(() => {
    // 푸시 갯수 초기화
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(0)
    } else {
      PushNotification.setApplicationIconBadgeNumber(0)
    }

    requestUserPermission()

    setLoading(true)

    // return messaging().onTokenRefresh(token => {
    //   setWebviewUrl(url + token)
    // })
  }, [])

  useEffect(() => {
    Linking.getInitialURL() // 최초 실행 시에 Universal link 또는 URL scheme요청이 있었을 때 여기서 찾을 수 있음
      .then(value => {
        console.log('Linking.getInitialURL value ?', value)
        if (value) {
          const replaceUrl = value.replace('mozaiq://', '')
          const fullUrl = `https://${replaceUrl}`
          setWebviewUrl(fullUrl)
        } else {
          return false
        }
      })
      .catch(err => console.error('linking error', err))

    const linkEvent = Linking.addEventListener('url', e => {
      console.log('iOS link event comming ?')
      console.log('Linking.addEventListener url ?', e)
      // 앱이 실행되어있는 상태에서 요청이 왔을 때 처리하는 이벤트 등록
      const { url: linkUrl } = e

      console.log('linkUrl ::', linkUrl)

      if (linkUrl.includes(`${appDomain}/share.php?url=mozaiq://`)) {
        const replaceUrl = linkUrl.replace(
          `${appDomain}/share.php?url=mozaiq://`,
          ''
        )
        const fullUrl = `https://${replaceUrl}`
        const redirectTo = 'window.location = "' + fullUrl + '"'
        webViews.current.injectJavaScript(redirectTo)
      }

      if (linkUrl.startsWith('mozaiq://')) {
        console.log('포함')
        const replaceUrl = linkUrl.replace('mozaiq://', '')
        const fullUrl = `https://${replaceUrl}`
        const redirectTo = 'window.location = "' + fullUrl + '"'
        webViews.current.injectJavaScript(redirectTo)
      }
    })

    return () => {
      linkEvent.remove()
    };
  }, [])

  // PushNotification.configure({
  //   onRegister: function (token) {
  //     console.log('TOKEN:', token)
  //   },
  //   onNotification: function (notification) {
  //     console.log('NOTIFICATION:', notification)
  //     notification.finish(PushNotificationIOS.FetchResult.NoData)
  //   },
  //   onAction: function (notification) {
  //     console.log('ACTION:', notification.action)
  //     console.log('NOTIFICATION:', notification)
  //   },
  //   onRegistrationError: function (err) {
  //     console.error(err.message, err)
  //   },
  //   permissions: {
  //     alert: true,
  //     badge: true,
  //     sound: true
  //   },
  //   popInitialNotification: true,
  //   requestPermissions: true
  // })

  // const localNotification = remoteMessage => {
  //   const {notification, data, messageId} = remoteMessage;

  //   console.log('remoteMessage??', remoteMessage);
  //   console.log('notification??', notification);
  //   const options =
  //     Platform.OS === 'ios'
  //       ? {
  //           title: notification.title,
  //           message: notification.body || '',
  //           userInfo: data,
  //         }
  //       : {
  //           channelId: notification.android.channelId,
  //           largeIcon: '@drawable/splash_image',
  //           smallIcon: '@drawable/splash_image',
  //           bigPictureUrl: notification.android.imageUrl,
  //           largeIconUrl: notification.android.imageUrl,
  //           // picture: notification.android.imageUrl,
  //           bigText: notification.body || '',
  //           subText: notification.title,
  //           title: notification.title,
  //           message: notification.body || '',
  //           userInfo: data,
  //           messageId,
  //           priority: 'high',
  //           importance: 'high',
  //           // actions: ['보러가기'],
  //         };
  //   PushNotification.localNotification(options);
  // };

  useEffect(() => {
    notifee.setBadgeCount(0).then(() => console.log('Badge count removed'))

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));

      // localNotification(remoteMessage);

      let newURL = ''
      if (remoteMessage.data.intent) {
        newURL = remoteMessage.data.intent
      }
      const redirectTo = 'window.location = "' + newURL + '"'

      // console.log('remoteMessage', remoteMessage)
      // console.log('redirectTo', redirectTo)

      Toast.show({
        type: remoteMessage.data.type,
        text1: remoteMessage.notification.title,
        text2: remoteMessage.notification.body,
        onPress: () => webViews.current.injectJavaScript(redirectTo)
      })
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    // 백그라운드 상태
    messaging().onNotificationOpenedApp(remoteMessage => {
      // console.log('ios remoteMessage', remoteMessage)

      // if (Platform.OS === 'ios') {
      //   PushNotificationIOS.addNotificationRequest({
      //     id: remoteMessage.messageId,
      //     title: remoteMessage.notification.title,
      //     body: remoteMessage.notification.body,
      //     repeats: false,
      //     userInfo: remoteMessage
      //   })
      // }

      if (remoteMessage) {
        // 푸시 data 에 intent값 으로 웹뷰에 스크립트 처리
        let newURL = ''
        if (remoteMessage.data.intent) {
          newURL = remoteMessage.data.intent
        }
        const redirectTo = 'window.location = "' + newURL + '"'

        webViews.current.injectJavaScript(redirectTo)
      }
    })

    // 종료상태
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          // if (Platform.OS === 'ios') {
          //   PushNotificationIOS.addNotificationRequest({
          //     id: remoteMessage.messageId,
          //     title: remoteMessage.notification.title,
          //     body: remoteMessage.notification.body,
          //     repeats: false,
          //     userInfo: remoteMessage,
          //   });
          // }

          // 푸시 data 에 intent값 으로 웹뷰에 스크립트 처리
          let newURL = ''
          if (remoteMessage.data.intent) {
            newURL = remoteMessage.data.intent
          }
          const redirectTo = 'window.location = "' + newURL + '"'
          webViews.current.injectJavaScript(redirectTo)

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
      .catch(error => console.error('FCM messaging error::', error))
  }, [])

  // facebook
  const getFbProfile = () => {
    Profile.getCurrentProfile().then(currentProfile => {
      if (currentProfile) {
        console.log(
          'The current logged user is: ' +
            currentProfile.name +
            '. His profile id is: ' +
            currentProfile.userID
        )

        const params = JSON.stringify({
          type: 'facebook_login',
          data: currentProfile
        })

        webViews.current.postMessage(params)

        // console.count('페이스 북 로그인 postMessage? ', params)
        // console.log('페이스 북 가나? ', params)
      }
    })
  };

  const facebookLogin = param => {
    webViews.current.postMessage(param)
  };

  const onWebViewMessage = async webViews => {
    if (webViews) {
      // console.count('webview message ??', webViews)
      console.log('webview message ??', webViews)

      const jsonData = JSON.parse(webViews.nativeEvent.data)

      console.log('webview message jsonData ??', jsonData)

      if (
        jsonData.type === 'sns_login' &&
        jsonData.act !== 'login' &&
        jsonData.login_type !== 'facebook'
      ) {
        setTimeout(() => {
          setSNSLogin(true)
        }, 500)
      } else {
        setSNSLogin(false)
      }

      if (jsonData.act === 'useragent') {
        setUserAgent(`${jsonData.useragent}`)
      }

      if (jsonData?.type === 'Payment') {
        navigation.navigate('Payment', {
          ...jsonData.data,
          usercode: jsonData.usercode,
          beforePath: urls
        })
      }

      if (jsonData.act === 'logout' && jsonData.logout_type === 'facebook') {
        // Alert.alert('페이스북 로그아웃?')
        LoginManager.logOut()
      }

      if (jsonData.act === 'login' && jsonData.login_type === 'facebook') {
        console.log('FACEBOOK LOGIN PRESS!!')
        console.log('FACEBOOK LOGIN PRESS!! jsonData act', jsonData.act)
        console.log(
          'FACEBOOK LOGIN PRESS!! jsonData.login_type',
          jsonData.login_type
        )
        LoginManager.logInWithPermissions(['public_profile', 'email']).then(
          async result => {
            // console.time('페이스북 로그인 result', result)

            if (result.isCancelled) {
              console.log('Login cancelled')
            } else {
              console.log('페이스북 로그인 성공 result', result)
              console.log(
                'Login success with permissions: ' +
                  result.grantedPermissions.toString()
              )
              const fbAccessToken =
                await AccessToken.getCurrentAccessToken().then(data => {
                  console.log(
                    'facebook accessToken',
                    data.accessToken.toString()
                  )
                  getFbProfile()
                })
            }
          },
          error => {
            console.log('Login fail with error: ' + error)
          }
        )
      } else {
        setSNSLogin(false)
      }
    }
  }

  const handleBackButton = () => {
    // 제일 첫페이지에서 뒤로가기시 어플 종료
    if (navigation.isFocused() === true) {
      // 다른 화면갔을경우 뒤로가기 막기 위한 요소

      if (urls === appDomain || urls === `${appDomain}login.php`) {
        Alert.alert(
          '어플을 종료할까요?',
          '',
          [
            { text: '아니요' },
            { text: '네', onPress: () => BackHandler.exitApp() }
          ],
          {
            cancelable: true
          }
        )
      } else if (navState) {
        webViews.current.goBack()
      } else {
        return false
      }
      return true
    } else {
      return false
    }
  }

  const onNavigationStateChange = webViewState => {
    // if (!webViewState.url.includes(domainUrl)) {
    //   Linking.openURL(webViewState.url).catch(err => {
    //     console.log('onNavigationStateChange Linking.openURL', err);
    //   });
    //   webViews.current.stopLoading();
    // }

    const { url, canGoBack } = webViewState

    setNavState(canGoBack)
    setUrls(url)

    // 안드로이드 뒤로가기 버튼 처리
    BackHandler.addEventListener('hardwareBackPress', handleBackButton)
  };

  // const goChatKakaoIos = async () => {
  //   await RNKakaoPlusFriend.chat('@mozaiq')
  // };

  const onShouldStartLoadWithRequest = event => {
    // console.count('webview onShouldStartLoadWithRequest :: ', event)

    const { url, lockIdentifier } = event
    const URIJS = require('urijs')
    const uri = new URIJS(url)

    // iOS의 경우 이쪽으로 들어옴
    if (url.includes(UniversalLink)) {
      const replaceUrl = url.replace(
        `${appDomain}/share.php?url=mozaiq://`,
        ''
      )
      const fullUrl = `https://${replaceUrl}`
      const redirectTo = 'window.location = "' + fullUrl + '"'
      webViews.current.injectJavaScript(redirectTo)
      return false
    }

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
        event.lockIdentifier
      )
    }

    console.log('uri ??', uri)

    if (
      event.url.startsWith('mozaiq://') ||
      event.url.startsWith('http://') ||
      event.url.startsWith('https://') ||
      event.url.startsWith('about:blank')
    ) {
      // 테스팅
      console.log('uri.hostname() ?', uri.hostname())
      const l01 = uri.hostname() === 'bizmessage.kakao.com'
      const l02 = uri.hostname() === 'bizmessage.kakao.com/chat'
      console.log('l01 ?', l01)
      console.log('l02 ?', l02)
      // 테스팅

      if (uri.hostname() !== '' && uri.hostname() !== 'm.facebook.com') {
        let chkUri = 'Y'

        if (uri.hostname() === domainUrl) {
          chkUri = 'N'
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
          chkUri = 'N'
        }
        if (uri.hostname() !== 'kauth.kakao.com') {
          chkUri = 'N'
        }
        if (uri.hostname() !== 'appleid.apple.com') {
          chkUri = 'N'
        }
        if (uri.hostname() !== 'nid.naver.com') {
          chkUri = 'N'
        }
        if (uri.hostname() !== 'mobile.inicis.com') {
          chkUri = 'N'
        }
        if (uri.hostname() !== 'service.iamport.kr') {
          chkUri = 'N'
        }
        if (uri.hostname() !== 'ksmobile.inicis.com') {
          chkUri = 'N'
        }
        if (uri.hostname() !== 'mozaiq-aos.firebaseapp.com') {
          chkUri = 'N'
        }
        if (uri.hostname() !== 'accounts.google.com') {
          chkUri = 'N'
        }
        if (uri.hostname() !== 'firebaseapp.com') {
          chkUri = 'N'
        }
        if (uri.hostname() !== 'apis.google.com') {
          chkUri = 'N'
        }
        if (uri.hostname() !== 'design.happytalkio.com') {
          chkUri = 'N'
        }

        // if (uri.hostname() === 'accounts.kakao.com') {
        //   chkUri = 'Y';
        // }
        if (
          uri.hostname() === 'bizmessage.kakao.com' ||
          uri.hostname() === 'bizmessage.kakao.com/chat'
        ) {
          chkUri = 'Y'

          if (Platform.OS === 'ios') {
            // kakaoplus://plusfriend/home/@{channelSearchId}
            // 'kakaoplus://plusfriend/talk/bot/@mozaiq/챗봇 시작'
            // kakaoplus://plusfriend/home/@mozaiq
            // goChatKakaoIos()
            // KakaoSDK.Channel.chat('@mozaiq')
            //   .then(res => console.log('channel addFriends res', res))
            //   .catch(err => console.log('channel addFriends error', err))
            Linking.openURL('kakaoplus://plusfriend/talk/chat/@mozaiq').catch(
              err => {
                console.log(
                  'onShouldStartLoadWithRequest Linking.openURL',
                  err
                )
              }
            )
            // webViews.current.goBack()
            return false
          }

          // plusfriend/home/@{channelSearchId}
          if (Platform.OS === 'android') {
            SendIntentAndroid.openAppWithUri(
              'kakaoplus://plusfriend/home/mozaiq'
            )
            return false
          }
        }

        if (chkUri === 'Y') {
          // Alert.alert('새창')

          Linking.openURL(event.url).catch(err => {
            console.log('onShouldStartLoadWithRequest Linking.openURL', err)
          })
          return false
        }
      }

      if (uri.hostname() === 'm.facebook.com') {
        console.log('페이스북 로그인 시도')
      }

      return true
    }
    if (
      event.url.startsWith('tel:') ||
      event.url.startsWith('mailto:') ||
      event.url.startsWith('maps:') ||
      event.url.startsWith('geo:') ||
      event.url.startsWith('sms:')
    ) {
      Linking.openURL(event.url).catch(er => {
        console.log('Failed to open Link: ' + er.message)
      })
      return false
    }
  }

  console.log('webviewUrl', webviewUrl)
  console.log('urls', urls)
  console.log(
    'urls.indexOf accounts.google.com ',
    urls.indexOf('accounts.google.com')
  )
  console.log('Platform.OS ', Platform.OS)
  console.log('Platform.OS android ?', Platform.OS === 'android')

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle='light-content' />

      <View
        style={{
          flex: 1,
          height: height
        }}
      >
        {/* SNS 로그인 시 뒤로가기 버튼 표시 */}
        {isSNSLogin && (
          <View style={{ backgroundColor: '#fff', paddingVertical: 10 }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center'
              }}
              onPress={() => webViews.current.goBack()}
            >
              <Image
                source={require('../../src/images/top_back.png')}
                style={{
                  width: 40,
                  height: 30,
                  resizeMode: 'contain',
                  marginLeft: 10
                }}
              />
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>뒤로가기</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* // SNS 로그인 시 뒤로가기 버튼 표시 */}

        <WebView
          ref={webViews}
          textZoom={100}
          source={{ uri: webviewUrl }}
          userAgent={userAgent}
          useWebKit={false}
          sharedCookiesEnabled
          onMessage={webViews => onWebViewMessage(webViews)}
          onNavigationStateChange={webViews =>
            onNavigationStateChange(webViews)}
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
  )
};

export default Home
