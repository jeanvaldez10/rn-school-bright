import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, Dimensions, Text } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { DrawerActions } from 'react-navigation-drawer';
import AttendanceCheckoutQRCodeTab from './AttendanceCheckoutQRCodeTab';
import AttendanceCheckoutStudentIDTab from './AttendanceCheckoutStudentIDTab';
import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';

import translang, { getCurrentLocale } from '../../utils/language.utils';
import CustomSwitcher from '../../components/CustomSwitcher';
import QrCodeCamera from '../../components/QrCodeCamera';
import CheckOutOnTimeModal from '../../components/CheckOutOnTimeModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import { ScrollView } from 'react-native-gesture-handler';
import CustomTextInput from '../../components/CustomTextInput';
import NextButton from '../../components/NextButton';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';

export default class AttendanceCheckOutNoTabScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      userInfo: null,
      tabIndex: 0,
      studentId: '',
      showCheckoutDataModal: false,
      isLoading: false,
    };

  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    console.log("camera is loading...");
    this.setState({isLoading: true});
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    const userInfo = await Storage.getUserInfo();
    this.setState({userInfo});

    setTimeout(() => {
      this.setState({isLoading: false});
    }, 2000)
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
  };

  back = () => {
    // this.props.navigation.goBack();
    this.props.navigation.navigate('App');
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };


  onChangeSwitcher = (index) => {
    this.setState({tabIndex: index});
  }

  barcodeRecognized = (result) => {
    if (this.state.qrcodeScanned || this.state.isLoading || this.state.showCheckoutDataModal || this.state.showModal) {
      return;
    }

    const studentId = result.data ?? '';

    if (studentId === '') {
      return;
    }

    ApiManager.getQRCodeDataWithID(this.state.userInfo.SchoolID, studentId, getCurrentLocale()).then(result => {
      this.setState({ isLoading: false });

      if (result.code === 200) {
        const dataList = result.qrcodeDataModels ?? [];
        if (dataList.length > 0) {
          this.setState({ qrcodeData:  dataList[0], studentId: studentId, qrcodeScanned: true, isLoading: false, showCheckoutDataModal: true });
        } else {
          this.setState({ showModal: true, modalBody: translang.t('USER_NOT_FOUND'), qrcodeScanned: false, isLoading: false});
        }
      } else {
        this.setState({ showModal: true, modalBody: translang.t('USER_NOT_FOUND'), qrcodeScanned: false, isLoading: false});
      }
    }).catch(error => {
      this.setState({ showModal: true, modalBody: translang.t('USER_NOT_FOUND'), qrcodeScanned: false, isLoading: false});
    });
  };

  getResult = () => {
    // this.setState({ isLoading: true });

    ApiManager.checkoutTime(this.state.userInfo.SchoolID, this.state.userInfo.ID, this.state.studentId, 0).then(result => {
      if (result.code === 200) {
        this.setState({ showModal: true, modalBody: translang.t('UPDATE_SUCCESS'), studentId: '', qrcodeScanned: false, isLoading: false});
      } else {
        this.setState({ showModal: true, modalBody: translang.t('USER_NOT_FOUND'), qrcodeScanned: false, isLoading: false});
      }
    }).catch(error => {
      this.setState({ showModal: true, modalBody: translang.t('USER_NOT_FOUND'), qrcodeScanned: false, isLoading: false});
    });
  };

  __next = () => {
    this.setState({ isLoading: true });
    ApiManager.getQRCodeDataWithID(this.state.userInfo.SchoolID, this.state.studentId, getCurrentLocale()).then(result => {
      this.setState({ isLoading: false });

      if (result.code === 200) {
        const dataList = result.qrcodeDataModels ?? [];
        if (dataList.length > 0) {
          this.setState({ qrcodeData:  dataList[0], showCheckoutDataModal: true });
        } else {
          this.setState({ showModal: true, modalBody: translang.t('USER_NOT_FOUND')});
        }
      } else {
        this.setState({ showModal: true, modalBody: translang.t('USER_NOT_FOUND')});
      }
    }).catch(error => {
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('USER_NOT_FOUND')});
    });
  };

  onClickNum = (number) => {
    let studentId = this.state.studentId;
    studentId = `${studentId}${number}`
    this.setState({ studentId });
  };

  onClickDelete = () => {
    let studentId = this.state.studentId;
    studentId = studentId.slice(0, -1);
    this.setState({ studentId });
  };

  onClickClear = () => {
    this.setState({ studentId: '' });
  };



  render() {
    const initialLayout = { width: Dimensions.get('window').width };

    const options = [
      { title: translang.t('QR_CODE')},
      { title: translang.t('STUDENT_ID')}
    ];

    const alertImage = this.state.modalBody === translang.t('UPDATE_SUCCESS') ? Images.checked : Images.alert_inbox;
    const alertButtonColor = this.state.modalBody === translang.t('UPDATE_SUCCESS') ? [Color.green_button_next_color1, Color.green_button_next_color2] : [Color.red_orange, Color.soft_red];


    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_checkout')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <CustomSwitcher
              dataList={options}
              selectedIndex={this.state.tabIndex ?? 0}
              onChangedSwitch={(index)=>this.onChangeSwitcher(index)}
              containerStyle = {{width: '90%', height: 50, marginTop: 20, marginBottom: 20}}
              radius = {20}
              textSize = {23}
            />

            {this.state.tabIndex == 0 &&
            <View style={{flex: 1}}>
              <QrCodeCamera onSuccess={this.barcodeRecognized}/>
            </View>}
            {this.state.tabIndex == 1 &&
            <View style={{flex: 1}}>
              <ScrollView>
                <Text style={styles.studentIdTitle}>{translang.t('ATTENDANCE_checkout_attendance')}</Text>
                <CustomTextInput
                  inputWrapperStyle={styles.enterStudentId}
                  inputStyle={{textAlign: 'center', fontSize: 28, fontWeight: 'normal', fontFamily: 'THSarabunNew',}}
                  placeholder={translang.t('ATTENDANCE_checkout_enter_studentid')}
                  placeholderTextColor={Color.n_default_gray}
                  onChangeText={this._onChangeUserName}
                  editable={false}
                  value={this.state.studentId}
                />

                <View style={{ flex: 1, marginHorizontal: 30 }}>
                  <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(1) }}><Text style={styles.eachNumTxt}>1</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(2) }}><Text style={styles.eachNumTxt}>2</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(3) }}><Text style={styles.eachNumTxt}>3</Text></TouchableOpacity>
                  </View>
                  <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(4) }}><Text style={styles.eachNumTxt}>4</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(5) }}><Text style={styles.eachNumTxt}>5</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(6) }}><Text style={styles.eachNumTxt}>6</Text></TouchableOpacity>
                  </View>
                  <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(7) }}><Text style={styles.eachNumTxt}>7</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(8) }}><Text style={styles.eachNumTxt}>8</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(9) }}><Text style={styles.eachNumTxt}>9</Text></TouchableOpacity>
                  </View>
                  <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={{...styles.eachNumContainer, backgroundColor: Color.transparent, elevation: 0}} activeOpacity={0.3} onPress={() => { this.onClickClear() }}><Text style={{...styles.eachNumTxt, fontSize: 30, color: Color.n_default_orange}}>{translang.t('COMMON_clear')}</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(0) }}><Text style={styles.eachNumTxt}>0</Text></TouchableOpacity>
                    <TouchableOpacity style={{...styles.eachNumContainer, backgroundColor: Color.transparent, elevation: 0}} activeOpacity={0.3} onPress={() => { this.onClickDelete() }}><Image source={Images.n_ic_arrow_left_orange} style={styles.backIcon} /></TouchableOpacity>
                  </View>
                </View>
                <NextButton
                  label={translang.t('COMMON_next')}
                  containerStyle={{width: '90%', marginLeft: 'auto', marginRight: 'auto', marginBottom: 10, }}
                  buttonStyle={{ height: 75, borderRadius: 38,}}
                  colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
                  isVerticalGradient={false}
                  _onPress={() => this.__next()} />
              </ScrollView>
            </View>}
        </View>

        <ProgressHud isVisible={this.state.isLoading} />

        <CheckOutOnTimeModal
          title={translang.t('CHECKOUT_ATTENDANCE')}
          isVisible={this.state.showCheckoutDataModal}
          data={this.state.qrcodeData}
          onCancel={() => this.setState({ showCheckoutDataModal: false, qrcodeScanned: false, isLoading: false, studentId: '' })}
          onOk={() => {
            this.setState({ showCheckoutDataModal: false });
            this.getResult();
          }}
        />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => this.setState({ showModal: false })}
        />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  tabBar: {
    width: '90%',
    height: 50,
    borderRadius: 20,

    marginVertical: 10,
    marginLeft: 'auto',
    marginRight: 'auto',

    backgroundColor: Color.white,
    shadowColor: 'black',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  tabView: {
    flex: 1,
  },

  eachNumContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: Color.n_default_brown,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  eachNumTxt: {
    fontFamily: 'THSarabunNew',
    fontSize: 54,
    color: Color.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  studentIDInputContainer: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    shadowColor: 'black',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    paddingVertical: 30,
  },
  studentIdTitle: {
    fontFamily: 'THSarabunNew',
    width: '100%',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    color: Color.n_default_gray,
    marginBottom: 15,
  },
  enterStudentId: {
    marginBottom: 10,
    marginHorizontal: 30,
    borderColor: Color.n_default_brown,
    borderRadius: 0,
    borderBottomWidth: 1,
  },
  backIcon: {
    height: 40,
    width: 40,
  },
});
