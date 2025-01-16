import ApiManager from "../managers/ApiManager";
import {Linking, Platform} from "react-native"
import translang, {getCurrentLocale} from '../utils/language.utils';
import {ScaledSheet} from "react-native-size-matters";
import Color from "./color";
import Storage from "../managers/StorageManager";
import {defaultAllMenuStudent, defaultAllMenuTeacher} from "./constants";
import DeviceInfo from 'react-native-device-info'
import Images from "../themes/Images";

const apps = {
  'alpha': {
    'deep_link': 'alpha://alphaclass.com/',
    'android': 'https://play.google.com/store/apps/details?id=com.alphaclass',
    'ios': 'https://apps.apple.com/th/app/alpha-tutor/id6449192053',
    'harmony': 'https://appgallery.huawei.com/app/C107682987',
  }
};


export const gotoPageAfterLeavePermission = (pageName, params, _this) => {
  _this.setState({isLoading: true});
  ApiManager.checkLeavePermisionStatus(_this.state.userInfo.ID, getCurrentLocale())
    .then(res => {
      _this.setState({isLoading: false});
      if (res == "SUCCESS") {
        _this.props.navigation.navigate(pageName, params);
      } else {
        _this.setState({showModal: true, modalBody: res});
      }
    }).catch(error => {
    console.log(error);
    // _this.setState({isLoading: false, showModal: true, modalBody: translang.t('ALERT_OFFLINE')});
  });
}

export const gotoPageAfterAuth = async (menuGroupID, subMenuID, pageName, params, _this) => {
  _this.props.navigation.navigate(pageName, params);
  return; 

  ApiManager.checkAuthStatus(_this.state.userInfo.ID, _this.state.loginInfo.token, _this.state.deviceInfo.fcmtoken)
    .then(res => {
      _this.setState({authInfo: res}, () => {
        if (res.resCode == 200) {
          if (res.permission.length > 0) {
            const idxGroup = res.permission.findIndex((item) => item.menuGroup_Id == menuGroupID);
            if (idxGroup >= 0) {
              if (menuGroupID == 13) {
                _this.props.navigation.navigate(pageName, params);
              } else {
                if (res.permission[idxGroup].subMenus.length > 0) {
                  const idxSub = res.permission[idxGroup].subMenus.findIndex((item) => item.menu_Id == subMenuID);
                  if (idxSub >= 0) {
                    _this.props.navigation.navigate(pageName, params);
                  } else {
                    _this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')});
                  }
                } else {
                  _this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')});
                }
              }
            } else {
              _this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')});
            }
          } else {
            _this.setState({showModal: true, modalBody: translang.t('CONTACT_YOUER_SCHOOL_ADMIN')});
          }
        }
      });
    }).catch(e => {
    // _this.setState({showModal: true, modalBody: translang.t('ALERT_OFFLINE')});
  });
}

export const gotoAfterCheckSchedule = (pageName, params, _this) => {
  _this.setState({ isLoading: true });

  const handleNavigation = (scheduleID, isEvening) => {
    if (scheduleID) {
      _this.props.navigation.navigate(pageName, { isEvening, scheduleID });
    } else {
      _this.setState({ 
        showModal: true, 
        modalBody: translang.t('NO_SCHEDULE_FOUND') 
      });
    }
  };

  ApiManager.checkTodayBusScheduleForStudent()
    .then((res) => {
      _this.setState({ isLoading: false });

      if (res.status === 1) {
        switch (pageName) {
          case 'EveningBusScheduleDetail':
            handleNavigation(res.nEveningScheduleID, true);
            break;
          case 'MorningBusScheduleDetail':
            handleNavigation(res.nMorningScheduleID, false);
            break;
          default:
            break;
        }
      } else {
        _this.setState({ 
          showModal: true, 
          modalBody: res.message 
        });
      }
    })
    .catch((error) => {
      console.error('Error checking schedule:', error);
      _this.setState({ 
        isLoading: false, 
        showModal: true, 
        modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN') 
      });
    });
};

