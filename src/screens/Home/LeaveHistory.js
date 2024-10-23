import React from 'react';
import {
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  FlatList,
  Image,
  Text,
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import dimension from '../../constants/dimension';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import IconInfoItemSmall from '../../components/IconInfoItemSmall';
import AttachInfoItem from '../../components/AttachInfoItem';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ApiManager from '../../managers/ApiManager';
import NextButton from '../../components/NextButton';
import ProgressHud from '../../components/ProgressHud';
import IconInfoItem_OneLine from '../../components/IconInfoItem_OneLine';
import CardInfoItem from '../../components/CardInfoItem';
import ImageView from "react-native-image-viewing";
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import moment from 'moment';

export default class LeaveHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalTitle: undefined,
      modalBody: '',
      modalType: 0,
      isLoading: false,
      sender: {},
      type: '',
      leaveReason: -1,
      leaveDate: '',
      leaveToDate: '',
      leaveSeasonIndex: -1,
      province: {},
      amphur: {},
      district: {},
      description: '',
      house: '',
      phonenumber: '',
      position: '',
      isSutdent: false,

      attachedImages: [],
      showAttachedImages: [],
      showImageView: false,
      selImageIndex: 0,

      teacherNameForStudent: "",
      classRoomForStudent: "",
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

      const sender = this.props.navigation.getParam('sender');
      const type = this.props.navigation.getParam('type');
      const leaveReason = this.props.navigation.getParam('leaveReason');
      const leaveDate = this.props.navigation.getParam('leaveDate');
      const leaveToDate = this.props.navigation.getParam('leaveToDate');
      const leaveSeasonIndex = this.props.navigation.getParam('leaveSeasonIndex');

      const phonenumber = this.props.navigation.getParam('phonenumber');
      const attachedImages = this.props.navigation.getParam('attachedImages') ?? [];
      const showAttachedImages = this.props.navigation.getParam('showAttachedImages') ?? [];

      const province = this.props.navigation.getParam('province');
      const amphur = this.props.navigation.getParam('amphur');
      const district = this.props.navigation.getParam('district');
      const description = this.props.navigation.getParam('description');
      const house = this.props.navigation.getParam('house');

      const isStudent = sender.StudentId !== '' && sender.StudentId !== null && sender.StudentId !== undefined;
      this.setState({ sender, type, leaveReason, leaveDate, leaveToDate, leaveSeasonIndex, province, amphur, district, description, house, phonenumber, isStudent, attachedImages, showAttachedImages }, () => {
        if (!isStudent) {
          this.getPositionData();
        }else{
          this.getStudentTeacherInfo();
        }
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
  };

  back = () => {
    // this.props.navigation.goBack();
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.navigate('LeaveInput');
  };

  __next = async () => {
    const title = translang.t('NUMBER_LEAVE_DAYS_NOT_ENOUGH');
    const message = translang.t('CHECK_LEAVE_DAYS_AT_TOP_RIGHT_CORNER');
    this.setState({ isLoading: false, showModal: true, modalTitle: title, modalBody: message,  modalType: 0 });
    return;

    this.setState({ isLoading: true });

    const { sender, type, leaveReason, leaveDate, leaveToDate, leaveSeasonIndex, province, amphur, district, description, house, phonenumber, position, isStudent , attachedImages} = this.state

    const senderId = sender.ID;

    const dayStart = leaveDate;
    const dayEnd = leaveToDate;
    const season = leaveSeasonIndex;
    const attachImg = attachedImages;

    const promise = ApiManager.sendLeaveData(senderId, leaveReason.typeId, dayStart, dayEnd, description, house, district, amphur, province, phonenumber, season, attachImg);
    promise.then(result => {
      if (result) {
        this.setState({ isLoading: false, showModal: true, modalTitle: undefined, modalBody: translang.t('COMPLETED'), modalType: 1 });
      } else {
        const message = translang.t('REACHED_LEAVE_REQ_LIMIT'); // + '\n' + translang.t('CONTACT_YOUER_SCHOOL_ADMIN');
        this.setState({ isLoading: false, showModal: true, modalBody: message,  modalType: 0 });
      }
    }).catch(error => {
      console.log("RNFS READFILE", error);
      this.setState({ isLoading: false, showModal: true, modalTitle: undefined, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN'), modalType: 0 });
    });
  };

  getPositionData = () => {
    ApiManager.getLeavePositionOfUser(this.state.sender.ID).then(position => {
      this.setState({ position });
    }).catch(error => {
      console.log(error);
    })
  };

  getStudentTeacherInfo = () => {
    ApiManager.getLeavePositionOfStudent(this.state.sender.ID).then(res => {
      if(getCurrentLocale() == 'th') {
        this.setState({ teacherNameForStudent: res.teacherHomeRoom, classRoomForStudent: res.room });
      }else{
        this.setState({ teacherNameForStudent: res.teacherHomeRoomEN, classRoomForStudent: res.roomEN });
      }
    }).catch(error => {
      console.log(error);
    })
  };

  renderAttachImages = (item, index) => {
    return (
      <TouchableOpacity style={{position: 'relative', marginRight: 5}} key={index} onPress={()=>this.setState({showImageView: true, selImageIndex: index})} >
        <Image style={{width: 50, height: 70}} source={{uri: item.uri}} />
      </TouchableOpacity>
    )
  }

  render() {
    const { sender, type, leaveReason, leaveDate, leaveToDate, leaveSeasonIndex, province, amphur, district, description, house, phonenumber, position, isStudent } = this.state
    // let userName = (sender.studentnameEN ?? '').trim();
    // if (userName === '') {
    //   userName = (sender.studentname ?? '').trim();
    // }



    let userName = '';
    let className = sender.StudentClass;
    if(getCurrentLocale()=='en'){
      if(sender.NameEn !== undefined && sender.NameEn !== null && sender.NameEn !== ""){
        userName = sender.NameEn;
        if(sender.LastNameEN !== undefined && sender.LastNameEN !== null && sender.LastNameEN !== ""){
          userName = userName + " " + sender.LastNameEN;
        }
      }else{
        userName = sender.sName + " " + sender.sLastname;
      }
      if(sender.StudentClassEN != ""){
        className = sender.StudentClassEN;
      }
    }else{
      userName = sender.sName + " " + sender.sLastname;
      className = sender.StudentClass;
    }


    const leaveSeasonList = [translang.t('MORNING'), translang.t('AFTERNOON')];
    let leaveSeason = '';
    if (leaveSeasonIndex !== -1) {
      leaveSeason = leaveSeasonList[leaveSeasonIndex];
    }

    let address = '';
    if (house !== '') {
      address = address + house;
    }
    if (district && district !== '') {
      address = address + '.' + district;
    }
    if (amphur && amphur !== '') {
      address = address + '.' + amphur;
    }
    if (province && province !== '') {
      address = address + '.' + province;
    }

    if (address.trim() === '') {
      address = '';
    }

    // const alertButtonColor = this.state.modalBody === translang.t('COMPLETED') ? [Color.green_button_next_color1, Color.green_button_next_color2] : [Color.red_orange, Color.soft_red];
    const alertButtonColor = [Color.green_button_next_color1, Color.green_button_next_color2];

    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_leave')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.container}>
          <View  style={styles.dispcontainer}>
            <ScrollView>
              <CardInfoItem
                title = {translang.t('LEAVE_sender')}
                value_txt = {userName}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5, marginHorizontal: 20}}
                titleFontSize={24}
                infoFontSize={24}
              />
              { isStudent &&
              <CardInfoItem
                title = {translang.t('LEAVE_teacher')}
                value_txt = {this.state.teacherNameForStudent}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5, marginHorizontal: 20}}
                titleFontSize={24}
                infoFontSize={24}
              />
              }
              { isStudent &&
              <CardInfoItem
                title = {translang.t('LEAVE_class')}
                value_txt = {this.state.classRoomForStudent}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5, marginHorizontal: 20}}
                titleFontSize={24}
                infoFontSize={24}
              />
              }
              { !isStudent &&
              <CardInfoItem
                title = {translang.t('LEAVE_position')}
                value_txt = {position}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5, marginHorizontal: 20}}
                titleFontSize={24}
                infoFontSize={24}
              />
              }
              <CardInfoItem
                title = {translang.t('LEAVE_reason')}
                value_txt = {getCurrentLocale() == 'th' ? leaveReason.typeName : leaveReason.typeNameEN}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5, marginHorizontal: 20}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title = {translang.t('LEAVE_startingdate2')}
                value_txt = {moment(leaveDate).format('DD MMM YYYY')}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5, marginHorizontal: 20}}
                titleFontSize={24}
                infoFontSize={24}
              />

              { type === 'FulldayLeave' &&
              <CardInfoItem
                title = {translang.t('LEAVE_endingdate2')}
                value_txt = {moment(leaveToDate).format('DD MMM YYYY')}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5, marginHorizontal: 20}}
                titleFontSize={24}
                infoFontSize={24}
              />
              }
              { type === 'HalfdayLeave' &&
              <CardInfoItem
                title = {translang.t('LEAVE_season')}
                value_txt = {`${translang.t('DRAWER_halfday')} ${leaveSeason}`}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5, marginHorizontal: 20}}
                titleFontSize={24}
                infoFontSize={24}
              />
              }
              <View style={{marginVertical: 5, marginHorizontal: 20}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('LEAVE_description2')}</Text>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>{description}</Text>
              </View>

              {/* <TouchableOpacity
                onPress={() => this.props.navigation.navigate('LeaveHistoryAttach')}>
                <AttachInfoItem
                  style={{ marginHorizontal: 10, marginVertical: 10 }}
                  icon_mark={Images.attach_image}
                  icon_attach={require("../../assets/images/sample_attach.png")}
                  label={translang.t('LEAVE_attachimage')}
                  topTextStyle={styles.title2}
                  bottomTextStyle={styles.attach2}
                  imageSize={30}
                />
              </TouchableOpacity> */}
              { this.state.showAttachedImages.length > 0 &&
              <View style={{marginVertical: 5, marginHorizontal: 20}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('ATTACHED_IMAGE')}</Text>
                <FlatList
                  data={this.state.showAttachedImages}
                  keyExtractor={(item, index) => index.toString()}
                  ItemSeparatorComponent={this.ItemSeparatorView}
                  renderItem={({item, index}) => this.renderAttachImages(item, index)}
                  horizontal
                />
              </View>
              }
              <View style={{marginVertical: 5, marginHorizontal: 20}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('LEAVE_CONTACT')}</Text>
              </View>

              <CardInfoItem
                title = {translang.t('LEAVE_address2')}
                value_txt = {address}
                titleColor = {Color.n_default_gray}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5, marginHorizontal: 20}}
                titleFontSize={20}
                infoFontSize={20}
              />

              <CardInfoItem
                title = {translang.t('PROFILE_phonenumber')}
                value_txt = {phonenumber}
                titleColor = {Color.n_default_gray}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5, marginHorizontal: 20}}
                titleFontSize={20}
                infoFontSize={20}
              />
            </ScrollView>
          </View>


          <NextButton
            label={translang.t('ATTENDANCE_submit')}
            containerStyle={styles.buttonStyle}
            buttonStyle={{ borderRadius: 40}}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />
        </View>
        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={this.state.modalType === 1 ? Images.n_img_complete_green : Images.ic_alert}
          title={this.state.modalTitle}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          buttonTitle={this.state.modalType === 1 ? translang.t('COMMON_close') : translang.t('COMMON_ok')}
          isVerticalGradient={false}
          onClose={() => {
            if (this.state.modalType === 1) {
              this.setState({ showModal: false });
              // this.props.navigation.navigate(this.state.type);
              this.props.navigation.navigate("App");
            } else {
              if (this.state.type === 'FulldayLeave') {
                this.setState({ showModal: false }, () => {
                  this.props.navigation.navigate("FulldayLeave");
                });
              } else {
                this.setState({ showModal: false }, () => {
                  this.props.navigation.navigate("HalfdayLeave");
                });
              }
            }
          }}
        />

        <ImageView
          images={this.state.showAttachedImages}
          imageIndex={this.state.selImageIndex}
          visible={this.state.showImageView}
          onRequestClose={() => this.setState({showImageView: false, selImageIndex: 0})}
        />

        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  dispcontainer: {
    margin: 20,
    flex: 1,
    backgroundColor: Color.white,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
        width: 1,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
    paddingVertical: 30,
  },




  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000025',
  },
  dialogStyle: {
    width: 350,
    height: dimension.px150,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '80%',
  },
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },

  itemIcon: {
    width: '25@ms',
    height: '25@ms',
  },
  uperCardChild: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 5,
    paddingVertical: 15,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  itemText: {
    marginLeft: '20@ms',
    color: '#000',
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    paddingRight: 100,
  },
  itemActions: {
    position: 'absolute',
    right: 1,
    alignItems: 'center',
  },
  attach2: {
    width: 100,
    height: 100,
  },
  bottombuttonStyle: {
    width: '100%',
    height: 60,
    borderRadius: 5,
    backgroundColor: Color.green_button_next_color1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  confirmbutton: {
    color: Color.white,
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
  },

  buttonStyle:{
    width: 290,
    marginVertical:10,
    marginLeft: 'auto',
    marginRight: 'auto',
  }
});
