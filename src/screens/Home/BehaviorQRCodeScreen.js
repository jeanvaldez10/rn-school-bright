import React from 'react';
import { View, BackHandler} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default class BehaviorQRCodeScreen extends React.Component {
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
      type: 0,    /// 0: add, 1: reduce
      active: true,
    };
  }
  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const type = this.props.navigation.getParam('type') ?? 0;
      const userInfo = this.props.navigation.getParam('userInfo') ?? {};
      this.setState({userInfo, type});

      this.setState({isLoading: true,  active: true});
      setTimeout(()=>{
        this.setState({isLoading: false});
      }, 2000);

    })
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.isSelected !== this.props.isSelected && this.props.isSelected === true) {
      const userInfo = await Storage.getUserInfo();
      this.setState({userInfo});

      this.setState({isLoading: true});
      setTimeout(()=>{
        this.setState({isLoading: false});
      }, 2000);
    }
  }

  componentWillUnmount() {
    if(this.backhandler){
        this.backhandler.remove();
      }

    if(this.focusListener){
      this.focusListener.remove();
    }

  }

  back = () => {
    this.setState({active: false}, ()=>{
      console.log("debug", this.state.active.toString());
    });
    if(this.backhandler){
      this.backhandler.remove();
    }

    const from = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(from);
  }

  barcodeRecognized = (result) => {
    if (this.state.qrcodeScanned || this.state.isLoading || this.state.showCheckoutDataModal || this.state.showModal || !this.state.active) {
      return;
    }

    const studentId = result.data ?? '';

    if (studentId === '') {
      return;
    }

    this.setState({ isLoading: true });
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
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('USER_NOT_FOUND'), qrcodeScanned: false});
    });
  };

  getResult = () => {
    const type = this.state.type;
    const selectedStudents = this.state.qrcodeData;

    const tempStudent = [{
      FirstNameTH: selectedStudents.name,
      LastNameTH: selectedStudents.lastname,
      FirstNameEN: selectedStudents.name,
      LastNameEN: selectedStudents.lastname,
      StudentPicture: selectedStudents.picture,
      StudentID: selectedStudents.studentId}];

    const params = {
      classLevel: this.state.classLevel,
      classRoom: this.state.classRoom,
      students: tempStudent,
      isReduce: type == 1,
      parent: 'BehaviorQRCode',
      'isRefresh': true,
      userInfo: this.state.userInfo };
    this.props.navigation.navigate('BehaviorEdit', params);
  };

  render() {
    const alertImage = this.state.modalBody === translang.t('UPDATE_SUCCESS') ? Images.checked : Images.alert_inbox;
    const alertButtonColor = this.state.modalBody === translang.t('UPDATE_SUCCESS') ? [Color.green_button_next_color1, Color.green_button_next_color2] : [Color.red_orange, Color.soft_red];

    const title = this.state.type == 0 ? translang.t('ADD_SCORE_SCAN_QR_CODE') : translang.t('REDUCE_SCORE_SCAN_QR_CODE')
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
          onClose={() => this.setState({ showModal: false })}
        />
        <CheckOutOnTimeModal
          title={this.state.type == 0 ? translang.t('DRAWER_add_behavior'):translang.t('DRAWER_reduce_behavior')}
          isVisible={this.state.showCheckoutDataModal}
          data={this.state.qrcodeData}
          onCancel={() => this.setState({ showCheckoutDataModal: false, qrcodeScanned: false, isLoading: false })}
          onOk={() => {
            this.setState({qrcodeScanned: false, isLoading: false, showCheckoutDataModal: false, active: false});
            this.getResult();
          }}
        />
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.n_background_white
    },
});
