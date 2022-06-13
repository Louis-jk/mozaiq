import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  StatusBar,
  View,
  BackHandler,
  Alert,
  Linking,
  Dimensions
} from 'react-native'
import { WebView } from 'react-native-webview'

const PaymentResult = props => {
  const { height, width } = Dimensions.get('window')
  const { route, navigation } = props
  const { type, response } = route.params

  // 웹작업 토큰이 회원테이블에 있으면 자동로그인 없으면 로그인 페이지로 작업
  const domainUrl = 'mozaiq.kr'
  const appDomain = `https://${domainUrl}/`
  const url = appDomain + 'reservation_complete.php?merchant_uid='
  const [webviewUrl, setWebviewUrl] = React.useState(url)
  const [urls, setUrls] = useState('')
  const [isLoading, setLoading] = React.useState(true)
  const webViews = React.useRef()

  const handleBackButton = () => {
    console.log('navigation.isFocused()', navigation.isFocused())
    if (navigation.isFocused() === true) {
      // 다른 화면갔을경우 뒤로가기 막기 위한 요소
      Alert.alert('홈으로 이동하시겠습니까?', '', [
        { text: '네', onPress: () => navigation.navigate('Home') },
        { text: '아니요' }
      ])
      return true
    } else {
      return false
    }
  }

  useEffect(() => {
    // console.log('받아온 type :: ', type)
    // console.log('받아온 response :: ', response)

    if (type && response) {
      const newUrl = `${url}${response.merchant_uid}`

      // console.log('결제 완료 response :: ', response)
      // console.log('결제 완료 response.merchant_uid :: ', response.merchant_uid)
      // console.log('웹뷰 url 설정 값 :: ', newUrl)
      setWebviewUrl(newUrl)
      BackHandler.addEventListener('hardwareBackPress', handleBackButton)
      setLoading(false)
    } else {
      navigation.replace('Home')
      setLoading(false)
    }
  }, [type, response])

  const onNavigationStateChange = webViewState => {
    // console.log('webViewState.url ' + webViewState.url);
    if (!webViewState.url.includes(domainUrl)) {
      Linking.openURL(webViewState.url).catch(err => {
        console.log('onNavigationStateChange Linking.openURL', err)
      })
      webViews.current.stopLoading()
    }

    setUrls(webViewState.url)
    // 안드로이드 뒤로가기 버튼 처리
    BackHandler.addEventListener('hardwareBackPress', handleBackButton)
  };

  // console.log('webviewUrl은 ??', webviewUrl)

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle='light-content' />
      <View style={{ flex: 1, height: height }}>
        <WebView
          // ref={webViews}
          textZoom={100}
          source={{ uri: webviewUrl }}
          useWebKit={false}
          // sharedCookiesEnabled
          // onMessage={(webViews) => onWebViewMessage(webViews)}
          onNavigationStateChange={webViews =>
            onNavigationStateChange(webViews)}
          // onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          javaScriptEnabledAndroid
          allowFileAccess
          renderLoading
          // mediaPlaybackRequiresUserAction={false}
          setJavaScriptEnabled={false}
          scalesPageToFit
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          originWhitelist={['*']}
          javaScriptEnabled
        />
      </View>
    </SafeAreaView>
  )
};

export default PaymentResult
