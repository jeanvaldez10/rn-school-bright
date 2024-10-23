import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  BackHandler,
  FlatList,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import {Text} from 'native-base';
import {ScaledSheet} from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import NextButton from '../../components/NextButton';
import moment from 'moment';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import ProgressHud from '../../components/ProgressHud';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import CardInfoItem from '../../components/CardInfoItem';
import RNFS from 'react-native-fs';
import ImageView from "react-native-image-viewing";
import Hyperlink from 'react-native-hyperlink'
import {Linking} from 'react-native'
import FileViewer from "react-native-file-viewer";
import StorageManager from '../../managers/StorageManager';


export default class OnlineStudentHomeworkDetailForNotificationScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showImages: false,
      type: '',
      attachedImages: [],
      selectedTopic: {},
      userInfo: {},

      homeworkData: {},
      submittedData: {},
      attachedFiles: [],

      messageList: [],
      showMessageModal: false,
      sendMessage: "",
      homeworkID: "",
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = await StorageManager.getUserInfo();

      const homeworkID = this.props.navigation.getParam('homeworkID');
      this.setState({userInfo, homeworkID}, () => {
        this.loadHomework();
      });
    });
  }

  componentWillUnmount = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }
    if (this.focusListener) {
      this.focusListener.remove();
    }
  };

  back = () => {
    if (this.backhandler) {
      this.backhandler.remove();
    }
    const parentRoute = this.props.navigation.getParam('parent') ?? 'UserInfo';
    this.props.navigation.navigate(parentRoute);
  };

  openFile = (item) => {
    let date = new Date();
    const url = item.Link;
    const fileName = "online_" + Math.floor(date.getTime() + date.getSeconds() / 2);
    const extension = this.getUrlExtension(url, item.filetype);
    const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}.${extension}`;
    options = {fromUrl: url, toFile: localFile};
    this.setState({isLoading: true});
    RNFS.downloadFile(options)
      .promise.then(() => FileViewer.open(localFile))
      .then(() => {
        this.setState({isLoading: false});
      })
      .catch((error) => {
        this.setState({isLoading: false});
        console.log("OpenFilesError", error);
      });
  }
  getUrlExtension = (url, filetype) => {
    let res = url.split(/[#?]/)[0].split(".").pop().trim();
    if (res.length > 4) {
      res = filetype.split('/').pop().trim();
    }
    return res;
  }

  loadHomework = () => {

    const schoolid = this.state.userInfo.SchoolID;
    const studentid = this.state.userInfo.ID;
    const workId = this.state.homeworkID;

    this.setState({isLoading: true})
    ApiManager.getOnlineHomeworkForStudent(schoolid, studentid, workId).then(data => {
      console.log(data);
      this.setState({
        homeworkData: data.Info,
        submittedData: data.StudentInfo,
        attachedFiles: data.Attach,
        isLoading: false
      });
    }).catch(error => {
      console.error("getOnlineHomeworkForStudentErrorNOTIFICATION: ", error);
      this.setState({isLoading: false});
    });
  }

  renderAttachFile = (item, index) => {

    let image = Images.icon_pdf;
    if (item.ContentType.toLowerCase().includes('pdf')) {
      image = Images.icon_pdf;
    } else if (item.ContentType.toLowerCase().includes('word')) {
      image = Images.icon_word;
    } else if (item.ContentType.toLowerCase().includes('excel') || item.ContentType.toLowerCase().includes('sheet')) {
      image = Images.icon_excel;
    } else if (item.ContentType.toLowerCase().includes('powerpoint') || item.ContentType.toLowerCase().includes('presentation')) {
      image = Images.icon_ppt;
    } else if (item.ContentType.toLowerCase().includes('image')) {
      image = {uri: item.Link};
    } else {
      image = Images.icon_word;
    }

    return (
      <TouchableOpacity style={{marginVertical: 10, marginRight: 10}} key={index} onPress={() => {
        this.openFile(item)
      }}>
        <Image style={{width: 30, height: 50}} source={image}/>
      </TouchableOpacity>
    )
  }

  _next = () => {
    const params = {
      userInfo: this.state.userInfo,
      type: 0,
      homeworkID: this.state.homeworkID,
      teacherId: this.state.homeworkData.TeacherId,
      homeworkData: this.state.homeworkData,
      forceRefresh: true,
      isNotify: true,
    }

    this.props.navigation.navigate('OnlineStudentAddHomework', params);

  };

  render() {
    const {homeworkData, submittedData, userInfo} = this.state;

    let isSend = false
    if (userInfo.StudentId != null && homeworkData && homeworkData.IsSend && homeworkData.IsSend != null && homeworkData.IsSend == true) {
      isSend = true
    }

    let dateschedule = "";
    if (homeworkData.DeadlineDate != null) {
      dateschedule = moment(homeworkData.DeadlineDate).format('DD MMMM YYYY');
    }

    let subject = "";
    if (homeworkData) {
      subject = homeworkData.Subject;

      if (getCurrentLocale() == "en" && homeworkData.SubjectEn && homeworkData.SubjectEn.trim() != '') {
        subject = homeworkData.SubjectEn;
      }
    }
    let sender = "";
    if (homeworkData) {
      sender = homeworkData.Teacher;

      if (getCurrentLocale() == "en" && homeworkData.TeacherEn && homeworkData.TeacherEn.trim() != '') {
        sender = homeworkData.TeacherEn;
      }
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('HOMEWORK')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.container}>
          <View style={styles.dispcontainer}>
            <ScrollView>
              <CardInfoItem
                title={translang.t('HEAD_TOPIC')}
                value_txt={this.state.homeworkData.Title ?? ""}
                titleColor={Color.n_default_orange}
                infoColor={Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title={translang.t('TIMETABLE_subject')}
                value_txt={subject}
                titleColor={Color.n_default_orange}
                infoColor={Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title={translang.t('BROADCAST_sender')}
                value_txt={sender}
                titleColor={Color.n_default_orange}
                infoColor={Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title={translang.t('DEADLINE_DATE')}
                value_txt={dateschedule}
                titleColor={Color.n_default_orange}
                infoColor={Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <View style={{marginVertical: 5}}>
                <Text style={{
                  fontFamily: 'THSarabunNew',
                  color: Color.n_default_orange,
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginBottom: 5
                }}>{translang.t('HOMEWORK_description')}</Text>
                <Text style={{
                  fontFamily: 'THSarabunNew',
                  color: Color.n_default_gray,
                  fontSize: 24,
                  marginBottom: 5
                }}>{homeworkData.Description ?? ''}</Text>
              </View>

              {this.state.attachedFiles.length > 0 &&
              <View>
                <View style={{marginVertical: 5}}>
                  <Text style={{
                    fontFamily: 'THSarabunNew',
                    color: Color.n_default_orange,
                    fontSize: 24,
                    fontWeight: 'bold',
                    marginBottom: 5
                  }}>{translang.t('HOMEWORK_attachfile')}</Text>
                </View>
                <FlatList
                  style={{height: 80, marginHorizontal: 20}}
                  data={this.state.attachedFiles}
                  keyExtractor={(item, index) => index.toString()}
                  ItemSeparatorComponent={this.ItemSeparatorView}
                  renderItem={({item, index}) => this.renderAttachFile(item, index)}
                  horizontal
                />
              </View>
              }

              <View style={{marginVertical: 5}}>
                <Text style={{
                  fontFamily: 'THSarabunNew',
                  color: Color.n_default_orange,
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginBottom: 5
                }}>{translang.t('ATTACH_LINK')}</Text>
                <Hyperlink  onPress={url => {
                    Linking.openURL(url)
                  }} linkDefault={false} linkStyle={{color: "blue"}}>
                  <Text style={{
                    fontFamily: 'THSarabunNew',
                    color: Color.n_default_gray,
                    fontSize: 24,
                    marginBottom: 5
                  }}>{homeworkData.Link ?? ''}</Text>
                </Hyperlink>
              </View>
              {isSend && <>
                <View style={{height: 1, width: "100%", backgroundColor: Color.n_default_brown}}></View>

                <View style={{marginVertical: 5}}>
                  <Text style={{
                    fontFamily: 'THSarabunNew',
                    color: Color.n_default_orange,
                    fontSize: 24,
                    fontWeight: 'bold',
                    marginBottom: 5
                  }}>{translang.t('HOMEWORK_description')}</Text>
                  <Text style={{
                    fontFamily: 'THSarabunNew',
                    color: Color.n_default_gray,
                    fontSize: 24,
                    marginBottom: 5
                  }}>{submittedData.Remark ?? ''}</Text>
                </View>

                {submittedData.Attach && submittedData.Attach.length > 0 &&
                <View>
                  <View style={{marginVertical: 5}}>
                    <Text style={{
                      fontFamily: 'THSarabunNew',
                      color: Color.n_default_orange,
                      fontSize: 24,
                      fontWeight: 'bold',
                      marginBottom: 5
                    }}>{translang.t('HOMEWORK_attachfile')}</Text>
                  </View>
                  <FlatList
                    style={{height: 80, marginHorizontal: 20}}
                    data={submittedData.Attach}
                    keyExtractor={(item, index) => index.toString()}
                    ItemSeparatorComponent={this.ItemSeparatorView}
                    renderItem={({item, index}) => this.renderAttachFile(item, index)}
                    horizontal
                  />
                </View>
                }

                <View style={{marginVertical: 5}}>
                  <Text style={{
                    fontFamily: 'THSarabunNew',
                    color: Color.n_default_orange,
                    fontSize: 24,
                    fontWeight: 'bold',
                    marginBottom: 5
                  }}>{translang.t('ATTACH_LINK')}</Text>
                  <Hyperlink onPress={url => {
                    Linking.openURL(url)
                  }} linkDefault={false} linkStyle={{color: "blue"}}>
                    <Text style={{
                      fontFamily: 'THSarabunNew',
                      color: Color.n_default_gray,
                      fontSize: 24,
                      marginBottom: 5
                    }}>{submittedData.LinkUrl ?? ''}</Text>
                  </Hyperlink>
                </View>
              </>}
            </ScrollView>
          </View>

          {!isSend &&
          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={{width: 290, marginLeft: 'auto', marginRight: 'auto', marginBottom: 15,}}
            buttonStyle={{borderRadius: 38, height: 75}}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            _onPress={() => this._next()}/>
          }

        </View>

        <ImageView
          images={this.state.showImages}
          imageIndex={0}
          visible={this.state.showImageView}
          onRequestClose={() => this.setState({showImageView: false, selImageIndex: 0})}/>
        <ProgressHud isVisible={this.state.isLoading}/>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000025',
  },
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  dispcontainer: {
    flex: 1,
    margin: 20,
    backgroundColor: Color.white,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'visible',
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
    fontSize: '14@ms',
    paddingRight: 100,
  },
  itemActions: {
    position: 'absolute',
    right: 1,
    alignItems: 'center',
  },
  options1Text: {
    color: 'blueviolet',
    fontSize: '18@ms0.3',
  },
  options1Row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: '38%',
  },
  home: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    fontWeight: 'bold'
  },
  value2: {
    fontFamily: 'THSarabunNew',
    fontSize: 25,
  },
  attach2: {
    width: 100,
    height: 100,
  },

  centeredViewDlg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000090',
  },

  dialogStyle: {
    width: '90%',
    height: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },

  itemAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  createTopicViewContainer: {
    height: 50,
    borderColor: Color.n_default_orange,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 3,
    paddingLeft: 10,
    marginLeft: 20,
  },
});
