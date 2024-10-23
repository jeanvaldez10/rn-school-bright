import React, {Component} from 'react';
import {View, Text, Image, Modal, TouchableOpacity, Pressable, Dimensions} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import Images from '../themes/Images';
import Color from '../constants/color';
import CardFlip from 'react-native-card-flip';
import IconInfoItem from './IconInfoItem';
import CardInfoItem from './CardInfoItem';
import translang, {getCurrentLocale} from '../utils/language.utils';
import QRCode from 'react-native-qrcode-generator';
import moment from 'moment';
import {transform} from 'lodash';
import LinearGradient from 'react-native-linear-gradient';
import CheckVerification from "./CheckVerification";
import {resolve} from "react-native-svg/src/lib/resolve";
import ApiManager from "../managers/ApiManager";
import ProgressHud from "./ProgressHud";

class ProfileModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      qrcode: null,
      qrcode_show: false,
      qrcode_loading: true,
    }
  }

  loadQr = () => {
    let {user} = this.props;
    if (user === undefined || user === null) {
      user = {};
    }

    if (user.UserName) {
      const username = user.UserName;
      const userId = user.ID;
      const date = moment().format('DD-MM-yyyy');
      const time = moment().format('HH:mm:ss');
      let qrcode_s = `${username}@${userId}@${date}:${time}`;
      this.setState({qrcode_loading: true});
      ApiManager.GetRSACode(qrcode_s)
        .then(hash => {
        this.setState({qrcode: hash, qrcode_show: true}, ()=>{setTimeout(()=>{this.setState({qrcode_loading: false})}, 300)});
      })
    }
  }

  async componentDidMount() {
      this.loadQr();
  }

  async componentDidUpdate(prevProps, prevState) {
    const { isVisible } = this.props;
    const wasVisible = prevProps.isVisible;

    if (isVisible && !wasVisible) {
      this.setState({qrcode_show: false});
      await this.loadQr();
    }
  }


  render() {
    const {qrcode, qrcode_show, qrcode_loading } = this.state;
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const cardWidth = screenWidth * 0.75;
    let cardHeight = screenWidth * 1.6;
    let qrSize = 120;
    let qrSize1 = 120;
    let profileWidth = 130;
    if (screenWidth > 700) {
      cardHeight = screenHeight * 0.9;
      qrSize = screenWidth * 0.2;
      profileWidth = 130 * (screenHeight / 800);
    }

    qrSize1 = qrSize * 1.5;
    const {isVisible, onPositivePress} = this.props;
    let {user} = this.props;

    if (user === undefined || user === null) {
      user = {};
    }

    let studentId = user.StudentId ?? '';
    const isStudent = studentId !== '';
    let profileImage = isStudent ? Images.student_01 : Images.teacher_02;
    let logo = Images.n_card_logo;
    let userName = '';
    if (getCurrentLocale() == 'th'){
      userName = (user.sName ?? '') + ' ' + (user.sLastname ?? '');
    }else{
      userName = (user.NameEn ?? '') + ' ' + (user.LastNameEN ?? '');
    }

    let firstName = getCurrentLocale() == 'th' ? user.sName ?? "" : user.NameEn ?? '';
    let lastName = getCurrentLocale() == 'th' ? user.sLastname ?? "" : user.LastNameEN ?? '';

    if (user !== {}) {
      if (user.school_logo !== null && user.school_logo !== '') {
        logo = {uri: user.school_logo};
      }
      if (user.image !== null && user.image !== '') {
        profileImage = {uri: user.image};
      }

    }



    return (
      <Modal
        animationType="slide"
        transparent={true}
        key="modal"
        visible={isVisible}>

        <View style={styles.centeredView}>
          <View style={{...styles.cardContainer, width: cardHeight, height: cardWidth}}>
            <CardFlip style={{...styles.dialogStyle}} flipDirection='x' flipZoom={0} ref={(card) => this.card = card}>
              <TouchableOpacity
                activeOpacity={1}
                style={{...styles.card}}
                onPress={() => this.card.flip()}>
                <View
                  style={styles.cardContent}
                  activeOpacity={1}
                  onPress={() => this.card.flip()}>
                  <ProgressHud isVisible={qrcode_loading}/>
                  <Image source={Images.n_img_card_back} style={{
                    resizeMode: 'stretch',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    flex: 1
                  }}></Image>
                  <LinearGradient
                    style={styles.schoolNameStyle}
                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                    colors={[Color.n_button_gradient_orange_end, Color.n_button_gradient_orange_start]}>
                    <Image source={logo} style={styles.schoolLogo}/>
                    <View style={{marginLeft: 20,}}>
                      <Text style={{...styles.schoolName1}}>{user.SchoolName ?? ''}</Text>
                      <Text style={{...styles.schoolName}}>{user.SchoolNameEN ?? ''}</Text>
                    </View>
                  </LinearGradient>

                  <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,}}>
                    <Image source={profileImage} style={{...styles.profileImg, width: profileWidth}}></Image>
                    <View style={{alignItems: 'center', position: 'absolute', bottom: 40, right: 10}}>
                      {qrcode_show &&
                      <QRCode value={qrcode} size={qrSize}/>}
                    </View>

                    <View style={{flex: 1, paddingTop: 10, marginRight: 40}}>
                      {isStudent &&
                      <CardInfoItem
                        title={translang.t('PROFILE_studentid')}
                        value_txt={user.StudentId ?? '-'}/>
                      }
                      {!isStudent &&
                      <CardInfoItem
                        title={translang.t('staff_id')}
                        value_txt={user.StaffID ?? '-'}/>
                      }

                      <CardInfoItem
                        title={translang.t('PROFILE_firstname')}
                        value_txt={firstName ?? '-'}/>
                      <CardInfoItem
                        title={translang.t('PROFILE_lastname')}
                        value_txt={lastName ?? '-'}/>
                      {isStudent &&
                      <>
                        <CardInfoItem
                          title={translang.t('PROFILE_levelclass')}
                          value_txt={getCurrentLocale() == 'th' ? user.StudentClass ?? '-' : user.StudentClassEN ?? '-'}/>
                      </>
                      }
                      {!isStudent &&
                      <>
                        <CardInfoItem
                          title={translang.t('PROFILE_department')}
                          value_txt={user.department ?? '-'}/>

                        <CardInfoItem
                          title={translang.t('PROFILE_position')}
                          value_txt={user.job_name ?? '-'}/>
                      </>
                      }
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={1}
                style={[styles.card]}
                onPress={() => this.card.flip()}>
                <View style={styles.cardContent}
                      activeOpacity={1}
                      onPress={() => this.card.flip()}>
                  <ProgressHud isVisible={qrcode_loading}/>
                  <Image source={Images.n_img_card_back} style={{
                    resizeMode: 'stretch',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    flex: 1
                  }}></Image>
                  <LinearGradient
                    style={styles.schoolNameStyle}
                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                    colors={[Color.n_button_gradient_orange_end, Color.n_button_gradient_orange_start]}>
                    <Image source={logo} style={styles.schoolLogo}/>
                    <View style={{marginLeft: 20,}}>
                      <Text style={{...styles.schoolName1}}>{user.SchoolName ?? ''}</Text>
                      <Text style={styles.schoolName}>{user.SchoolNameEN ?? ''}</Text>
                    </View>

                  </LinearGradient>
                  <View style={{alignItems: 'center'}}>
                    {qrcode_show &&
                    <QRCode value={qrcode} size={qrSize1}/>
                    }
                  </View>
                  <Text style={styles.userName}>{userName}</Text>
                </View>
              </TouchableOpacity>
            </CardFlip>

            <View
              style={{}}>
              <TouchableOpacity onPress={onPositivePress} style={{width: 70, height: 70, justifyContent: 'center'}}>
                <Image source={Images.n_close_circle} style={styles.close_icon}/>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    );
  }
}

