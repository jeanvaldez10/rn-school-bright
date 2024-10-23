import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReportIconInfoItem from '../../components/IconInfoItem_OneLine';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import AlertWithImageModal from '../../components/AlertWithImageModal';

export default class ReportForTeacherStudentTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      showModal: false,
      modalBody: '',
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidMount() {
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
      this.props.navigation.navigate('ReportAttendance', {parent: 'ReportForTeacher'});
    else if (key == 'leave')
      this.props.navigation.navigate('ReportTeacherStudentLeave', {parent: 'ReportForTeacher'});
    else if (key == 'behavior')
      this.props.navigation.navigate('ReportBehavior', {parent: 'ReportForTeacher'});
  };

  render() {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <View style={styles.container}>

          <ScrollView style={styles.menuContainer} indicatorStyle={'black'}>
            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('attendance') }} >
              <ReportIconInfoItem
                imageSize={50}
                topTextStyle={styles.menuTitle}
                icon_mark={Images.n_ic_report_attendance}
                label={translang.t('REPORT_attendance')}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('leave') }} >
              <ReportIconInfoItem
                imageSize={50}
                topTextStyle={styles.menuTitle}
                icon_mark={Images.n_ic_report_leave}
                label={translang.t('REPORT_leave')}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuEachStyle} activeOpacity={0.5} onPress={() => { this.onClickItem('behavior') }} >
              <ReportIconInfoItem
                imageSize={50}
                topTextStyle={styles.menuTitle}
                icon_mark={Images.n_ic_report_behavior}
                label={translang.t('REPORT_behaviorscore')}
              />
            </TouchableOpacity>

          

          </ScrollView>
          <AlertWithImageModal
            isVisible={this.state.showModal}
            image={Images.n_ic_warning}
            message={this.state.modalBody}
            buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
            isVerticalGradient={false}
            onClose={() => { this.setState({ showModal: false }) }}
          />
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
