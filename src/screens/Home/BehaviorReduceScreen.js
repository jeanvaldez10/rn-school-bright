import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import CustomModal from '../../components/CustomModal';
import ClassLevelModal from '../../components/SelectListModal';
import ClassModal from '../../components/SelectListModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import ProgressHud from '../../components/ProgressHud';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import { ScrollView } from 'react-native-gesture-handler';

import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';

export default class BehaviorReduceScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: null,
      userInfo: null,
      showClassLevelModal: false,
      showClassModal: false,
      selectedClassLevel: null,
      selectedClassRoom: null,
      classLevelList: [],
      classRoomList: [],
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const userInfo = await Storage.getUserInfo();
    this.setState({ userInfo: userInfo }, () => {
      this.getClassLevelData();
    });

    global.onDrawerChanged = this.onDrawerChanged;
  }

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
    this.setState({showClassModal: false, showClassLevelModal: false, selectedClassRoom: null, selectedClassLevel: null, classRoomList: []});
  }

  back = () => {
    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
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

  getStudentInClass = () => {
    this.setState({ isLoading: true });
    ApiManager.getStudentForBehavior(this.state.selectedClassRoom.ID, this.state.userInfo.SchoolID).then(students => {
      this.setState({ isLoading: false }, () => {
        const params = { classLevel: this.state.selectedClassLevel, classRoom: this.state.selectedClassRoom, students: students, isReduce: true, userInfo: this.state.userInfo };
        this.props.navigation.navigate('BehaviorUserList', params);
      });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    })
  }

  __next = async () => {

    const { selectedClassLevel, selectedClassRoom } = this.state;

    if (selectedClassLevel == null) {
      this.setState({ showModal: true, modalBody: translang.t('SELECT_YOUR_GRADE') });
      return;
    } else if (selectedClassRoom == null) {
      this.setState({ showModal: true, modalBody: translang.t('BEHAVIOR_msg_selectclass') });
      return;
    }

    this.getStudentInClass();
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
    if (!this.state.selectedClassLevel) {
      this.setState({ showModal: true, modalBody: translang.t('SELECT_YOUR_GRADE') })
    } else if (this.state.classRoomList.length === 0) {
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
      this.setState({ showClassModal: false, selectedClassRoom: classRoom })
    }
  };

  onQRCode = () => {
    this.props.navigation.navigate('BehaviorQRCode', {type: 1, userInfo: this.state.userInfo, parent: 'BehaviorReduce'});
  };

  onEnterStdID = () => {
    this.props.navigation.navigate('BehaviorStudentID', {type: 1, userInfo: this.state.userInfo, parent: 'BehaviorReduce'});
  };

  render() {
    if (global.onDrawerChanged !== this.onDrawerChanged) {
      global.onDrawerChanged = this.onDrawerChanged;
    }
    
    const { selectedClassLevel, selectedClassRoom } = this.state;
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

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_reduce_behavior')}
          onMenuTap={() => this.back()}
          is_more="1"
          actions={[translang.t('QR_Code'), translang.t('ENTER_STDID')]}
          onMoreTap={(value, index) => {
            if (index === 0)
              this.onQRCode()
            else if (index === 1)
              this.onEnterStdID()
          }}
        />

        <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}}>
          <TouchableOpacity onPress={this._onChangeClassLevel} style={{...styles.bigContainer, marginTop: 30,}} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('BEHAVIOR_classlevel')}</Text>
              <Text style={{ ...styles.selectValueText }}>
                {classlevel ? classlevel : translang.t('BEHAVIOR_msg_selectclasslevel')}
              </Text>
            </View>
            <View style={styles.bottomline}/>
          </TouchableOpacity>

          <TouchableOpacity onPress={this._onChangeClass} style={styles.bigContainer} activeOpacity={1.0}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ ...styles.title2, textAlign: 'center' }}>{translang.t('BEHAVIOR_class')}</Text>
              <Text style={{ ...styles.selectValueText }}>{selclass ? selclass : translang.t('BEHAVIOR_msg_selectclass')}</Text>
            </View>
            <View style={styles.bottomline}/>
          </TouchableOpacity>

          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={{width: 290, marginLeft: 'auto', marginRight: 'auto', marginVertical: 10,}}
            buttonStyle={{ borderRadius: 38, height: 75 }}
            colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />


        </ScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.alert_inbox}
          message={this.state.modalBody}
          buttonColors={[Color.red_orange, Color.soft_red]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />

        <ClassLevelModal
          isVisible={this.state.showClassLevelModal}
          onListSelect={this.onClassLevelSelect}
          listData={classLevelList}
          dialogTtitle={translang.t('BEHAVIOR_classlevel')}
        />
        <ClassModal
          isVisible={this.state.showClassModal}
          onListSelect={this.onClassSelect}
          listData={classRoomList}
          dialogTtitle={translang.t('BEHAVIOR_class')}
        />
        <ProgressHud isVisible={this.state.isLoading} />
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
