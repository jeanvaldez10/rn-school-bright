import React from 'react';
import { View, } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import QrCodeCamera from '../../components/QrCodeCamera';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import CheckOutOnTimeModal from '../../components/CheckOutOnTimeModal';
import Images from '../../themes/Images';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';

export default class AttendanceCheckoutQRCodeTab extends React.Component {
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
    };
  }

  async componentDidMount() {
    const userInfo = await Storage.getUserInfo();
    this.setState({userInfo});
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.isSelected !== this.props.isSelected && this.props.isSelected === true) {
      const userInfo = await Storage.getUserInfo();
      this.setState({userInfo});
    }
  }

  componentWillUnmount() {

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
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('USER_NOT_FOUND'), qrcodeScanned: false, isLoading: false});
    });
  };

  getResult = () => {
    // this.setState({ isLoading: true });

    ApiManager.checkoutTime(this.state.userInfo.SchoolID, this.state.userInfo.ID, this.state.studentId, 0).then(result => {
      if (result.code === 200) {
        this.setState({ isLoading: false, showModal: true, modalBody: translang.t('UPDATE_SUCCESS'), studentId: '', qrcodeScanned: false, isLoading: false});
      } else {
        this.setState({ isLoading: false, showModal: true, modalBody: translang.t('USER_NOT_FOUND'), qrcodeScanned: false, isLoading: false});
      }
    }).catch(error => {
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('USER_NOT_FOUND'), qrcodeScanned: false, isLoading: false});
    });
  };

  render() {
    const alertImage = this.state.modalBody === translang.t('UPDATE_SUCCESS') ? Images.checked : Images.alert_inbox;
    const alertButtonColor = this.state.modalBody === translang.t('UPDATE_SUCCESS') ? [Color.green_button_next_color1, Color.green_button_next_color2] : [Color.red_orange, Color.soft_red];

    return (
      <View style={styles.container}>
        <QrCodeCamera onSuccess={this.barcodeRecognized}/>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => this.setState({ showModal: false })}
        />
        <CheckOutOnTimeModal
          isVisible={this.state.showCheckoutDataModal}
          data={this.state.qrcodeData}
          onCancel={() => this.setState({ showCheckoutDataModal: false, qrcodeScanned: false, isLoading: false })}
          onOk={() => {
            this.setState({ showCheckoutDataModal: false });
            this.getResult();
          }}
        />
        <ProgressHud isVisible={this.state.isLoading} />
      </View>
    );
  }
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
    },
});
