import React, {useEffect, useState} from 'react';
import {Text, Linking} from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import {useDispatch} from 'react-redux';
import {Home, Payment, PaymentResult, Result} from '../page';
import {setCurrRoute} from '../store/routeSlice';

const Stack = createStackNavigator();

const Router = props => {
  const forFade = ({current}) => ({
    cardStyle: {opacity: current.progress},
  });

  const navigationRef = useNavigationContainerRef();
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', e => {
      const route = navigationRef.getCurrentRoute();
      console.log('route??????????????', route);
      dispatch(setCurrRoute(route));
    });
  });

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShown: false,
        }}
        initialRouteName="Home">
        {/* 홈 화면 */}
        <Stack.Screen
          name="Home"
          component={Home}
          headerShown={false}
          options={{
            headerShown: false,
            cardStyleInterpolator: forFade,
            gestureDirection: 'horizontal',
          }}
        />
        {/* 결제 화면 */}
        <Stack.Screen
          name="Payment"
          headerShown={false}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
          component={Payment}
        />
        {/* 결제 완료 화면 */}
        <Stack.Screen
          name="PaymentResult"
          component={PaymentResult}
          headerShown={false}
          options={{
            headerShown: false,
            cardStyleInterpolator: forFade,
            gestureDirection: 'horizontal',
          }}
        />
        {/* Notification Action 결과 화면 */}
        <Stack.Screen
          name="Result"
          component={Result}
          headerShown={false}
          options={{
            headerShown: false,
            cardStyleInterpolator: forFade,
            gestureDirection: 'horizontal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Router;

Router.defatulProps = {
  userInfo: null,
};
