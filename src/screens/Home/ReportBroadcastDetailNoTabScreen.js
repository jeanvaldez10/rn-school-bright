import React, {useState} from 'react';
import {Image, View, BackHandler, TouchableOpacity, Dimensions, ScrollView, Text, FlatList,} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';

import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';
import FilterModal from '../../components/FilterModal';
import ReportBroadcastDetailTab from './ReportBroadcastDetailTab';
import ReportBroadcastDetailRecipientTab from './ReportBroadcastDetailRecipientTab';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import CustomSwitcher from '../../components/CustomSwitcher';
import CardInfoItem from '../../components/CardInfoItem';
import moment from 'moment';
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import MyImageView from "../../components/MyImageView";

export default class ReportBroadcastDetailNoTabScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      tabIndex: 0,
      broadcast: {},
      recipients: [],
      userInfo: {},

      newsDetail: {},
      status: '',
      currentPage: 0,

      showImageView: false,
      showImages: [],
      showImageIndex: 0,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    console.log("ReportBroadcastDetailNoTabScreen");
    const {navigation} = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if (this.backhandler) {
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = this.props.navigation.getParam('userInfo');
      const broadcast = this.props.navigation.getParam('broadcast');
      this.setState({tabIndex: 0, broadcast: broadcast, userInfo: userInfo}, () => {
        this.loadData(true);
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

    const from = this.props.navigation.getParam('from') ?? 'App';
    this.props.navigation.navigate(from);
  };

  loadData = () => {
    this.setState({isLoading: true});

    const userInfo = this.state.userInfo;
    const news = this.state.broadcast;

    ApiManager.getBroadcastReportDetail(userInfo.SchoolID, news.news_id, getCurrentLocale()).then(detail => {
      this.setState({newsDetail: detail, isLoading: false}, () => {
        this.loadDataForReceipt(true);
        this.initImages();
      })
    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false});
    });
  }

  loadDataForReceipt = (isRefresh) => {
    this.setState({isLoading: true});

    const userInfo = this.state.userInfo;
    const news = this.state.broadcast;
    const page = isRefresh ? 0 : this.state.currentPage;

    ApiManager.getBroadcastReportRecieverList(userInfo.SchoolID, news.news_id, page + 1, this.state.status).then(list => {
      if (isRefresh) {
        this.setState({recipients: list, currentPage: page + 1, isLoading: false});
      } else {
        let recipients = this.state.recipients;
        recipients = recipients.concat(list);
        this.setState({recipients: recipients, currentPage: page + 1, isLoading: false});
      }
    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false});
    });
  };

  onChangeSwitcher = (index) => {
    this.setState({tabIndex: index, isEdit: false})
  }
  renderItem = (index) => {
    const user = this.state.recipients[index];

    let profileImage = user.sex === '0' ? Images.man_user : Images.women_user;
    if (user.picture) {
      profileImage = {uri: user.picture};
    }

    let name = user.user_name ?? "";
    if (getCurrentLocale() == "en" && user.user_nameEN != null && user.user_nameEN.trim() != "") {
      name = user.user_nameEN;
    }

    const nameArray = name.split(' ');
    let firstName = '';
    let lastName = '';
    if (nameArray.length > 0) {
      firstName = nameArray[0];
    }
    if (nameArray.length > 1) {
      lastName = nameArray[nameArray.length - 1];
    }

    let status = user.read_status ? translang.t('READ') : translang.t('UNREAD');
    let statusColor = user.read_status ? Color.n_button_gradient_green_start : Color.n_default_orange;

    return (
      <TouchableOpacity style={styles.listItem}>
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          fontFamily: 'THSarabunNew',
          color: Color.n_default_gray,
          paddingHorizontal: 10
        }}>{index + 1}</Text>
        <Image source={profileImage} style={styles.itemAvatar}></Image>
        <View
          style={{flexDirection: 'column', flex: 1, height: '100%', marginHorizontal: 10, justifyContent: 'center',}}>
          <Text style={styles.itemText}>{user.studentId}</Text>
          <Text style={styles.itemText}>{name}</Text>
          {/* <Text style={styles.itemText}>{lastName}</Text> */}
        </View>
        <Text style={{...styles.itemText, color: statusColor, fontWeight: 'bold'}}>{status}</Text>
      </TouchableOpacity>
    );
  };

  renderAttachImages = (item, index) => {
    let image = Images.icon_pdf;

    if (item.file_type.toLowerCase().includes('pdf')) {
      image = Images.icon_pdf;
    } else if (item.file_type.toLowerCase().includes('word')) {
      image = Images.icon_word;
    } else if (item.file_type.toLowerCase().includes('excel') || item.file_type.toLowerCase().includes('sheet')) {
      image = Images.icon_excel;
    } else if (item.file_type.toLowerCase().includes('powerpoint') || item.file_type.toLowerCase().includes('presentation')) {
      image = Images.icon_ppt;
    } else if (item.file_type.toLowerCase().includes('image')) {
      image = {uri: item.file_name};
    } else {
      image = Images.icon_word;
    }

    return (
      <TouchableOpacity style={{position: 'relative', marginVertical: 10, marginRight: 10}} key={index} onPress={() => {
        this.openFile(item)
      }}>
        <Image style={{width: 30, height: 50}} source={image}/>
      </TouchableOpacity>
    )
  }

  getCurrentImageIndex = (item1) => {
    this.state.showImages.forEach((item) => {
      if(item1.file_name == item.uri){
        this.setState({showImageIndex: item.id});
      }
    })
  }


  openFile = (item) => {
    if (item.file_type.toLowerCase().includes('image')) {
      this.getCurrentImageIndex(item);
      this.setState({showImageView: true});
      return;
    }

    let date = new Date();
    const url = item.file_name;
    const fileName = "broadcast_" + Math.floor(date.getTime() + date.getSeconds() / 2);
    const extension = this.getUrlExtension(url, item.filetype);
    const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}.${extension}`;
    const options = {fromUrl: url, toFile: localFile};
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

  initImages = () => {
    const news = this.state.newsDetail;
    let ImagesData = [];

    let idx = 0;
    if (news != null && news.news_files != undefined) {
      news.news_files.forEach((item1) => {
        if (item1.file_type.toLowerCase().includes('image')) {
          ImagesData[idx] = {
            id: idx,
            uri: item1.file_name,
          };
          idx++;
        }
      });
    }
    this.setState({showImages: ImagesData, showImageView: false})
  }

  render() {
    const news = this.state.newsDetail;
    const day = moment(news.daysend).format('DD MMMM YYYY');
    const time = moment(news.daysend).format('HH:mm');
    const type = news.send_type === '0' ? translang.t('SEND_NOW') : translang.t('SET_TIME');

    const options = [
      {title: translang.t('DETAIL')},
      {title: translang.t('RECIPIENT')},
    ];

    let attachFiles = [];
    let attachImages = [];
    if (news != null && news.news_files != undefined) {
      news.news_files.forEach((item) => {
        if (item.file_type.toLowerCase().includes('image')) {
          attachImages.push(item);
        } else {
          attachFiles.push(item);
        }
      });
    }
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('BROADCAST_REPORT')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.container}>
          <CustomSwitcher
            dataList={options}
            selectedIndex={this.state.tabIndex ?? 0}
            onChangedSwitch={(index) => this.onChangeSwitcher(index)}
            containerStyle={{marginHorizontal: 15, height: 50, marginTop: 20}}
            radius={15}
            textSize={23}
          />

          {this.state.tabIndex == 0 && <View style={styles.content}>
            <ScrollView style={{paddingLeft: 20, paddingRight: 20}}>
              <CardInfoItem
                title={translang.t('SEND_TYPE')}
                value_txt={type}
                titleColor={Color.n_default_orange}
                infoColor={Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <View style={{marginVertical: 5}}>
                <Text style={{
                  ...styles.itemText,
                  fontFamily: 'THSarabunNew',
                  color: Color.n_default_orange,
                  fontWeight: 'bold',
                  marginBottom: 5
                }}>{translang.t('HEAD_TOPIC')}</Text>
                <Text style={{
                  ...styles.itemText,
                  fontFamily: 'THSarabunNew',
                  color: Color.n_default_gray,
                  width: '100%'
                }}>{news.title}</Text>
              </View>

              <CardInfoItem
                title={translang.t('REPLY')}
                value_txt={news.ActionTypeTH}
                titleColor={Color.n_default_orange}
                infoColor={Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />


              <CardInfoItem
                title={translang.t('NUMBER_OF_RECIPIENT')}
                value_txt={(news.user_all) + ' ' + translang.t('PEOPLE')}
                titleColor={Color.n_default_orange}
                infoColor={Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title={translang.t('READ')}
                value_txt={(news.user_read) + ' ' + translang.t('PEOPLE')}
                titleColor={Color.n_default_orange}
                infoColor={Color.n_default_gray}
                style={{marginVertical: 5}}
                titleFontSize={24}
                infoFontSize={24}
              />

              <CardInfoItem
                title={translang.t('UNREAD')}
                value_txt={(news.user_unread) + ' ' + translang.t('PEOPLE')}
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
                }}>{translang.t('DATE_SEND')}</Text>
                <Text style={{
                  fontFamily: 'THSarabunNew',
                  color: Color.n_default_gray,
                  fontSize: 24,
                  width: '100%'
                }}>{`${day} ${time}`}</Text>
              </View>

              <View style={{marginVertical: 5}}>
                <Text style={{
                  fontFamily: 'THSarabunNew',
                  color: Color.n_default_orange,
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginBottom: 5
                }}>{translang.t('DETAIL')}</Text>
                <Text style={{
                  fontFamily: 'THSarabunNew',
                  color: Color.n_default_gray,
                  fontSize: 24,
                  width: '100%'
                }}>{news.message}</Text>
              </View>

              {/* <View style={{marginVertical: 5}}>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('REPLY')}</Text>
                <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>{"-"}</Text>
              </View> */}
              {attachFiles.length > 0 &&
              <View style={{marginVertical: 5}}>
                <Text style={{
                  fontFamily: 'THSarabunNew',
                  color: Color.n_default_orange,
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginBottom: 5
                }}>{translang.t('HOMEWORK_attachfile')}</Text>
                <FlatList
                  style={{flex: 0, marginHorizontal: 20}}
                  data={attachFiles}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => this.renderAttachImages(item, index)}
                  horizontal
                />
              </View>}

              {attachImages.length > 0 &&
              <View style={{marginVertical: 5}}>
                <Text style={{
                  fontFamily: 'THSarabunNew',
                  color: Color.n_default_orange,
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginBottom: 5
                }}>{'Attatch Images'}</Text>
                <FlatList
                  style={{flex: 0, marginHorizontal: 20}}
                  data={attachImages}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => this.renderAttachImages(item, index)}
                  horizontal
                />
              </View>}
            </ScrollView>
          </View>}
          {this.state.tabIndex == 1 && <View style={{flex: 1,}}>
            <FlatList
              style={{...styles.menuContainer}}
              data={this.state.recipients}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem(index)}
              onEndReachedThreshold={0.01}
              onEndReached={() => {
                if (this.state.recipients.length === 0) {

                } else {
                  this.loadDataForReceipt(false)
                }
              }}
            />
          </View>}
        </View>
        <MyImageView
          images={this.state.showImages}
          visible={this.state.showImageView}
          imageIndex={this.state.showImageIndex}
          onRequestClose={() => this.setState({showImageView: false, selImageIndex: 0})}
        />

        <ProgressHud isVisible={this.state.isLoading}/>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },

  content: {
    flex: 1,
    margin: 15,
    backgroundColor: Color.white,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    overflow: 'visible',
    paddingBottom: 20,
  },
  menuContainer: {
    marginTop: 10,
  },
  menuEachStyle: {
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: 'normal'
  },
  listItem: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
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
    marginVertical: 8,
    marginHorizontal: 20,

    paddingLeft: 10,
    paddingRight: 30,
  },
  itemText: {
    fontSize: 24,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
  },
  itemAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});
