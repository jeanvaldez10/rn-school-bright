import React from 'react';
import {View, ScrollView, Text, TouchableOpacity, Image, Dimensions, Alert} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import Color from '../../constants/color';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Images from '../../themes/Images';
import {
  navigateMenu,
  quickMenuStyles,
  getMenu
} from "../../constants/functions";
import Constant from "../../constants/constants";
// import * as Animatable from 'react-native-animatable';
import {DragSortableView} from "react-native-drag-sort";
import AlertWithImageModal from "../../components/AlertWithImageModal";
import DeviceInfo, {getUniqueId} from "react-native-device-info";
import SelectAttendanceModal from "../../components/SelectListModalNoTitleMenu";
import AnimatedImage from "../../components/AnimatedImage";
import CustomModal from "../../components/CustomModal";
import {bindActionCreators} from "redux";
import {setIsEditStatus, setQuickMenu, setTabIndex} from "../../redux/actions";
import {connect} from "react-redux";
import {withNavigationFocus} from "react-navigation";
import ReLoginModal from "../../components/ReLoginModal";
import {updatePassword} from "../../utils/DBManager";



const {width} = Dimensions.get('window');
const isTablet = width >= 600;
const parentWidth = width - (isTablet ? 120 : 56);
const childrenWidth = parentWidth / 4;
const childrenHeight = childrenWidth + 24;
const marginChildrenTop = 0;
const marginChildrenBottom = 0;
const marginChildrenLeft = 0;
const marginChildrenRight = 0;

class ServicesTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      health: {},
      showCalendarModal: false,
      quickMenu: [],
      allMenu: [],
      scrollEnabled: true,
      showModal: false,
      modalBody: '',
      userInfo: {},
      loginInfo: {},
      deviceInfo: {},
      imei: getUniqueId(),
      publicIP: null,
      authInfo: {resCode: 200, resDesc: ""},
      showMenuModal: false,
      subMenuList: [],
      showComingSoonModal: false,

      showReLoginModal: false,
      reLoginUser: '',
      password: '',
      selectedItem: null,
      passwordError: '',
    };
  }

  async componentDidMount() {
    const userInfo = await Storage.getUserInfo();
    const loginInfo = await Storage.getUser();
    const deviceInfo = await Storage.getDeviceInfo();
    const {allMenu, quickMenu} = await getMenu(userInfo, this);
    this.props.setQuickMenu(quickMenu);
    this.setState({quickMenu, allMenu, userInfo, deviceInfo, loginInfo, isLoading: false});
  }

  componentWillUnmount = () => {
  };

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (!this.props.isSelected && nextProps.isSelected) {
      this.setState({quickMenu: this.props.devReducer.quickMenu});
    }
    return true;
  }

  gotoAddedProfile(item) {
    if (this.props.devReducer.isEditStatus) {
      return false;
    }
    const {publicIP, imei} = this.state;
    this.setState({isLoading: true, selectedItem: item});
    ApiManager.signin(item.userloginid, item.userpassword, item.schoolID, imei, publicIP)
      .then(async success => {
        this.setState({isLoading: false});
        if (!success) {
          const msg = translang.t('INCORRECT_USERNAME_PWD') + '\n' + translang.t('CONTACT_YOUER_SCHOOL_ADMIN');
          return Promise.reject(msg);
        } else {
          const user = await Storage.getUser();
          const userId = user.ID;
          const schoolId = user.SchoolId;
          await Storage.setVerifyFlag(false);
          return ApiManager.getUserInfo(userId, schoolId);
        }
      })
      .then(() => {
        this.props.setTabIndex(0);
        this.props.navigation.navigate('AuthLoading');
      })
      .catch(err => {
        if (err == "Failed to login") {
          let name = item.name + " " + item.lastname;
          if (getCurrentLocale() == 'en' && item.nameen) {
            name = item.nameen + " " + item.lastnameen;
          }
          this.setState({
            showReLoginModal: true,
            isLoading: false,
            modalBody: translang.t('CANT_LOGIN_USER'),
            reLoginUser: name,
            password: ''
          });
        } else {
          this.setState({
            isLoading: false,
            showModal: true,
            modalBody: translang.t('INCORRECT_USERNAME_PWD') + '\n' + translang.t('CONTACT_YOUER_SCHOOL_ADMIN')
          });
        }
      });
  }

  renderProfileItem(item, i, owner) {
    let profileImage = '';
    let name = '';
    if (!owner) {
      profileImage = item.type == '1' ? Images.teacher_02 : Images.student_01;
      if (item.imguser !== "null" && item.imguser !== null) {
        profileImage = {uri: item.imguser};
      }

      name = item.name;
      if (getCurrentLocale() == 'en' && item.nameen !== undefined && item.nameen !== '' && item.nameen !== '') {
        name = item.nameen;
      }
    } else {

      profileImage = item.Type == '1' ? Images.teacher_02 : Images.student_01;
      if (item.image !== "null" && item.image !== null) {
        profileImage = {uri: item.image};
      }

      name = item.name;
      if (getCurrentLocale() == 'en' && item.nameEN !== undefined && item.nameEN !== '' && item.nameEN !== '') {
        name = item.nameEN;
      }
    }


    return (
      <View style={quickMenuStyles.accountItemContainer} key={i}>
        <TouchableOpacity style={styles.profileImageBox}
                          onPress={() => {
                            !owner && this.gotoAddedProfile(item);
                          }}>
          <Image source={profileImage}
                 style={styles.profileImageStyle}/>
        </TouchableOpacity>
        <Text style={quickMenuStyles.appTitle}>{name}</Text>
      </View>
    )
  }

  renderAddedProfile() {
    var res = [];
    let count = 0;
    if (!this.props.devReducer.loginInfo) {
      return res;
    }
    res.push(this.renderProfileItem(this.props.devReducer.loginInfo, 0, true));
    count = count + 1;
    if (Constant.AddProfiles.length > 0) {
      for (let i = 0; i < Constant.AddProfiles.length; i++) {
        let item = Constant.AddProfiles[i];
        let isShowUnread = false;
        if (item.unreadcnt > 0) {
          isShowUnread = true
        }
        if (this.props.devReducer.userInfo.ID != item.userid) {
          res.push(this.renderProfileItem(item, i + 1, false));
          count = count + 1;
        }
      }
    }

    res.push(
      <View style={quickMenuStyles.accountItemContainer}
            key={count + 10}>
        <TouchableOpacity style={quickMenuStyles.addAccountBox}
                          onPress={() => {
                            if (!this.props.devReducer.isEditStatus) {
                              this.props.navigation.navigate('SettingAddAccount', {parent: 'UserInfo'});
                            }
                          }}>
          <Image source={Images.add_account}
                 style={quickMenuStyles.addAccountImage}/>
        </TouchableOpacity>

        <Text style={quickMenuStyles.appTitle}>{translang.t('add_account')}</Text>
      </View>
    );
    return res;
  }

  checkInQuickMenu = (item) => {
    return this.state.quickMenu.filter((item1) => item1.key == item.key).length > 0
  }

  onPressMenu = (item) => {
    const {quickMenu} = this.state;
    const {isEditStatus} = this.props.devReducer;
    if (isEditStatus) {
      if (quickMenu.length < 8) {
        if (!this.checkInQuickMenu(item)) {
          this.setState({quickMenu: [...quickMenu, item]});
        }
      }
    } else {
      navigateMenu(item, this);
    }
  }

  renderSectionMenu(sectionMenus) {
    let res = [];
    const {isEditStatus: isEdit} = this.props.devReducer;
    sectionMenus.map((item, i) => {

      const title = translang.t(item.key);
      const titles = title.split('\n');
      res.push(
        <View style={quickMenuStyles.accountItemContainer}
              key={i}
        >
          <TouchableOpacity onPress={() => this.onPressMenu(item)}
                            style={quickMenuStyles.addAccountBox}>
            <Image source={item.image} style={quickMenuStyles.addAccountImage}
                              animation={this.props.devReducer.isEditStatus ? 'pulse' : ''} easing="linear"
                              direction={"alternate"}
                              iterationCount='infinite'/>

            {isEdit && !this.checkInQuickMenu(item) &&
            <View
              style={styles.deleteIconBox}><Text style={styles.deleteIcon}>+</Text></View>
            }
          </TouchableOpacity>

          <Text style={quickMenuStyles.appTitle}>{titles[0]}</Text>
          {titles.length == 2 && <Text style={[quickMenuStyles.appTitle, quickMenuStyles.appTitle1]}>{titles[1]}</Text>}
        </View>
      )
    });
    return res;
  }

  renderAllMenu() {
    let res = [];
    const {allMenu} = this.state;
    for (const section in allMenu) {
      res.push(
        <View style={styles.quickMenuSection} key={section}>
          <Text style={styles.quickMenuSectionTitle}>{translang.t(section)}</Text>
          <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap', marginTop: 12,}}>
            {this.renderSectionMenu(allMenu[section])}
          </View>
        </View>
      )
    }
    return res;
  }

  removeItemFromQuickMenu = (item) => {
    let quickMenu = this.state.quickMenu;
    quickMenu = quickMenu.filter((obj) => obj.key != item.key);
    this.setState({quickMenu: [...quickMenu]});
  }

  renderItem = (item, index) => {
    const {isEditStatus: isEdit} = this.props.devReducer;
    const title = translang.t(item.key);
    const titles = title.split('\n');
    return (
      <View style={styles.accountItemContainer1}
            key={item.key}
      >
        <TouchableOpacity style={quickMenuStyles.addAccountBox} disabled={isEdit}
                          onPress={() => this.onPressMenu(item)}>
          <Image animation={isEdit ? 'pulse' : ''} easing="linear" direction='alternate'
                            iterationCount='infinite' style={quickMenuStyles.addAccountImage} source={item.image}/>
          {isEdit &&
          <TouchableOpacity
            onPress={() => this.removeItemFromQuickMenu(item)}
            style={styles.deleteIconBox}><Text style={styles.deleteIcon}>x</Text></TouchableOpacity>
          }
        </TouchableOpacity>
        <Text style={quickMenuStyles.appTitle}>{titles[0]}</Text>
        {titles.length == 2 && <Text style={[quickMenuStyles.appTitle, quickMenuStyles.appTitle1]}>{titles[1]}</Text>}
      </View>
    );
  }

  onPressSubMenu = (item) => {
    this.setState({showMenuModal: false});
    if (item === null) return;
    navigateMenu(item, this);
  };


  reLogin() {
    const {publicIP, imei, selectedItem: item, password} = this.state;
    this.setState({isLoading: true});
    ApiManager.signin(item.userloginid, password, item.schoolID, imei, publicIP)
      .then(async success => {
        this.setState({isLoading: false});
        if (!success) {
          this.setState({passwordError: translang.t('WRONG_PASSWORD')});
          return Promise.reject(msg);
        } else {
          const user = await Storage.getUser();
          const userId = user.ID;
          const schoolId = user.SchoolId;
          await updatePassword(userId, password);
          await Storage.setVerifyFlag(false);
          return ApiManager.getUserInfo(userId, schoolId);
        }
      })
      .then(() => {
        this.props.setTabIndex(0);
        this.props.navigation.navigate('AuthLoading');
      })
      .catch(err => {
        console.log("Drawer", err);
        this.setState({passwordError: translang.t('WRONG_PASSWORD'), isLoading: false});
      });
  }

  render() {
    const {isEditStatus: isEdit} = this.props.devReducer;
    const {scrollEnabled} = this.state;
    return (
      <View>
        <ScrollView style={{backgroundColor: 'white', minHeight: '100%'}} scrollEnabled={scrollEnabled}
                    contentContainerStyle={{paddingBottom: 60}}
                    ref={(scrollView) => this.scrollView = scrollView}>
          <View style={{borderTopRightRadius: 16, borderTopLeftRadius: 16, backgroundColor: 'white'}}>
            <View style={styles.sectionContainer}>
              <View style={styles.accountSection}>
                <Text style={styles.sectionTitle}>{translang.t('all_your_accounts')}</Text>
                <View style={styles.accountSectionBox}>
                  {this.renderAddedProfile()}
                </View>
              </View>
              <View style={styles.quickMenuSection}>
                <View style={styles.quickMenuSectionHeader}>
                  <Text style={styles.quickMenuSectionTitle}>{translang.t('quick_menu')}</Text>
                  <TouchableOpacity style={isEdit ? styles.saveButton : styles.arrangeButton}
                                    onPress={async () => {
                                      const {quickMenu, userInfo} = this.state;
                                      const {isEditStatus} = this.props.devReducer;
                                      this.props.setIsEditStatus(!isEditStatus);
                                      if (isEditStatus) {
                                        this.props.setQuickMenu(quickMenu);
                                        if (userInfo.StudentId) {
                                          await Storage.setQuickMenuStudent(quickMenu);
                                        } else {
                                          await Storage.setQuickMenuTeacher(quickMenu);
                                        }
                                      }
                                    }}>
                    <Text
                      style={isEdit ? styles.saveButtonText : styles.arrangeButtonText}>{isEdit ? translang.t('SAVE') : translang.t('arrange')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.wrapper}>
                  <DragSortableView
                    dataSource={this.state.quickMenu}
                    parentWidth={parentWidth}
                    childrenWidth={childrenWidth}
                    childrenHeight={childrenHeight}

                    marginChildrenTop={marginChildrenTop}
                    marginChildrenBottom={marginChildrenBottom}
                    marginChildrenLeft={marginChildrenLeft}
                    marginChildrenRight={marginChildrenRight}

                    onDragStart={(startIndex, endIndex) => {
                      this.setState({
                        scrollEnabled: false
                      })
                    }}
                    onDragEnd={(startIndex) => {
                      this.setState({
                        scrollEnabled: true
                      })
                    }}
                    onDataChange={(data) => {
                      this.setState({
                        quickMenu: data
                      })
                    }}
                    keyExtractor={(item, index) => item.key}
                    renderItem={(item, index) => {
                      return this.renderItem(item, index)
                    }}
                  />
                </View>
              </View>
              <View>
                {this.renderAllMenu()}
              </View>

            </View>
          </View>

          <AlertWithImageModal
            isVisible={this.state.showModal}
            image={Images.n_ic_warning}
            message={this.state.modalBody}
            buttonColors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            onClose={() => {
              this.setState({showModal: false});
            }}/>
          <SelectAttendanceModal
            isVisible={this.state.showMenuModal}
            onListSelect={(item) => {
              this.onPressSubMenu(item)
            }}
            listData={this.state.subMenuList}
          />
          <CustomModal isVisible={this.state.showComingSoonModal} positiveText={translang.t('HOME_close')}
                       onPositivePress={() => {
                         this.setState({showComingSoonModal: false})
                       }} body={translang.t('coming_soon')}
                       negativeText={''} positiveBtnType={'green'}/>
        </ScrollView>
        <ProgressHud isVisible={this.state.isLoading}/>
        <ReLoginModal
          isVisible={this.state.showReLoginModal}
          showCancelButton={true}
          message={this.state.modalBody}
          passwordText={translang.t('ENTER_NEW_PASSWORD')}
          loading={this.state.isLoading}
          userName={this.state.reLoginUser}
          onClose={() => {
            this.setState({showReLoginModal: false})
          }}
          onConfirm={() => {
            this.reLogin();
          }}
          onForgot={() => {
            this.props.navigation.navigate('Forgotpass', {type: 1});
          }}
          password={this.state.password}
          onChangePassword={(password) => {
            this.setState({password: password, passwordError: ''});
          }}
          passwordError={this.state.passwordError}
        />
      </View>

    );
  }
}