export const navigateMenu = async (item, _this) => {
  if (item.func == 'modal') {
    _this.setState({showMenuModal: true, subMenuList: item.subMenu});
  } else if (item.func == 'link') {
    _this.props.navigation.navigate(item.link, {parent: null});
  } else if (item.func == 'gotoPageAfterLeavePermission') {
    gotoPageAfterLeavePermission(item.link, {}, _this);
  }else if (item.func == 'gotoAfterCheckSchedule') {
    gotoAfterCheckSchedule(item.link, {}, _this);
  } else if (item.func == 'gotoPageAfterAuth') {
    gotoPageAfterAuth(item.menuGroupID, item.subMenuID, item.link, {param: 'subscribe'}, _this);
  } else if (item.func == 'coming') {
    _this.setState({showComingSoonModal: true})
  } else if (item.func == 'app') {
    const isSupported = await Linking.canOpenURL(apps[item.key]['deep_link']);
    console.log(apps[item.key]['deep_link'], ':', isSupported);

    if (isSupported) {
      await Linking.openURL(apps[item.key]['deep_link']);
    } else {
      if (Platform.OS == 'ios') {
        await Linking.openURL(apps[item.key][Platform.OS]);
      } else if (Platform.OS == 'android') {
        const brand = DeviceInfo.getBrand();
        const manufacturer = await DeviceInfo.getManufacturer();

        let isHarmony = false;
        if (brand.toLowerCase() === 'huawei' || manufacturer.toLowerCase() === 'huawei') {
          isHarmony = true
        }
        if (isHarmony) {
          await Linking.openURL(apps[item.key]['harmony']);
        } else {
          await Linking.openURL(apps[item.key]['android']);
        }
      }
    }
  }
}

export const createDefaultQuickMenu = (allMenu, isStudent, _this) => {
  const quickMenuStudentKeys = ['leave', 'schoolBus', 'TimetableStudent', 'topUp', 'tuition', 'academicResult', 'pickUp'];
  const quickMenuTeacherKeys = ['checkInAttendance', 'schoolBus', 'leave',
    'discipline', 'TimetableTeacher', 'broadcast', 'topUp', 'shop'];

  const keys = isStudent ? quickMenuStudentKeys : quickMenuTeacherKeys;
  let defaultQuickMenu = [];
  for (const key of keys) {
    for (const section in allMenu) {
      const item = allMenu[section].find(menuItem => (menuItem.key == key));
      if (item) {
        defaultQuickMenu.push(item);
        break;
      }
    }
  }

  return defaultQuickMenu;
}

export const getMenu = async (userInfo, _this) => {
  let quickMenu, allMenu;

  if (userInfo.StudentId) {
    quickMenu = await Storage.getQuickMenuStudent();
  } else {
    quickMenu = await Storage.getQuickMenuTeacher();
  }

  allMenu = userInfo.StudentId ? defaultAllMenuStudent : defaultAllMenuTeacher;
  if (!quickMenu || quickMenu.length == 0) {
    quickMenu = createDefaultQuickMenu(allMenu, userInfo.StudentId, _this);
    if (userInfo.StudentId) {
      await Storage.setQuickMenuStudent(quickMenu);
    } else {
      await Storage.setQuickMenuTeacher(quickMenu);
    }
  } else {
    // Updating Images

    quickMenu.map(item => {
      for (const section in allMenu) {
        const itemToUpdate = allMenu[section].find(menuItem => menuItem.key == item.key);
        if (itemToUpdate) {
          item.image = itemToUpdate.image;
          break;
        }
      }
    });


  }
  return {allMenu, quickMenu};
}

export const updateItemQuickMenu = (item, quick_menu, _this) => {
  let allMenu = _this.state.allMenu;
  for (const section in allMenu) {
    const itemToUpdate = allMenu[section].find(menuItem => menuItem.key == item.key);
    if (itemToUpdate) {
      itemToUpdate.quick_menu = quick_menu;
      break;
    }
  }
  _this.setState({allMenu: {...allMenu}})
}

export const quickMenuStyles = ScaledSheet.create({
  addAccountImage: {
    width: '48@ms',
    height: '48@ms',
    resizeMode: 'contain',
  },
  addAccountBox: {
    width: '48@ms',
    height: '48@ms',
    borderRadius: '24@s',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 10,
    backgroundColor: 'white'
  },
  accountItemContainer: {
    width: '25%',
    alignItems: 'center',
    paddingHorizontal: '2@s',
    marginBottom: '8@ms0.7',
  },
  appTitle: {
    marginTop: '6@ms0.7',
    fontSize: '16@ms0.7',
    textAlign: 'center',
    fontWeight: 'bold',
    color: Color.text_black,
  },
  appTitle1: {
    marginTop: '-6@ms0.7',
  },
});
