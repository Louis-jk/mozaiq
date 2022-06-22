import React, {useState} from 'react';
import {
  SafeAreaView,
  ActivityIndicator,
  View,
  Alert,
  BackHandler,
} from 'react-native';
import IMP from 'iamport-react-native';
import {useSelector} from 'react-redux';

const Payment = props => {
  const {route, navigation} = props;
  const {params} = route;
  const {currRoute} = useSelector(state => state.routeReducer);

  console.log('Payment params ??', params);

  const Loading = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
      }}>
      <ActivityIndicator color="#0085CA" size="large" />
    </View>
  );
  /* [필수입력] 결제에 필요한 데이터를 입력합니다. */
  const data = {
    pg: params.pg,
    pay_method: params.pay_method,
    name: `${params?.name} `,
    merchant_uid: `${params.merchant_uid}`, // 상품 조회 키값으로 설정
    amount: params.amount,
    buyer_name: params.buyer_name,
    buyer_tel: params.buyer_tel,
    buyer_email: params.buyer_email,
    buyer_addr: params.buyer_addr,
    buyer_postcode: '',
    app_scheme: 'palroinApp',
    customer_uid: params?.customer_uid,
    digital: false,
    m_redirect_url: params.m_redirect_url,
  };

  const [visible, setVisible] = useState(false);

  const callback = response => {
    // console.log(response);

    const params = {
      response,
      type: 'payment',
    };

    console.log('payment response ::', response);

    if (response) {
      // navigation.replace('HomePage', params)

      if (response.imp_success === 'true') {
        navigation.replace('PaymentResult', params);
      }

      if (response.imp_success === 'false') {
        params.type = 'paymentError';
        navigation.replace('Home', params);
      }
    }
  };

  // React.useEffect(() => {
  //   if (currRoute.name === 'Payment') {
  //     const backAction = () => {
  //       Alert.alert(
  //         '결제를 취소하시겠습니까?',
  //         '',
  //         [
  //           {text: '아니요'},
  //           {
  //             text: '네',
  //             onPress: () => navigation.goBack(),
  //           },
  //         ],
  //         {
  //           cancelable: true,
  //         },
  //       );
  //       return true;
  //     };

  //     BackHandler.addEventListener('hardwareBackPress', backAction);
  //   }
  // });

  // const backAction = () => {
  //   return true
  //   // Alert.alert(
  //   //   '결제를 취소하시겠습니까?',
  //   //   '',
  //   //   [
  //   //     { text: '아니요' },
  //   //     {
  //   //       text: '네',
  //   //       onPress: () => navigation.goBack()
  //   //     }
  //   //   ],
  //   //   {
  //   //     cancelable: true
  //   //   }
  //   // )
  // };

  // BackHandler.addEventListener('hardwareBackPress', backAction)

  console.log('visible ??', visible);

  return (
    <SafeAreaView style={[{flex: 1, backgroundColor: '#fff'}]}>
      <IMP.Payment
        userCode={params?.usercode}
        loading={<Loading />}
        data={{
          ...data,
          app_scheme: 'palroinApp',
        }}
        callback={callback}
      />
    </SafeAreaView>
  );
};

export default Payment;
