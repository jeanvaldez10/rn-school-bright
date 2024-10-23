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

export default class HalfdayLeaveScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      showLeaveReasonModal: false,
      showDateModal: false,
      showSeasonModal: false,
      selectedLeaveReason: -1,
      selectedDate: null,
      selectedSeasonIndex: -1,
      userInfo: {},
      leaveReasonList: [],
      leaveSeasonList: [],

      isAddressRembemr: false,
      AddressInfo: {},

      showInfoModal: false,
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

    // this.unsubscribe = NetInfo.addEventListener(state => {
    //   console.log("E");
    //   if(!state.isConnected){
    //     this.setState({showModal: true, modalBody: translang.t('ALERT_OFFLINE') });
    //   }
    // });

    const userInfo = await Storage.getUserInfo();
    const isRemember = await Storage.getRememberAddrStatus() ?? false;
    const AddressInfo = await Storage.getAddrInfo() ?? {};
    const isStudent = userInfo.StudentId !== '' && userInfo.StudentId !== null && userInfo.StudentId !== undefined;

    let leaveTypes;
    if (isStudent){
      leaveTypes = await ApiManager.getStudentLeaveType(userInfo.SchoolID);
    }else{
      leaveTypes = await ApiManager.getTeacherLeaveType(userInfo.SchoolID);
    }

    let leaveSeasonList = [translang.t('MORNING'), translang.t('AFTERNOON')];

    this.setState({ userInfo: userInfo, leaveReasonList: leaveTypes, leaveSeasonList: leaveSeasonList, isRemember: isRemember, AddressInfo: AddressInfo});
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

    const { selectedLeaveReason, selectedDate, selectedSeasonIndex } = this.state;

    if (selectedLeaveReason == null || selectedLeaveReason === -1) {
      this.setState({ showModal: true, modalBody: translang.t('FILL_IN_THE_DETAIL') });
      // this.setState({ showModal: true, modalBody: translang.t('LEAVE_msg_leavereason') });
      return;
    } else if (selectedDate == null) {
      this.setState({ showModal: true, modalBody: translang.t('FILL_IN_THE_DETAIL') });
      // this.setState({ showModal: true, modalBody: translang.t('LEAVE_msg_startingdate') });
      return;
    } else if (selectedSeasonIndex == null || selectedSeasonIndex === -1) {
      this.setState({ showModal: true, modalBody: translang.t('FILL_IN_THE_DETAIL') });
      // this.setState({ showModal: true, modalBody: translang.t('LEAVE_msg_season') });
      return;
    }

    const params = {
      type: 'HalfdayLeave',
      leaveReason: selectedLeaveReason,
      leaveDate: selectedDate,
      leaveToDate: selectedDate,
      leaveSeasonIndex: selectedSeasonIndex,
      userInfo: this.state.userInfo,
      isAddressRembemr: this.state.isAddressRembemr,
      AddressInfo: this.state.AddressInfo,
    }
    this.props.navigation.navigate('LeaveInput', params);
  };

  _onChangeLeaveReason = () => {
    this.setState({
      showLeaveReasonModal: true,
    });
  };
  onLeaveReasonSelect = (item, index) => {
    if (item == null) {
      this.setState({ showLeaveReasonModal: false })
    } else {
      this.setState({ showLeaveReasonModal: false, selectedLeaveReason: item })
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

  _onChangeSeason = () => {
    if (!this.state.selectedDate) {
      this.setState({ showModal: true, modalBody: translang.t('SELECT_LEAVE_DATE') });
      return;
    }
    this.setState({
      showSeasonModal: true,
    });
  };
  onSeasonSelect = (item, index) => {
    if (item == null) {
      this.setState({ showSeasonModal: false })
    } else {
      this.setState({ showSeasonModal: false, selectedSeasonIndex: index })
    }
  };

  render() {
    const { selectedLeaveReason, selectedDate, selectedSeasonIndex, leaveReasonList } = this.state;

    let leave_reason = '';
    if (selectedLeaveReason) {
      leave_reason = getCurrentLocale() == 'th' ? selectedLeaveReason.typeName : selectedLeaveReason.typeNameEN;
    }

    let leave_season = '';
    if (selectedSeasonIndex !== null && selectedSeasonIndex >= 0) {
      leave_season = this.state.leaveSeasonList[selectedSeasonIndex];
    }
    let date = '';
    if (selectedDate != null) {
      date = selectedDate;
    }

    const leaveSeasonList = this.state.leaveSeasonList.map((reason, index) => {
      return {title: reason, value: index};
    });


    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_leave')}
          onMenuTap={() => this.back()}
          is_info={true}
          onInfoTap={() => {
            this.setState({showInfoModal: true})
          }}
        />

        <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1,}}>
          <TouchableOpacity onPress={this._onChangeLeaveReason} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('LEAVE_leavereason')}</Text>
              <Text style={{ ...styles.selectValueText }}>
                {leave_reason ? leave_reason : translang.t('LEAVE_msg_leavereason')}
              </Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeStartingDate} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('LEAVE_startingdate')}</Text>
              <Text style={{ ...styles.selectValueText}}>{date ? moment(date).format('DD/MM/YYYY') : translang.t('LEAVE_msg_startingdate')}</Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeSeason} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('LEAVE_season')}</Text>
              <Text style={{ ...styles.selectValueText}}>{leave_season ? leave_season : translang.t('LEAVE_msg_season')}</Text>
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

        <LeaveReasonListModal
          isVisible={this.state.showLeaveReasonModal}
          onListSelect={this.onLeaveReasonSelect}
          listData={leaveReasonList}
          dialogTtitle={translang.t('LEAVE_leavereason')}
        />

        <CalendarModal
          isVisible={this.state.showDateModal}
          //type={'single'}
          minDate={moment()}
          onDateSelect={result => this.onDateSelect(result)}
        />

        <SelectListModal
          isVisible={this.state.showSeasonModal}
          onListSelect={this.onSeasonSelect}
          listData={leaveSeasonList}
          dialogTtitle={translang.t('LEAVE_season')}
        />

        <LeaveInfoModal isVisible={this.state.showInfoModal} onOkPress={() => {
          this.setState({showInfoModal: false});
        }} />
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
