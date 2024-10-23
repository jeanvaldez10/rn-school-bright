import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationBar from '../../components/NavigationBar';
import CustomModal from '../../components/CustomModal';
import ClassLevelModal from '../../components/SelectListModal';
import ClassModal from '../../components/SelectListModal';
import StatusModal from '../../components/SelectListModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import BackNavigationBar from '../../components/BackNavigationBar';
import { ScrollView } from 'react-native-gesture-handler';

export default class ReportBehaviorScore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: null,
      userInfo: null,
      showClassLevelModal: false,
      showClassModal: false,
      showStatusModal: false,
      selectedClassLevel: null,
      selectedClassRoom: null,
      selectedStatus: 0,
      classLevelList: [],
      classRoomList: [],
    };
  }

  async componentDidMount() {
    const userInfo = await Storage.getUserInfo();
    this.setState({ userInfo: userInfo }, () => {
      this.getClassLevelData();
    });
  }

  componentWillUnmount = () => {

  };

  back = () => {
    this.props.navigation.pop(1);
    // this.props.naigation.navigate('BehaviorUserList');
    // this.props.navigation.replace('BehaviorUserList');
  };

  getClassLevelData = () => {
    ApiManager.getStudentClassLevel(this.state.userInfo.SchoolID).then(list => {
      this.setState({ classLevelList: list });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  getClassRoomData = () => {
    ApiManager.getSchoolClassroom(this.state.userInfo.SchoolID, this.state.selectedClassLevel.ID).then(list => {
      this.setState({ classRoomList: list });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  __next = () => {
    const classLevel = this.state.selectedClassLevel;
    const classRoom = this.state.selectedClassRoom;
    const status = this.state.selectedStatus;

    this.props.navigation.navigate('ReportBehaviorScoreCalendar', {classLevel, classRoom, status});
  };

  _onChangeClassLevel = () => {
    this.setState({
      showClassLevelModal: true,
    });
  };
  onClassLevelSelect = (item, index) => {
    if (item == null) {
      this.setState({ showClassLevelModal: false })
    } else {
      const classLevel = this.state.classLevelList[index];
      this.setState({ showClassLevelModal: false, selectedClassLevel: classLevel, selectedClassRoom: null }, () => {
        this.getClassRoomData();
      });
    }
  };

  _onChangeClass = () => {
    if (this.state.classRoomList.length === 0) {
      this.setState({ showModal: true, modalBody: translang.t('NO_CLASSROOM') });
    } else {
      this.setState({
        showClassModal: true,
      });
    }
  };
  onClassSelect = (item, index) => {
    if (item == null) {
      this.setState({ showClassModal: false })
    } else {
      const classRoom = this.state.classRoomList[index];
      this.setState({ showClassModal: false, selectedClassRoom: classRoom }, () => {

      });
    }
  };

  _onChangeStatus = () => {
    this.setState({
      showStatusModal: true,
    });
  };
  onStatusSelect = (item, index) => {
    if (item == null) {
      this.setState({ showStatusModal: false })
    } else {
      this.setState({ showStatusModal: false, selectedStatus: index })
    }
  };

  renderStatusListItem = (item, index) => {

    return (
      <TouchableOpacity onPress={() => this.onStatusSelect(item, index)}>
        <Text
          style={{fontFamily: 'THSarabunNew', fontSize: 26 }}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  render() {
    if (global.onDrawerChanged !== this.onDrawerChanged) {
      global.onDrawerChanged = this.onDrawerChanged;
    }

    const { selectedClassLevel, selectedClassRoom, selectedStatus } = this.state;
    let classlevel = '';
    if (selectedClassLevel != null) {
      if (getCurrentLocale() === 'th' && selectedClassLevel.NameTH && selectedClassLevel.NameTH !== '') {
        classlevel = selectedClassLevel.NameTH;
      } else if (getCurrentLocale() === 'en' && selectedClassLevel.NameEN && selectedClassLevel.NameEN !== '') {
        classlevel = selectedClassLevel.NameEN;
      } else {
        classlevel = selectedClassLevel.Value;
      }
    }
    let selclass = '';
    if (selectedClassRoom != null) {
      if (getCurrentLocale() === 'th' && selectedClassRoom.NameTH && selectedClassRoom.NameTH !== '') {
        selclass = selectedClassRoom.NameTH;
      } else if (getCurrentLocale() === 'en' && selectedClassRoom.NameEN && selectedClassRoom.NameEN !== '') {
        selclass = selectedClassRoom.NameEN;
      } else {
        selclass = selectedClassRoom.Value;
      }
    }

    const classLevelList = this.state.classLevelList.map( level => {
      if (getCurrentLocale() === 'th' && level.NameTH && level.NameTH !== '') {
        return { title: level.NameTH };
      } else if (getCurrentLocale() === 'en' && level.NameEN && level.NameEN !== '') {
        return { title: level.NameEN };
      }
      return { title: level.Value };
    });
    const classRoomList = this.state.classRoomList.map( classRoom => {
      if (getCurrentLocale() === 'th' && classRoom.NameTH && classRoom.NameTH !== '') {
        return { title: classRoom.NameTH };
      } else if (getCurrentLocale() === 'en' && classRoom.NameEN && classRoom.NameEN !== '') {
        return { title: classRoom.NameEN };
      }
      return { title: classRoom.Value };
    });
    const statusList = [
      {title: translang.t('ALL')},
      {title: translang.t('ADD')},
      {title: translang.t('REDUCE')}
    ];
    const selStatus = statusList[this.state.selectedStatus].title;

    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_reportbehavior')}
          onMenuTap={() => this.back()}
        />

        <ScrollView style={styles.container}>

          <TouchableOpacity onPress={this._onChangeClassLevel} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('HOMEWORK_classlevel')}</Text>
              <Text style={{ ...styles.selectValueText, color: '#666' }}>
                {classlevel ? classlevel : translang.t('HOMEWORK_select_classlevel')}
              </Text>
            </View>
            <View style={{ height: 1, width: '100%', backgroundColor: Color.red_orange, position: 'absolute', bottom: 10 }} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeClass} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('HOMEWORK_class')}</Text>
              <Text style={{ ...styles.selectValueText, color: '#666' }}>{selclass ? selclass : translang.t('HOMEWORK_select_class')}</Text>
            </View>
            <View style={{ height: 1, width: '100%', backgroundColor: Color.red_orange, position: 'absolute', bottom: 10 }} />
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeStatus} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('STATUS')}</Text>
              <Text style={{ ...styles.selectValueText, color: '#666' }}>{selStatus}</Text>
            </View>
            <View style={{ height: 1, width: '100%', backgroundColor: Color.red_orange, position: 'absolute', bottom: 10 }} />
          </TouchableOpacity>

          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={{ shadowColor: 'transparent', shadowOpacity: 0 }}
            buttonStyle={{ borderRadius: 3 }}
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

        <ClassLevelModal
          isVisible={this.state.showClassLevelModal}
          onListSelect={this.onClassLevelSelect}
          listData={classLevelList}
        />

        <ClassModal
          isVisible={this.state.showClassModal}
          onListSelect={this.onClassSelect}
          listData={classRoomList}
        />

        <StatusModal
          isVisible={this.state.showStatusModal}
          onListSelect={this.onStatusSelect}
          listData={statusList}
        />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  bigContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 5,
    marginVertical: 5,
    padding: 15,
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  buttonStyle: {
    width: '100%',
    height: 60,
    borderRadius: 5,
    backgroundColor: Color.green_button_next_color1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 35,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  selectValueText: {
    fontFamily: 'THSarabunNew',
    fontSize: 28,
    marginVertical: 30,
  },
});
