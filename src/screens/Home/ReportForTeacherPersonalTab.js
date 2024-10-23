import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import { ScrollView } from 'react-native-gesture-handler';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReportIconInfoItem from '../../components/IconInfoItem_OneLine';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import Color from '../../constants/color';

export default class ReportForTeacherPersonalTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      showModal: false,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

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
  };

  back = () => {
    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  onClickItem = (key) => {
    if (key == 'attendance')
      this.props.navigation.navigate('ReportPersonalAttendance', {parent: 'ReportForTeacher'});
    else if (key == 'leave')
      this.props.navigation.navigate('ReportTeacherPersonalLeave', {parent: 'ReportForTeacher'});
    else if (key == 'topup')
      this.props.navigation.navigate('ReportTopup', {parent: 'ReportForTeacher'});
    else if (key == 'purchase')
      this.props.navigation.navigate('ReportOrderList', {parent: 'ReportForTeacher'});
    else if (key == 'homework')
      this.props.navigation.navigate('ReportTeacherPersonalOnline', {parent: 'ReportForTeacher'});
    else if (key == 'broadcast')
      this.props.navigation.navigate('ReportBroadcast', {parent: 'ReportForTeacher'});
  };

  render() {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>

        <View style={styles.container}>

          <ScrollView style={styles.menuContainer} indicatorStyle={'black'}>
          <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('attendance') }} >
              <ReportIconInfoItem
                imageSize={60}
                topTextStyle={styles.menuTitle}
                icon_mark={Images.n_ic_report_attendance}
                label={translang.t('REPORT_attendance')}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('leave') }} >
              <ReportIconInfoItem
                imageSize={60}
                topTextStyle={styles.menuTitle}
                icon_mark={Images.n_ic_report_leave}
                label={translang.t('REPORT_leave')}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('topup') }} >
              <ReportIconInfoItem
                imageSize={60}
                topTextStyle={styles.menuTitle}
                icon_mark={Images.n_ic_report_topup}
                label={translang.t('REPORT_topup')}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('purchase') }} >
              <ReportIconInfoItem
                imageSize={60}
                topTextStyle={styles.menuTitle}
                icon_mark={Images.n_ic_report_purchase}
                label={translang.t('REPORT_purchase')}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('homework') }} >
              <ReportIconInfoItem
                imageSize={50}
                topTextStyle={styles.menuTitle}
                icon_mark={Images.n_ic_report_online}
                label={translang.t('DRAWER_onlineclassroom')}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('broadcast') }} >
              <ReportIconInfoItem
                imageSize={50}
                topTextStyle={styles.menuTitle}
                icon_mark={Images.n_ic_report_broadcast}
                label={translang.t('REPORT_broadcast')}
              />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
  },
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
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
  menuTitle: {
    fontFamily: 'THSarabunNew',
    fontSize: 24, 
    fontWeight: 'bold',
    color: Color.n_default_orange
  }
});
