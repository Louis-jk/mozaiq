import React, {useRef} from 'react';
import {View, SafeAreaView, StatusBar, Dimensions} from 'react-native';
import {WebView} from 'react-native-webview';

const Result = ({webviewUrl}) => {
  const {height, width} = Dimensions.get('window');
  const webViews = useRef();

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="light-content" />
      <View style={{flex: 1, height: height}}>
        <WebView
          ref={webViews}
          textZoom={100}
          source={{uri: webviewUrl}}
          useWebKit={false}
          sharedCookiesEnabled
          // onMessage={webViews => onWebViewMessage(webViews)}
          // onNavigationStateChange={webViews =>
          //   onNavigationStateChange(webViews)
          // }
          // onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
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
        />
      </View>
    </SafeAreaView>
  );
};

export default Result;
