import React from 'react';
import {useState, useEffect} from "react";
import {Image, View, TouchableOpacity, ImageBackground, Modal, FlatList, BackHandler} from 'react-native';
import {Text} from 'native-base';
import {ScaledSheet} from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import {ScrollView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import ProfileModal from '../../components/ProfileModal';
import BackNavigationBar from '../../components/BackNavigationBar';
import Storage from '../../managers/StorageManager';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import moment from 'moment';

import CardInfoItem from '../../components/CardInfoItem';
import GradientButton from '../../components/GradientButton';
import CustomTextInput from '../../components/CustomTextInput';
import GradientButtonWithImg from '../../components/GradientButtonWithImg';

import LinearGradient from 'react-native-linear-gradient';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';
import apiHttpClient from '../../utils/apiHttpClient';
import {apiUrls} from '../../constants/ApiUrls';

import CustomSwitcher from '../../components/CustomSwitcher';
import CustomCheckButton from '../../components/CustomCheckButton';
import DropDownPicker from 'react-native-dropdown-picker';
import CalendarModal from '../../components/CalendarModal';
import ProfileSelectModal from '../../components/ProfileSelectModal'

import NetInfo from "@react-native-community/netinfo";
import AlertWithImageModal from '../../components/AlertWithImageModal';

export default class EditingHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      historyData: [],
      tableHead: [translang.t('HISTORY_TOPIC'), translang.t('HISTORY_STATUS'), translang.t('HISTORY_REQUESTED_TIME'),
        translang.t('HISTORY_ADJUSTMENT_TIME'), translang.t('HISTORY_NOTE')],
      widthArr: ['17%', '15%', '20%', '35%', '13%'],
      keyList: ['section', 'approveStatus', 'requestApproveDate', 'approveDate', 'approveComment']
    };
    this.focusListener = null;
  }

  unsubscribe = null;

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidMount() {

    const {navigation} = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      console.log("Editing History");

      const userInfo = await Storage.getUserInfo();
      this.setState({userInfo: userInfo}, () => {
        this.loadData();
      })
    });
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused && this.props.isFocused === true) {
      const user = await Storage.getUserInfo();
      this.setState({userInfo: user});
    }
  }

  componentWillUnmount = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }
    if (this.focusListener) {
      this.focusListener.remove();
    }

    this.focusListener.remove();
    // this.unsubscribe();
  };

  loadData = () => {
    this.setState({isLoading: true});
    const {userInfo} = this.state;
    ApiManager.getStudentRequestHistory(userInfo.SchoolID, userInfo.ID, getCurrentLocale()).then(res => {
      this.setState({historyData: res.data, isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false});
    });
  };

  back = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(parentRoute);
  };

  processValue = (value, index) => {
    let output = '';
    let textColor = Color.custom_text_title;
    if (index === 3 || index === 2) {
      if (value) {
        output = moment(value).format('DD/MM/YYYY \n HH:mm');
      }
    } else {
      output = value
    }

    if (index === 1) {
      if (value === 'Pending Approval' || value === 'รออนุมัติ') {
        textColor = Color.pager_orange_bg;
      }
      if (value === 'Not Approved' || value === 'ไม่อนุมัติ') {
        textColor = Color.red_color_bg;
      }
      if (value === 'Approved' || value === 'อนุมัติ') {
        textColor = Color.custom_highlight_green;
      }
    }

    return (
      <Text style={{...styles.headerElementText, color: textColor}}>{output}</Text>
    )
  };

  renderItem = (item, index) => {

    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {this.state.tableHead.map((head, index1) => (
          <View key={index1} style={{...styles.headerElement, width: this.state.widthArr[index1]}}>
            {this.processValue(item[this.state.keyList[index1]], index1)}
          </View>
        ))}
      </View>
    )
  }

  render() {
    const state = this.state;
    const element = (data, index) => (
      <TouchableOpacity onPress={() => {
      }}>
        <View style={styles.btn}>
          <Text style={styles.btnText}>button</Text>
        </View>
      </TouchableOpacity>
    );

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('EDITING_HISTORY')}
          onMenuTap={() => this.back()}
        />
        <ScrollView style={styles.container}>
          {this.state.historyData.length > 0 &&
          <View style={styles.partContainer}>
            <View style={styles.headContainer}>
              {this.state.tableHead.map((head, index) => (
                <View key={index} style={{...styles.headerElement, width: this.state.widthArr[index]}}>
                  <Text style={styles.headerElementText}>{head}</Text>
                </View>
              ))}
            </View>
            <View>
              <FlatList
                data={this.state.historyData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => this.renderItem(item, index)}
              />
            </View>
          </View>
          }
          {this.state.historyData.length == 0 &&
          <View style={{width: '100%', flex: 1, justifyContent: 'center', flexDirection: 'row', marginTop: 100}}>
            <Text>There is not history</Text>
          </View>
          }
        </ScrollView>
        <ProgressHud isVisible={this.state.isLoading}/>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  switchContainer: {
    marginHorizontal: 10,
    marginTop: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    borderRadius: 10,
  },

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
    paddingBottom: 25,
  },
  headerImgContainer: {
    height: 180,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardContainer: {
    width: 260,
    height: 147,
    borderRadius: 15,
    backgroundColor: Color.white,
  },

  menuItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },

  image: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    marginRight: 10,
  },
  topText: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.n_default_orange
  },
  bottomText: {
    fontFamily: 'THSarabunNew',
    fontSize: 22,
    color: Color.dark
  },
  titleTextStyle: {
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    color: Color.n_default_orange,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 30,
  },


  partContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    marginVertical: 10,
    marginHorizontal: 15,
    padding: 10,
    zIndex: 0,
  },

  headContainer: {
    borderBottomColor: Color.n_default_brown_light,
    borderBottomWidth: 2,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center'
  },

  headerElement: {
    paddingVertical: 8,
  },

  headerElementText: {
    fontSize: 10,
    textAlign: 'center',
  },
  head: {
    fontSize: 10,
    textAlign: 'center',
    height: 40,
    borderBottomColor: Color.n_default_brown_light,
    borderBottomWidth: 2,
  },
  text: {margin: 6},
  row: {flexDirection: 'row', backgroundColor: '#FFF1C1'},
  btn: {width: 58, height: 18, backgroundColor: '#78B7BB', borderRadius: 2},
  btnText: {textAlign: 'center', color: '#fff'}
});
