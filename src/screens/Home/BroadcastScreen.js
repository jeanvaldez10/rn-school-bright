import React from 'react';
import {View, BackHandler, TouchableOpacity } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import DeliveryFormatModal from '../../components/SelectListModal';
import RecipientModal from '../../components/SelectListModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import { ScrollView } from 'react-native-gesture-handler';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';

export default class BroadcastScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      showDeliveryFormatModal: false,
      showRecipientModal: false,
      selectedDeliveryFormat: null,
      selectedRecipient: null,
      groupList: [],
      userInfo: null,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    console.log("BroadcastScreen");
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    const userInfo = await Storage.getUserInfo();
    this.setState({userInfo: userInfo}, ()=>{
      this.getSmsGroupData();
      global.onDrawerChanged = this.onDrawerChanged;
    })
  }

  getSmsGroupData = () => {
    ApiManager.getSmsGroup(this.state.userInfo.SchoolID).then(list => {
      console.log("list:", list);
      const tmp = list.map( item => {
        let title = getCurrentLocale() == 'en' ? item.smsGroupNameEn : item.smsGroupName;
        title = title ? title : item.smsGroupName;
        return { title: title, value: item.smsGroupId, smsGroupType: item.smsGroupType};
      });
      this.setState({ groupList: tmp});
    }).catch(error => {
      this.setState({ isLoading: false });
    });
  };

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
    global.onDrawerChanged = null;
  };

  onDrawerChanged = () => {
    this.setState({showDeliveryFormatModal: false, showRecipientModal: false, selectedDeliveryFormat: null, selectedRecipient: null, showModal: false});
  }

  back = () => {
    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  __next = async () => {

    const { selectedDeliveryFormat, selectedRecipient } = this.state;

    if (selectedDeliveryFormat == null) {
      this.setState({ showModal: true, modalBody: translang.t('SELECT_SEND_FORMAT') });
      return;
    } else if (selectedRecipient == null) {
      this.setState({ showModal: true, modalBody: translang.t('BROADCAST_msg_selectrecipient') });
      return;
    }
    if(selectedDeliveryFormat.value == "1"){
      if(selectedRecipient.value == '2'){
        let params = {
          deliveryFormat: selectedDeliveryFormat,
          recipient: selectedRecipient,
          isKind: '2',
          userInfo: this.state.userInfo
        };
        this.props.navigation.navigate('BroadcastSelectClass', params);
      }else if(selectedRecipient.value == "0"){
        let params = {
          deliveryFormat: selectedDeliveryFormat,
          recipient: selectedRecipient,
          isKind: '0',
          classID: '',
          userInfo: this.state.userInfo,
          parent: 'Broadcast'
        };
        this.props.navigation.navigate('BroadcastIndiviDual', params);
      }else{
        let params = {
          deliveryFormat: selectedDeliveryFormat,
          recipient: selectedRecipient,
          isKind: '1',
          classID: '',
          userInfo: this.state.userInfo,
          parent: 'Broadcast'
        };
        this.props.navigation.navigate('BroadcastIndiviDual', params);
      }
    }else{
      if(selectedRecipient.smsGroupType == "all-student-level"){
        let params = {
          deliveryFormat: selectedDeliveryFormat,
          recipient: selectedRecipient,
          selectedIds: [],
          parent: 'Broadcast',
          userInfo: this.state.userInfo,
        };
        this.props.navigation.navigate('BroadcastGroupSelectClass', params);
      }else{
        let params = {
          deliveryFormat: selectedDeliveryFormat,
          recipient: selectedRecipient,
          selectedIds: [],
          parent: 'Broadcast',
          userInfo: this.state.userInfo
        };
        this.props.navigation.navigate('BroadcastFillInfo', params);
      }
    }
  };

  _onChangeDeliveryFormat = () => {
    this.setState({
      showDeliveryFormatModal: true,
    });
  };
  onDeliveryFormatSelect = (item) => {
    if (item == null) {
      this.setState({ showDeliveryFormatModal: false })
    } else {
      this.setState({ showDeliveryFormatModal: false, selectedDeliveryFormat: item,  selectedRecipient: null})
    }
  };

  _onChangeRecipient = () => {
    if (!this.state.selectedDeliveryFormat) {
      this.setState({ showModal: true, modalBody: translang.t('SELECT_SEND_FORMAT') });
    } else {
      this.setState({
        showRecipientModal: true,
      });
    }
  };
  onRecipientSelect = (item) => {
    if (item == null) {
      this.setState({ showRecipientModal: false })
    } else {
      this.setState({ showRecipientModal: false, selectedRecipient: item })
    }
  };

  render() {
    if (global.onDrawerChanged !== this.onDrawerChanged) {
      global.onDrawerChanged = this.onDrawerChanged;
    }

    const { selectedDeliveryFormat, selectedRecipient } = this.state;

    const deliveryFormatArray = [
      {
        title: translang.t('GROUP'),
        value: 0
      },
      {
        title: translang.t('INDIVIDUAL'),
        value: 1
      },
    ];

    let recipientArray = [];

    let deliveryformat = '';
    if (selectedDeliveryFormat) {
      deliveryformat = selectedDeliveryFormat.title ?? '';

      if (selectedDeliveryFormat.value === 0) {
        recipientArray = this.state.groupList;
      } else {
        recipientArray = [
          {
            title: translang.t('TEACHER_STAFF'),
            value: 0
          },
          {
            title: translang.t('STUDENTS'),
            value: 2
          },
        ];
      }
    }
    let recipient = '';
    if (selectedRecipient) {
      recipient = selectedRecipient.title ?? '';
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_broadcast')}
          onMenuTap={() => this.back()}
        />

        <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}}>
          <TouchableOpacity onPress={this._onChangeDeliveryFormat} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('BROADCAST_deliveryformat')}</Text>
              <Text style={{ ...styles.selectValueText}}>
                {deliveryformat ? deliveryformat : translang.t('BROADCAST_msg_selectdelivery')}
              </Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeRecipient} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('BROADCAST_recipient')}</Text>
              <Text style={{ ...styles.selectValueText}}>
                {recipient ? recipient : translang.t('BROADCAST_msg_selectrecipient')}
              </Text>
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
          title=' '
          message={this.state.modalBody}
          buttonColors={[Color.red_orange, Color.soft_red]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />

        <DeliveryFormatModal
          isVisible={this.state.showDeliveryFormatModal}
          onListSelect={this.onDeliveryFormatSelect}
          listData={deliveryFormatArray}
          dialogTtitle={translang.t('BROADCAST_deliveryformat')}
        />

        <RecipientModal
          isVisible={this.state.showRecipientModal}
          onListSelect={this.onRecipientSelect}
          listData={recipientArray}
          dialogTtitle={translang.t('BROADCAST_recipient')}
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
  buttonStyle:{
    width: '80%',
    marginVertical:10,
    marginLeft: 'auto',
    marginRight: 'auto',
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


});
