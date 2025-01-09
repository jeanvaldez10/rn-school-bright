import React from 'react';
import { View, Text, ScrollView, ImageBackground, Image, Dimensions, TouchableOpacity, BackHandler } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import IconInfoItem from '../../components/IconInfoItem';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import CheckOutOnTimeModal from '../../components/CheckOutOnTimeModal';
import Images from '../../themes/Images';
import CustomTextInput from '../../components/CustomTextInput';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import NextButton from '../../components/NextButton';
import ProgressHud from '../../components/ProgressHud';
import ApiManager from '../../managers/ApiManager';

export default class BehaviorStudentIDScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: null,
      showUserInfoModal: false,
      userInfo: {},
      studentId: '',
      qrcodeData: {},
      qrcodeDataList: [],
      type: 1,  /// 0: add, 1: reduce
      parent: 'App',
    };
  }
  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      console.log("BehaviorStudentIDScreen");
      const userInfo = this.props.navigation.getParam('userInfo') ?? 0;
      const type = this.props.navigation.getParam('type') ?? 0;
      const from = this.props.navigation.getParam('parent') ?? 'App';

      this.setState({userInfo, type, parent: from});
    });

  }

  componentWillUnmount() {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.isSelected !== this.props.isSelected && this.props.isSelected === true) {
      const userInfo = await Storage.getUserInfo();
      this.setState({userInfo});
    }
  }

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }


    this.props.navigation.navigate(this.state.parent);
  }

  onClickNum = (number) => {
    let studentId = this.state.studentId;
    studentId = `${studentId}${number}`
    this.setState({ studentId });
  };

  onClickDelete = () => {
    let studentId = this.state.studentId;
    studentId = studentId.slice(0, -1);
    this.setState({ studentId });
  };

  onClickClear = () => {
    this.setState({ studentId: '' });
  };

  __search = () => {
    this.setState({ isLoading: true });

    ApiManager.getQRCodeDataWithID(this.state.userInfo.SchoolID, this.state.studentId, getCurrentLocale()).then(result => {
      this.setState({ isLoading: false });

      if (result.code === 200) {
        const dataList = result.qrcodeDataModels ?? [];
        if (dataList.length > 0) {
          this.setState({ qrcodeData:  dataList[0], showUserInfoModal: true });
        } else {
          this.setState({ showModal: true, modalBody: translang.t('USER_NOT_FOUND')});
        }
      } else {
        this.setState({ showModal: true, modalBody: translang.t('USER_NOT_FOUND')});
      }
    }).catch(error => {
      this.setState({ isLoading: false, showModal: true, modalBody: translang.t('USER_NOT_FOUND')});
    });
  };

  __next = () => {
    const type = this.state.type;
    const studentList = this.state.qrcodeDataList.map(q => {
      return {
        FirstNameTH: q.name,
        LastNameTH: q.lastname,
        FirstNameEN: q.name,
        LastNameEN: q.lastname,
        StudentPicture: q.picture,
        StudentID: q.studentId
      }
    });

    const params = {
      classLevel: this.state.classLevel,
      classRoom: this.state.classRoom,
      students: studentList,
      isReduce: type === 1,
      userInfo: this.state.userInfo,
      parent: 'BehaviorStudentID',
      'isRefresh': true,
    };
    this.props.navigation.navigate('BehaviorEdit', params);
  };

  addUserToList = () => {
    if (this.state.qrcodeData) {
      const list = [...this.state.qrcodeDataList, this.state.qrcodeData];
      this.setState({ qrcodeData:  {}, qrcodeDataList: list, showUserInfoModal: false, studentId: '' });
    }
  };

  render() {
    const alertImage = this.state.modalBody === translang.t('UPDATE_SUCCESS') ? Images.n_img_complete_green : Images.n_ic_warning;
    const alertButtonColor = this.state.modalBody === translang.t('UPDATE_SUCCESS') ? [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end] : [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end];

    const title = this.state.type === 0 ? translang.t('ADD_SCORE_WITH_STUDENT_ID') : translang.t('REDUCE_SCORE_WITH_STUDENT_ID');
    const searchButtonColor = [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end];
    const nextButtonColor = [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end];

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'bottom', 'left']}>
        <BackNavigationBar
          title={title}
          onMenuTap={() => this.back()}
          is_user={true}
          userCount={this.state.qrcodeDataList.length}
        />
        <ScrollView>
          <Image source={Images.ic_behavior_add_student_id} style={{width: 70, height: 70, resizeMode: 'contain', width: '100%', marginTop: 30}} />
          <Text style={styles.studentIdTitle}>{title}</Text>
          <CustomTextInput
            inputWrapperStyle={styles.enterStudentId}
            inputStyle={{textAlign: 'center', fontSize: 28, fontWeight: 'normal', fontFamily: 'THSarabunNew',}}
            placeholder={translang.t('ATTENDANCE_checkout_enter_studentid')}
            placeholderTextColor={Color.n_default_gray}
            onChangeText={this._onChangeUserName}
            editable={false}
            value={this.state.studentId}
          />

          <View style={{ flex: 1, marginHorizontal: 30, marginVertical: 10 }}>
            <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(1) }}><Text style={styles.eachNumTxt}>1</Text></TouchableOpacity>
              <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(2) }}><Text style={styles.eachNumTxt}>2</Text></TouchableOpacity>
              <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(3) }}><Text style={styles.eachNumTxt}>3</Text></TouchableOpacity>
            </View>
            <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(4) }}><Text style={styles.eachNumTxt}>4</Text></TouchableOpacity>
              <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(5) }}><Text style={styles.eachNumTxt}>5</Text></TouchableOpacity>
              <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(6) }}><Text style={styles.eachNumTxt}>6</Text></TouchableOpacity>
            </View>
            <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(7) }}><Text style={styles.eachNumTxt}>7</Text></TouchableOpacity>
              <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(8) }}><Text style={styles.eachNumTxt}>8</Text></TouchableOpacity>
              <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(9) }}><Text style={styles.eachNumTxt}>9</Text></TouchableOpacity>
            </View>
            <View style={{ height: 100, flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={{...styles.eachNumContainer, backgroundColor: Color.transparent, elevation: 0}} activeOpacity={0.3} onPress={() => { this.onClickClear() }}><Text style={{...styles.eachNumTxt, fontSize: 28, color: Color.n_default_orange}}>{translang.t('COMMON_clear')}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.eachNumContainer} activeOpacity={0.3} onPress={() => { this.onClickNum(0) }}><Text style={styles.eachNumTxt}>0</Text></TouchableOpacity>
              <TouchableOpacity style={{...styles.eachNumContainer, backgroundColor: Color.transparent, elevation: 0}} activeOpacity={0.3} onPress={() => { this.onClickDelete() }}><Image source={Images.n_ic_arrow_left_orange} style={styles.backIcon} /></TouchableOpacity>
            </View>
          </View>

          <View style={{flexDirection: 'row'}}>
            <NextButton
              label={translang.t('Search')}
              containerStyle={{width: '45%', marginLeft: 'auto', marginRight: 'auto', marginBottom: 30, }}
              buttonStyle={{ height: 65, borderRadius: 38,}}
              colors={searchButtonColor}
              isVerticalGradient={false}
              _onPress={() => this.__search()} />

            <NextButton
              label={translang.t('COMMON_next')}
              containerStyle={{width: '45%', marginLeft: 'auto', marginRight: 'auto', marginBottom: 30, }}
              buttonStyle={{ height: 65, borderRadius: 38,}}
              colors={nextButtonColor}
              isVerticalGradient={false}
              _onPress={() => this.__next()} />
          </View>
        </ScrollView>

        <ProgressHud isVisible={this.state.isLoading} />
        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => this.setState({ showModal: false })}
        />
        <CheckOutOnTimeModal
          isVisible={this.state.showUserInfoModal}
          title={this.state.type === 0 ? translang.t('DRAWER_add_behavior') : translang.t('DRAWER_reduce_behavior')}
          data={this.state.qrcodeData}
          onCancel={() => this.setState({ showUserInfoModal: false })}
          onOk={() => {
            this.setState({ showUserInfoModal: false });
            this.addUserToList();
          }}
        />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
    container: {
      flex: 1,
      backgroundColor: Color.n_background_white
    },
    studentIdTitle: {
      fontFamily: 'THSarabunNew',
      width: '100%',
      textAlign: 'center',
      fontSize: 30,
      fontWeight: 'bold',
      color: Color.n_default_gray,

      marginTop: 10,
      marginBottom: 5,
    },
    enterStudentId: {
      marginBottom: 10,
      marginHorizontal: 30,
      borderColor: Color.n_default_brown,
      borderRadius: 0,
      borderBottomWidth: 1,
    },
    eachNumContainer: {
      width: 80,
      height: 80,
      borderRadius: 10,
      backgroundColor: Color.n_default_brown,
      justifyContent: 'center',
      alignItems: 'center',

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    eachNumTxt: {
      fontFamily: 'THSarabunNew',
      fontSize: 54,
      color: Color.white,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    backIcon: {
      height: 40,
      width: 40,
    },
});
