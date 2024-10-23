import React from 'react';
import { View, BackHandler, TouchableOpacity, FlatList, Modal, Text } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import TuitionIconInfoItem from '../../components/TuitionIconInfoItem';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import moment from 'moment';
import GradientButton from '../../components/GradientButton';
import CustomCheckButton from '../../components/CustomCheckButton';
import Images from '../../themes/Images';
import NetInfo from "@react-native-community/netinfo";
import AlertWithImageModal from '../../components/AlertWithImageModal';

export default class TuitionScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      showModal: false,
      modalBody: '',

      isRefreshing: false,
      userInfo: {},
      feeList: [],
      invoiceId: "",

      showAlertModal: false,
      checkShowWeek: false,
      rememberCheckStatus: false,

    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  unsubscribe = null;

  async componentDidMount() {
    // this.unsubscribe = NetInfo.addEventListener(state => {
    //   console.log("S");
    //   if(!state.isConnected){
    //     this.setState({showModal: true, modalBody: translang.t('ALERT_OFFLINE') });
    //   }
    // });

    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = await Storage.getUserInfo();
      const statusAlert = await Storage.getStatusTuitionAlert();
      console.log(statusAlert);

      let alertS = true;
      let alertR = false;

      if(statusAlert != null){
        alertR = statusAlert.status;
        var timeDifferenceInDay = moment().diff(moment(statusAlert.date), 'days');
        if(timeDifferenceInDay<=7 && alertR){
          alertS = false
        }
      }

      this.setState({userInfo: userInfo, showAlertModal: alertS, rememberCheckStatus: alertR}, ()=>{
        this.getTuitionList();
      });
    });

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
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  onClickItem = (item) => {
    const flag = item.status==1?true:false;
    this.props.navigation.navigate('TuitionOutput', {paystatus:flag, userInfo: this.state.userInfo, invoiceId: item.invoices_Id});
  };

  onRefresh = () => {
    this.setState({isRefreshing: true,},() => {
      this.getTuitionList();
    });
  };

  getTuitionList = () =>{
    ApiManager.getStatementFee(this.state.userInfo.ID, this.state.userInfo.SchoolID).then(data => {
      // console.log(data);
      this.setState({feeList: data, invoiceId: data.invoices_Id});
    }).catch(error => {
      console.error(error);
    });
    this.setState({ isRefreshing: false });
  };

  onClickAlertClose = ()=>{
    let temp = {status: false, date: moment()};
    if(this.state.checkShowWeek){
      temp.status = true;
    }else{
      temp.status = this.state.rememberCheckStatus;
    }
    Storage.setStatusTuitionAlert(temp);
    this.setState({showAlertModal: false, checkShowWeek: false});
  }

  renderItem = (index) => {
    const item = this.state.feeList[index];
    const status = item.status;
    const year = item.yesr;
    const term = item.trem;
    const amount = item.totalprice;
    const dueDate = moment(item.dueDate).format('DD/MM/YYYY');
    const issueDate = moment(item.issuedDate).format('DD/MM/YYYY');
    const balance = item.GrandTotal;

    return (
      <View style={styles.menuContainer}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => { this.onClickItem(item) }} >
          <TuitionIconInfoItem
            status_flag={status}
            valYear = {year}
            valTerm = {term}
            valAmount={amount}
            value_txt={dueDate}
            dateText={issueDate}
            balance={balance}
          />
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_tuition')}
          onMenuTap={() => this.back()}
          is_help={true}
          onHelpTap={()=>this.setState({showAlertModal: true})}
        />
        <View style={styles.container}>
          <FlatList
              data={this.state.feeList}
              onRefresh={() => this.onRefresh()}
              refreshing={this.state.isRefreshing}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem(index)}
            />
        </View>

        {this.state.showAlertModal &&
        <Modal
          animationType='fade'
          transparent={true}
          key="modal">
          <View style={styles.centeredView} >
            <View style={{...styles.dialogStyle, width: "90%"}}>
              <Text style={[styles.text]}>{translang.t('TUITION_ALERT')}</Text>

              <CustomCheckButton
                isSelected={this.state.checkShowWeek}
                onPress={() => this.setState({checkShowWeek: !this.state.checkShowWeek})}
                checkboxSize={20}
                text={translang.t('DONT_SHOW_AGAIN_WEEK')}
                textColor={Color.n_default_gray}
                itemTextStyle={{fontSize: 18, fontFamily: 'THSarabunNew', color: Color.n_default_gray,}}
                alignCenter={false}
              />

              <View style={{height: 1,  backgroundColor: Color.n_default_orange, marginHorizontal: 0, marginVertical: 20}} />

              <GradientButton
                label={translang.t('COMMON_close') }
                containerStyle={styles.buttonContainer}
                buttonStyle={{borderRadius: 0}}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                textStyle={{fontSize: 24, fontWeight: 'bold'}}
                isVerticalGradient={false}
                _onPress={() => { this.onClickAlertClose()}} />
            </View>
          </View>
        </Modal>}

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />

      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  menuContainer: {
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    marginVertical: 5,
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000070',
  },
  dialogStyle: {
    width: '90%',
    padding: 20,

    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.25,
    elevation: 5,
    overflow: 'hidden',
    backgroundColor: 'white',
  },

  title:{
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Color.n_default_gray,

  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
    marginBottom: 20,
  },

  buttonContainer: {
    width: 126,
    height: 44,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
});
