import React from 'react';
import {
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet} from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import GradientButton from '../../components/GradientButton';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import ApiManager from '../../managers/ApiManager';
import CardInfoItem from '../../components/CardInfoItem';
import moment from 'moment';
import ImageView from "react-native-image-viewing";
import MyImageView from "../../components/MyImageView";
import TextInputModal from '../../components/TextInputModal';

export default class LeaveRequestDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: '',
      userInfo: {},
      letterId: '',
      leaveRequest: {},
      type: '', //reportteacher, reportstudent, teacherleaverequest, notification, teacherstudent
      showImageView: false,
      selImageIndex: 0,
      showRejectReasonModal: false,
      rejectReason: '',

      season: -1,
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

      console.log("LeaveRequestDetailScreen");
      const userInfo = this.props.navigation.getParam('userInfo');
      const letterId = this.props.navigation.getParam('letterId');
      const type = this.props.navigation.getParam('type');
      this.setState({ userInfo: userInfo, letterId: letterId, type: type, leaveRequest: {} }, () => {
        this.loadData();
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

  loadData = () => {
    const messageId = this.state.letterId;
    const userId = this.state.userInfo.ID;
    this.setState({ isLoading: true });
    ApiManager.getLeaveRequestDetail(userId, messageId).then(detail => {
      this.setState({ leaveRequest: detail, isLoading: false, season: detail.Season});
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    const from = this.props.navigation.getParam('from') ?? 'LeaveRequest';
    this.props.navigation.navigate(from);
  };

  doReject = () => {
    this.setState({showRejectReasonModal: true});
  };

  doUpdateStatus = (status, reason) => {
    if (status == '-1') {
      return;
    }

    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;

    const detail = this.state.leaveRequest ?? {};
    let old_status = '-1';
    if(detail.ApprovedStatus){
      old_status = detail.ApprovedStatus.StatusCode;
    }

    ApiManager.updateLeaveRequestStatus(userInfo.ID, this.state.letterId, status, userInfo.SchoolID, reason).then(result => {
      if(result == "SUCCESS"){
        if (old_status == '5' && status == '3'){
          this.setState({ isLoading: false,  showModal: true, modalBody: translang.t('CANCELED_REQUEST_SUCCESS')}, () => {
            this.loadData();
          });
        }else{
          this.setState({ isLoading: false}, () => {
            this.loadData();
          });
        }

      }else{
        this.setState({ isLoading: false, showModal: true, modalBody: translang.t('NOT_CANCEL_REQUEST_PAST_TODAY') });
      }
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  renderAttachImages = (item, index) => {
    return (
      <TouchableOpacity style={{position: 'relative', marginRight: 5}} key={index} onPress={()=>this.setState({showImageView: true, selImageIndex: index})} >
        <Image style={{width: 50, height: 70}} source={{uri: item.uri}} />
      </TouchableOpacity>
    )
  }

  onCancelLeave = () =>{
    this.setState({ isLoading: true });
    const userInfo = this.state.userInfo;

    const detail = this.state.leaveRequest ?? {};
    let status = '-1';
    if(detail.ApprovedStatus){
      status = detail.ApprovedStatus.StatusCode
    }


    ApiManager.requestCancel(this.state.letterId, userInfo.ID).then(result => {
      if(result == "SUCCESS"){
        let modal_text = '';
        if(status == '0'){
          modal_text = translang.t('CANCEL_REQUEST_SENT');
        }
        else if(status == '1'){
          modal_text = translang.t('CANCEL_REQUEST_SENT');
        }
        else if(status ==  '5'){
          modal_text = translang.t('CANCELED_REQUEST_SUCCESS');
        }
        this.setState({ isLoading: false, showModal: true, modalBody: modal_text }, () => {
          this.loadData();
        });
      }else{
        this.setState({ isLoading: false, showModal: true, modalBody: translang.t('NOT_CANCEL_REQUEST_PAST_TODAY') });
      }

    }).catch(error => {
      console.log("onCancelLeave", error);
      this.setState({ isLoading: false });
    });
  }

  render() {

    const detail = this.state.leaveRequest ?? {};
    let status = '-1';
    // const statusStr = detail.ApproveStatus ?? "";
    let apprCnt = 0;
    let isAccepted = false;

    if(detail.ApprovedStatus){
      status = detail.ApprovedStatus.StatusCode;
      apprCnt = detail.ApprovedStatus.ApprovalAmount
    }
    if(detail.approveDatas){
      if(detail.approveDatas.length > 0){
        const temp = detail.approveDatas.filter(item=>item.UserID == this.state.userInfo.ID);
        if(temp.length > 0){
          isAccepted = true;
        }
      }
    }

    let address = '';
    if (detail.HomeNumber && detail.HomeNumber !== '') {
      address = address + detail.HomeNumber;
    }
    if (detail.Road && detail.Road !== '') {
      address = address + detail.Road;
    }
    if (detail.Tumbon && detail.Tumbon !== '') {
      address = address + ', ' + detail.Tumbon;
    }
    if (detail.Aumpher && detail.Aumpher !== '') {
      address = address + ', ' + detail.Aumpher;
    }
    if (detail.Province && detail.Province !== '') {
      address = address + ', ' + detail.Province;
    }

    address = address.trim();

    const phonenum = detail.Phone;

    let statusText = '';
    let statusTextColor = Color.n_default_orange
    let showApproveRejectButton = false;
    let showAcceptCancelButton = false;
    let ApproveCountString = translang.t('WAITING_APPROVE', {count: apprCnt});
    let showAllowRejectReason = false;

    const from = this.props.navigation.getParam('from');
    const type = this.state.type;
    let isMoreShow = false;

    if (status == '0') {
      statusText = translang.t('LEAVE_pending');
      statusTextColor = Color.n_default_brown;

      showApproveRejectButton = true;
      showAcceptCancelButton = false;
      if(isAccepted){
        showApproveRejectButton = false;
      }
    } else if (status == '1') {
      statusText = translang.t('LEAVE_approved');
      statusTextColor = Color.n_button_gradient_green_start;

      showApproveRejectButton = false;
      showAcceptCancelButton = false;
    } else if (status == '2') {
      statusText = translang.t('LEAVE_rejected');
      statusTextColor = Color.leave_status_red;

      showApproveRejectButton = false;
      showAcceptCancelButton = false;
    } else if (status == '3') {
      statusText = translang.t('DELETED_BY_USER');
      statusTextColor = Color.n_default_gray;

      showApproveRejectButton = false;
      showAcceptCancelButton = false;
    } else if (status == '4') {
      statusText = translang.t('LEAVE_cancel');
      statusTextColor = Color.n_default_gray;

      showApproveRejectButton = false;
      showAcceptCancelButton = false;
    } else if (status == '5') {
      statusText = translang.t('REQUEST_CANCELED');
      statusTextColor = Color.n_default_brown;

      showApproveRejectButton = false;
      showAcceptCancelButton = true;
      if(isAccepted){
        showAcceptCancelButton = false;
      }
    }

    if(type == "reportteacher" || type == "reportstudent"){
      showApproveRejectButton = false;
      showAcceptCancelButton = false;
      isMoreShow = true;
    }

    let files = [];
    if(detail.file && detail.file.length > 0){
      files = detail.file.map((item) => { return {uri: item} });
    }

    const leaveSeasonList = [translang.t('MORNING'), translang.t('AFTERNOON')];
    let period = "";
    if(this.state.season != -1){
      period = leaveSeasonList[this.state.season];
    }

    let isShowClassroom = false;
    if(detail.senderClassroom && detail.senderClassroom != ""){
      isShowClassroom = true;
    }


    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_reportleave')}
          onMenuTap={() => this.back()}
          is_more={isMoreShow}
          actions={[translang.t('CANCEL')]}
          onMoreTap={(value, index) => {
            if (index === 0)
              this.onCancelLeave()
          }}
        />
        <ScrollView style={styles.container}>
          <View style={styles.statusContainer}>
            <View style={{flex: 1, height: 1, backgroundColor: statusTextColor}}/>
            <Text style={{...styles.statusText, color: statusTextColor, marginHorizontal: 10}}>{statusText}</Text>
            <View style={{flex: 1, height: 1, backgroundColor: statusTextColor}}/>
          </View>

          <View style={styles.dispcontainer}>
            <CardInfoItem
              title = {translang.t('LEAVE_sender')}
              value_txt = {`${detail.Code ?? ""} ${getCurrentLocale() == 'th' ? detail.senderName ?? "" : detail.senderNameEN ?? detail.senderName}`}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            {isShowClassroom &&
            <CardInfoItem
              title = {translang.t('HOMEWORK_classlevel')}
              value_txt = {getCurrentLocale() == 'th' ? detail.senderClassroom ?? "" : detail.senderClassroomEN ?? ""}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />
            }

            <CardInfoItem
              title = {translang.t('LEAVE_position')}
              value_txt = {detail.senderJob}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            <CardInfoItem
              title = {translang.t('LEAVE_reason')}
              value_txt = {getCurrentLocale() == 'th' ? detail.letterType : detail.letterTypeEN}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            <CardInfoItem
              title = {translang.t('LEAVE_from')}
              value_txt = {moment(detail.leaveStart).format('DD MMM YYYY')}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            {this.state.season == -1 &&
              <CardInfoItem
                title = {translang.t('LEAVE_to')}
                value_txt = {moment(detail.leaveEnd).format('DD MMM YYYY')}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />
            }
            {this.state.season != -1 &&
              <CardInfoItem
                title = {translang.t('PROFILE_PERIOD')}
                value_txt = {`${translang.t('DRAWER_halfday')} ${period}`}
                titleColor = {Color.n_default_orange}
                infoColor = {Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />
            }

            <CardInfoItem
              title = {translang.t('LEAVE_submitdate')}
              value_txt = {moment(detail.sendRequestDate).format('DD MMM YYYY HH:mm')}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            <View style={{marginVertical: 5}}>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('LEAVE_detail')}</Text>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, marginBottom: 5}}>{detail.letterDescription}</Text>
            </View>

            {(files && files.length > 0) &&
              <View style={{marginVertical: 5}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('LEAVE_attachimage')}</Text>
                <FlatList
                  data={files}
                  keyExtractor={(item, index) => index.toString()}
                  ItemSeparatorComponent={this.ItemSeparatorView}
                  renderItem={({item, index}) => this.renderAttachImages(item, index)}
                  horizontal
                />
              </View>
            }
            <View style={{marginVertical: 5}}>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('LEAVE_address2')}</Text>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, marginBottom: 5}}>{address}</Text>
            </View>

            <CardInfoItem
              title = {translang.t('PROFILE_phonenumber')}
              value_txt = {phonenum}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />
          </View>
          {apprCnt > 0 &&
            <View style={styles.approveContainer}>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.white, fontSize: 30, }}>{ApproveCountString}</Text>
            </View>}
          { showApproveRejectButton &&
            <View style={{ flexDirection: 'row', width: '90%', marginLeft: 'auto', marginRight: 'auto' }}>
              <GradientButton
                label={translang.t('LEAVE_reject')}
                containerStyle={{width: 150, flex: 1, marginTop:15, marginBottom: 10, paddingHorizontal: 3, shadowColor: 'transparent', shadowOpacity: 0 }}
                textStyle={{fontSize: 30, fontFamily: 'THSarabunNew'}}
                buttonStyle={{ borderRadius: 30, height: 60 }}
                colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                isVerticalGradient={false}
                _onPress={() => this.doReject()} />

              <GradientButton
                label={translang.t('LEAVE_approve')}
                containerStyle={{width: 150, flex: 1, marginTop:15, marginBottom: 10, paddingHorizontal: 3, shadowColor: 'transparent', shadowOpacity: 0 }}
                textStyle={{fontSize: 30, fontFamily: 'THSarabunNew'}}
                buttonStyle={{ borderRadius: 30, height: 60 }}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                isVerticalGradient={false}
                _onPress={() => this.doUpdateStatus("1", "")} />
            </View>
          }
          { showAcceptCancelButton &&
            <View style={{ flexDirection: 'row', width: '90%', marginLeft: 'auto', marginRight: 'auto' }}>
              <GradientButton
                label={translang.t('LEAVE_reject')}
                containerStyle={{width: 150, flex: 1, marginTop:15, marginBottom: 10, paddingHorizontal: 3, shadowColor: 'transparent', shadowOpacity: 0 }}
                textStyle={{fontSize: 30, fontFamily: 'THSarabunNew'}}
                buttonStyle={{ borderRadius: 30, height: 60 }}
                colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                isVerticalGradient={false}
                _onPress={() => this.doReject()} />

              <GradientButton
                label={translang.t('LEAVE_approve')}
                containerStyle={{width: 150, flex: 1, marginTop:15, marginBottom: 10, paddingHorizontal: 3, shadowColor: 'transparent', shadowOpacity: 0 }}
                textStyle={{fontSize: 30, fontFamily: 'THSarabunNew'}}
                buttonStyle={{ borderRadius: 30, height: 60 }}
                colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                isVerticalGradient={false}
                _onPress={() => this.doUpdateStatus("3", "")} />
            </View>
          }
        {/* {showAllowRejectReason &&
        <View style={{...styles.dispcontainer, flex: 0}}>
          <View style={{marginVertical: 5}}>
            <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('LEAVE_detail')}</Text>
            <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, marginBottom: 5}} multiline={true}>{"Djkdl;afjksdl;adafsdfdafsadffjkldsa;fjkld;sajkfl;dsajkfl;jdak"}</Text>
          </View>
        </View>
        } */}
        </ScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.checked}
          message={this.state.modalBody}
          buttonColors={[Color.green_button_next_color1]}
          onClose={() => { this.setState({ showModal: false }) }}
        />
        <ProgressHud isVisible={this.state.isLoading} />

        <MyImageView
          images={files}
          imageIndex={this.state.selImageIndex}
          visible={this.state.showImageView}
          onRequestClose={() => this.setState({showImageView: false, selImageIndex: 0})}
        />

        {this.state.showRejectReasonModal && (
          <TextInputModal 
            isVisible={this.state.showRejectReasonModal}
            dialogTtitle={translang.t('NOT_APPROVED_DUE_TO')}
            buttonTitle={translang.t('NOT_APPROVED')}
            onClose={() => this.setState({showRejectReasonModal: false})}
            onOk={(value) => {
              this.setState({
                showRejectReasonModal: false,
                rejectReason: value,
              }, () => {
                if (showApproveRejectButton) {
                  this.doUpdateStatus("0", value);
                } else if (showAcceptCancelButton) {
                  this.doUpdateStatus("4", value);
                }
              });
            }}
          />
        )}

      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    height: '100%',
    backgroundColor: Color.n_background_white,
  },
  statusContainer:{
    marginHorizontal: 15,
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  statusText: {
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    fontWeight: 'bold'
  },

  dispcontainer: {
    flex: 1,
    margin: 15,
    paddingLeft: 20,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: Color.white,
    shadowColor: Color.black,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  approveContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 25,
    backgroundColor: Color.n_science_blue,
    shadowColor: Color.black,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  }
});
