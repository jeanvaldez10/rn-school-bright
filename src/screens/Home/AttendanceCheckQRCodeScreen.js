import React from 'react';
import {View, BackHandler, Alert} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import {SafeAreaView} from 'react-native-safe-area-context';
import Color from '../../constants/color';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import QrCodeCamera from '../../components/QrCodeCamera';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import CheckOutOnTimeModal from '../../components/CheckOutOnTimeModal';
import Images from '../../themes/Images';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';

export default class AttendanceCheckQRCodeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      qrcodeScanned: false,
      showModal: false,
      modalBody: null,
      showCheckoutDataModal: false,
      userInfo: {},
      studentId: '',
      qrcodeData: {},
      status: 0,    /// 0: on-time, 1: late
      active: true,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    this.setState({isLoading: true});
    setTimeout(() => {
      this.setState({isLoading: false});
    }, 2000);
    const {navigation} = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const status = this.props.navigation.getParam('status') ?? 0;
      const userInfo = this.props.navigation.getParam('userInfo');
      this.setState({userInfo, status});
      this.setState({isLoading: true, active: true});
      setTimeout(() => {
        this.setState({isLoading: false});
      }, 2000);
    });
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.isSelected !== this.props.isSelected && this.props.isSelected === true) {
      const userInfo = await Storage.getUserInfo();
      this.setState({userInfo});
      this.setState({isLoading: true});
      setTimeout(() => {
        this.setState({isLoading: false});
      }, 2000);
    }
  }

  componentWillUnmount() {

    if (this.backhandler) {
      this.backhandler.remove();
    }
    if (this.focusListener) {
      this.focusListener.remove();
    }
  }

  back = () => {
    this.setState({active: false}, () => {
      console.log("debug", this.state.active.toString());
    });

    if (this.backhandler) {
      this.backhandler.remove();
    }

    const from = this.props.navigation.getParam('from');
    if (from && from !== '') {
      this.props.navigation.navigate(from);
    } else {
      this.props.navigation.navigate('AttendanceCheckIn');
    }


  }

  barcodeRecognized = (result) => {
    const {qrcodeScanned, isLoading, showCheckoutDataModal, showModal, active} = this.state;
    // Alert.alert("debug", this.state.active.toString());
    if (qrcodeScanned || isLoading || showCheckoutDataModal || showModal || !active) {
      return;
    }
    // Alert.alert("not close", this.state.active.toString());

    const studentId = result.data ?? '';
    console.log("id:", studentId);
    if (studentId === '') {
      return;
    }
    this.setState({isLoading: true});
    ApiManager.getQRCodeDataWithID(this.state.userInfo.SchoolID, studentId, getCurrentLocale()).then(result => {
      if (result.code === 200) {
        const dataList = result.qrcodeDataModels ?? [];
        if (dataList.length > 0) {
          this.setState({
            qrcodeData: dataList[0],
            studentId: studentId,
            qrcodeScanned: true,
            isLoading: false,
            showCheckoutDataModal: true
          });
        } else {
          this.setState({
            showModal: true,
            modalBody: translang.t('USER_NOT_FOUND'),
            qrcodeScanned: false,
            isLoading: false
          });
        }
      } else {
        this.setState({
          showModal: true,
          modalBody: translang.t('USER_NOT_FOUND'),
          qrcodeScanned: false,
          isLoading: false
        });
      }
    }).catch(error => {
      this.setState({
        showModal: true,
        modalBody: translang.t('USER_NOT_FOUND'),
        qrcodeScanned: false,
        isLoading: false
      });
    });
  };

  getResult = () => {
    this.setState({isLoading: true});

    const status = this.state.status;

    let promise = null;

    if (status == 0) {
      promise = ApiManager.checkOnTime(this.state.userInfo.SchoolID, this.state.userInfo.ID, this.state.studentId, status);
    } else {
      promise = ApiManager.checkLateTime(this.state.userInfo.SchoolID, this.state.userInfo.ID, this.state.studentId, status);
    }

    promise.then(result => {
      if (result.code === 200) {
        this.setState({
          showModal: true,
          modalBody: translang.t('UPDATE_SUCCESS'),
          studentId: '',
          qrcodeScanned: false,
          isLoading: false,
          showCheckoutDataModal: false
        });
      } else {
        this.setState({
          showModal: true,
          modalBody: translang.t('USER_NOT_FOUND'),
          qrcodeScanned: false,
          isLoading: false,
          showCheckoutDataModal: false
        });
      }
    }).catch(error => {
      this.setState({
        showModal: true,
        modalBody: translang.t('USER_NOT_FOUND'),
        qrcodeScanned: false,
        isLoading: false,
        showCheckoutDataModal: false
      });
    });
  };

  render() {
    const alertImage = this.state.modalBody === translang.t('UPDATE_SUCCESS') ? Images.checked : Images.alert_inbox;
    const alertButtonColor = this.state.modalBody === translang.t('UPDATE_SUCCESS') ? [Color.green_button_next_color1, Color.green_button_next_color2] : [Color.red_orange, Color.soft_red];

    const title = this.state.status === 0 ? translang.t('ATTENDANCE_ontime_qr') : translang.t('ATTENDANCE_late_qr')
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={title}
          onMenuTap={() => this.back()}
        />

        {this.state.active &&
        <QrCodeCamera onSuccess={this.barcodeRecognized}/>
        }
        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => this.setState({showModal: false})}
        />
        <CheckOutOnTimeModal
          title={this.state.status == "0" ? translang.t('CHECK_ON_TIME') : translang.t('CHECK_IN_LATE')}
          isVisible={this.state.showCheckoutDataModal}
          data={this.state.qrcodeData}
          onCancel={() => this.setState({
            showCheckoutDataModal: false,
            qrcodeScanned: false,
            isLoading: false,
            studentId: ''
          })}
          onOk={() => {
            this.setState({showCheckoutDataModal: false});
            this.getResult();
          }}
        />
        <ProgressHud isVisible={this.state.isLoading}/>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
});