const styles = ScaledSheet.create({
  wrapper: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '10@s'
  },

  headerBox: {
    width: '100%',
    paddingHorizontal: '16@s',
    alignItems: 'center'
  },

  headerStatusStyle: {
    height: '4@s',
    backgroundColor: Color.expandable_arrow,
    width: '40%',
    marginTop: '6@s',
    borderRadius: '3@s',
    marginHorizontal: 'auto'
  },

  headerBottomBar: {
    width: '100%',
    height: '2@s',
    marginTop: '14@s',
    borderRadius: '2@s',
    backgroundColor: Color.gray_bg,
  },

  sectionContainer: {
    paddingHorizontal: '20@s',
  },
  accountSection: {
    paddingTop: '24@s',
    paddingHorizontal: '12@s',
  },
  accountSectionBox: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: '10@s'
  },
  sectionTitle: {
    fontSize: '20@ms0.8',
    fontWeight: 'bold',
    color: Color.text_black,
  },
  quickMenuSection: {
    borderTopWidth: '1@s',
    borderTopColor: Color.text_black,
    paddingTop: '12@s',
    paddingHorizontal: '6@s',
  },
  quickMenuSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  quickMenuSectionTitle: {
    fontSize: '20@ms0.8',
    fontWeight: 'bold',
    color: Color.text_black,
  },
  arrangeButton: {
    borderRadius: '16@s',
    paddingHorizontal: '16@s',
  },
  arrangeButtonText: {
    color: Color.n_default_orange,
    fontSize: '20@ms0.8',
    fontWeight: 'bold'
  },
  saveButton: {
    backgroundColor: Color.n_button_gradient_green_start,
    borderRadius: '16@s',
    paddingHorizontal: '16@s',
  },
  saveButtonText: {
    color: Color.white,
    fontSize: '20@ms0.8',
    fontWeight: 'bold'
  },

  profileImageBox: {
    width: '48@ms',
    height: '48@ms',
    borderRadius: '50@s',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },

  profileImageStyle:
    {
      width: '42@ms',
      height: '42@ms',
      borderRadius: '24@ms0.8',
      resizeMode: 'cover'
    },
  accountItemContainer1: {
    width: childrenWidth,
    alignItems: 'center',
    paddingHorizontal: '2@s',
  },
  deleteIconBox: {
    position: 'absolute',
    top: '-4@s',
    right: '-4@s',
    backgroundColor: Color.n_black_bg_opacity,
    justifyContent: 'center',
    alignItems: 'center',
    width: '18@s',
    height: '18@s',
    borderRadius: '18@s'
  },
  deleteIcon: {
    color: 'white',
    fontSize: '14@s',
    fontWeight: 'bold'
  }
});


const mapStateToProps = (state) => {
  const {devReducer} = state;
  return {devReducer}
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    setIsEditStatus,
    setQuickMenu,
    setTabIndex
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(ServicesTab));

