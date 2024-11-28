import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import GradientButton from '../../components/GradientButton';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'native-base';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReportIconInfoItem from '../../components/IconInfoItem_OneLine';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import BackNavigationBar from '../../components/BackNavigationBar';
import Storage from '../../managers/StorageManager';
import NetInfo from "@react-native-community/netinfo";
import AlertWithImageModal from '../../components/AlertWithImageModal';

export default class ReportScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      showModal: false,
      modalBody: '',
      userInfo: {},
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    // this.unsubscribe = NetInfo.addEventListener(state => {
    //   console.log("M");
    //   if(!state.isConnected){
    //     this.setState({showModal: true, modalBody: translang.t('ALERT_OFFLINE') });
    //   }
    // });

    console.log("Report screen");

    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    const userInfo = await Storage.getUserInfo();
    this.setState({userInfo});
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

  onClickItem = (key) => {
    if (key == 'attendance')
      this.props.navigation.navigate('ReportPersonalAttendance');
    else if (key == 'leave'){
      // const params = {
      //   parent: 'Report',
      //   userInfo: this.state.userInfo,
      // }
      // this.props.navigation.navigate('ReportLeaveForStudent', params);
      this.props.navigation.navigate('ReportTeacherPersonalLeave', {parent: 'Report', type: 'reportstudent'});
    }
    else if (key == 'topup')
      this.props.navigation.navigate('ReportTopup');
    else if (key == 'purchase')
      this.props.navigation.navigate('ReportOrderList');
    else if (key == 'behavior'){
      this.props.navigation.navigate('ReportStudentBehaviorScoreList', {parent: 'Report', userInfo: this.state.userInfo,});
    } else if( key === 'school-bus') {
      this.props.navigation.navigate('StudentPickupDropOffReport');
    }

      // this.props.navigation.navigate('ReportBehaviorStudentList', {parent: 'Report', userInfo: this.state.userInfo,});
  };

  render() {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_report')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <ScrollView style={styles.menuContainer} indicatorStyle={'black'}>
            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('attendance') }} >
              <ReportIconInfoItem
                topTextStyle={{color: Color.n_default_orange}}
                icon_mark={Images.n_ic_report_attendance}
                label={translang.t('REPORT_attendance')}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('leave') }} >
              <ReportIconInfoItem
                topTextStyle={{color: Color.n_default_orange}}
                icon_mark={Images.n_ic_report_leave}
                label={translang.t('REPORT_leave')}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('school-bus') }} >
              <ReportIconInfoItem
                topTextStyle={{color: Color.n_default_orange}}
                icon_mark={Images.ic_school_bus_blue}
                  label={translang.t('BUS_ALIGHTING_REPORT')}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('topup') }} >
              <ReportIconInfoItem
                topTextStyle={{color: Color.n_default_orange}}
                icon_mark={Images.n_ic_report_topup}
                label={translang.t('REPORT_topup')}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('purchase') }} >
              <ReportIconInfoItem
                topTextStyle={{color: Color.n_default_orange}}
                icon_mark={Images.n_ic_report_purchase}
                label={translang.t('REPORT_purchase')}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('behavior') }} >
              <ReportIconInfoItem
                topTextStyle={{color: Color.n_default_orange}}
                icon_mark={Images.n_ic_report_behavior}
                label={translang.t('REPORT_behaviorscore')}
              />
            </TouchableOpacity>
           
          </ScrollView>
        </View>

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

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 0,
  },
  menuEachStyle: {
    height: 100,
    borderRadius: 15,
    marginHorizontal: 15,
    marginTop: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 10,
    elevation: 2,
    paddingHorizontal: 10,
  },
});