const styles = ScaledSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000070',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    transform: [{rotateZ: '90deg'}],
    position: 'relative',
  },
  dialogStyle: {
    width: '80%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

  },
  close_icon: {
    width: "100%",
    height: "100%",
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  schoolNameStyle: {
    flexDirection: 'row',
    paddingHorizontal: "20@ms",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center'
  },

  schoolLogo: {
    width: "45@s",
    height: "45@s",
    resizeMode: 'contain',
  },
  profileImg: {
    height: '100%',
    width: "130@vs",
    resizeMode: 'contain',
    marginRight: 15,
  },

  schoolName: {
    fontFamily: 'THSarabunNew',
    fontSize: "18@ms",
    color: Color.white,
  },

  schoolName1: {
    fontFamily: 'THSarabunNew',
    fontSize: "28@ms",
    color: Color.white,
  },

  infoItem: {
    marginVertical: 10,
  },
  infoTitle: {
    fontWeight: 'bold',
    fontSize: "24@ms",
    color: Color.n_default_gray,
  },
  infoValue: {
    fontSize: "20@ms",
    fontWeight: 'bold'
  },
  cardBackImage: {
    flex: 1,
    height: '100%',
    resizeMode: 'contain',
    marginHorizontal: 20
  },
  userName: {
    width: '100%',
    fontWeight: 'bold',
    fontSize: '24@ms',
    textAlign: 'center',
    color: Color.n_default_gray,
    marginBottom: 20
  }
});

export default ProfileModal;
