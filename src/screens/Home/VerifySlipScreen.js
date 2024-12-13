import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import GradientButton from '../../components/GradientButton';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import CustomModal from '../../components/CustomModal';
import LeaveReasonListModal from '../../components/LeaveReasonListModal';
import CalendarModal from '../../components/CalendarModal';
import SelectListModal from '../../components/SelectListModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import NextButton from '../../components/NextButton';
import Storage from '../../managers/StorageManager';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import moment from 'moment';
import { ScrollView } from 'react-native-gesture-handler';
import NetInfo from "@react-native-community/netinfo";
import ApiManager from "../../managers/ApiManager";
import LeaveInfoModal from '../../components/LeaveInfoModal';

export default class VerifySlipScreen extends React.Component {

  typeList = [
    { title: translang.t('VERIFY_SLIP_TYPE_TOPUP'), value: 0 },
    { title: translang.t('VERIFY_SLIP_TYPE_TUITION'), value: 1 },
  ];

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      showTypeModal: false,
      showDateModal: false,
      selectedType: null,
      selectedDate: null,
    };
  }

  handleBackButton = () => {
    if(this.state.showDateModal){
      this.setState({showDateModal: false});
    }else{
      this.back();
      return true;
    }
  };

  unsubscribe = null;

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
    // this.unsubscribe();
  };

  back = () => {
    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  __next = async () => {

    const { selectedType, selectedDate } = this.state;

    if (selectedType == null) {
      this.setState({ showModal: true, modalBody: translang.t('FILL_IN_THE_DETAIL') });
      // this.setState({ showModal: true, modalBody: translang.t('LEAVE_msg_leavereason') });
      return;
    }
    if (selectedDate == null) {
      this.setState({ showModal: true, modalBody: translang.t('FILL_IN_THE_DETAIL') });
      // this.setState({ showModal: true, modalBody: translang.t('LEAVE_msg_startingdate') });
      return;
    }

    const params = {
      type: this.state.selectedType,
      date: this.state.selectedDate,
    }
    this.props.navigation.navigate('VerifySlipPaymentList', params);
  };

  _onChangeType = () => {
    this.setState({
      showTypeModal: true,
    });
  };
  onTypeSelect = (item, index) => {
    if (item == null) {
      this.setState({ showTypeModal: false })
    } else {
      this.setState({ showTypeModal: false, selectedType: item })
    }
  };

  _onChangeStartingDate = () => {
    this.setState({
      showDateModal: true,
    });
  };
  onDateSelect = (item,) => {
    if (item == null) {
      this.setState({ showDateModal: false })
    } else {
      this.setState({ showDateModal: false, selectedDate: item })
    }
  };

  render() {
    const { selectedType, selectedDate } = this.state;

    let type = '';
    if (selectedType) {
      type = selectedType.title;
    }

    let date = '';
    if (selectedDate != null) {
      date = selectedDate;
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_VERIFY_SLIP')}
          onMenuTap={() => this.back()}
        />

        <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1,}}>
          <TouchableOpacity onPress={this._onChangeType} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('VERIFY_SLIP_Transaction_Type')}</Text>
              <Text style={{ ...styles.selectValueText }}>
                {type ? type : translang.t('PLEASE_SELECT_TYPE')}
              </Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeStartingDate} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('VERIFY_SLIP_QRCode_Creation_Date')}</Text>
              <Text style={{ ...styles.selectValueText}}>{date ? moment(date).format('DD/MM/YYYY') : translang.t('PLEASE_SELECT_DATE')}</Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={styles.buttonStyle}
            buttonStyle={{ borderRadius: 40}}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />
        </ScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.alert_inbox}
          message={this.state.modalBody}
          buttonColors={[Color.red_orange]}
          onClose={() => { this.setState({ showModal: false }) }}
        />

        <SelectListModal
          isVisible={this.state.showTypeModal}
          onListSelect={this.onTypeSelect}
          listData={this.typeList}
          dialogTtitle={translang.t('VERIFY_SLIP_Transaction_Type')}
        />

        <CalendarModal
          isVisible={this.state.showDateModal}
          //type={'single'}
          minDate={moment()}
          onDateSelect={result => this.onDateSelect(result)}
        />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  bigContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 2,
    justifyContent: 'center',
    minHeight: 200,
  },
  nextbutton: {
    color: Color.white,
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
  },

  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    marginTop: 20,
  },
  selectValueText: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'THSarabunNew',
    fontSize: 28,
    color: Color.n_default_gray,
    position: 'absolute',
    bottom: 40,
  },
  bottomline: {
    height: 1,
    width: '100%',
    backgroundColor: Color.n_default_orange,
    position: 'absolute',
    bottom: 35,
  },

  buttonStyle:{
    width: 290,
    marginVertical:10,
    marginLeft: 'auto',
    marginRight: 'auto',
  }
});
