import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import Images from '../../themes/Images';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import Toast from 'react-native-simple-toast';
import Color from '../../constants/color';
import dimension from '../../constants/dimension';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import IconInfoItem from '../../components/IconInfoItem';
import IconInfoItemSmall from '../../components/IconInfoItemSmall';
import AttachInfoItemNoIcon from '../../components/AttachInfoItemNoIcon';
import translang from '../../utils/language.utils';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import CardInfoItem from '../../components/CardInfoItem';

const OfferItem = ({ person, navigation, onCheckBoxPress }) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => navigation.navigate('HomeworkHistoryAttach', { person })}>
        <View style={styles.uperCardChild}>
          <Image source={Images.folder} style={styles.itemIcon} />
          <View>
            <Text style={styles.itemText}>{person}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onCheckBoxPress(person)}
            style={styles.itemActions}>
            <Text style={{ color: '#BE0B12', fontSize: 18, fontWeight: '700' }}>
              {' '}
              ...more{' '}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default class HomeworkHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      homework: {},
      userInfo: {},
      isLoading: false,
    };
    this.path = `${RNFS.ExternalStorageDirectoryPath
      }`;
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", async () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = await Storage.getUserInfo();
      const homework = this.props.navigation.getParam('homework');
      this.setState({ userInfo, homework }, () => {
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

  _renderItem = ({ item }) => {
    return (
      <OfferItem
        person={item}
        navigation={this.props.navigation}
        onCheckBoxPress={this.onCheckBoxPress}
      />
    );
  };

  back = () => {
    //this.props.navigation.goBack();
    if(this.backhandler){
      this.backhandler.remove();
    }
    
    this.props.navigation.navigate('Homework');
  };

  loadData = () => {
    // this.setState({ isLoading: true });

    // const userInfo = this.state.userInfo;
    // const homework = this.state.homework;

    // ApiManager.getNotificationDetail(userInfo.ID, userInfo.SchoolID, homework.homework_id).then(detail => {
    //   this.setState({ isLoading: false, homework: detail })
    // }).catch(error => {
    //   console.log(error);
    //   this.setState({ isLoading: false });
    // });
  }

  render() {
    const homework = this.state.homework;

    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_homework')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.dispcontainer}>
          <ScrollView style={{flex: 1, paddingVertical: 30, paddingHorizontal: 20}}>
            <CardInfoItem
              title = {translang.t('HOMEWORK_subject')}
              value_txt = {homework.sTitle}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            <CardInfoItem
              title = {translang.t('HOMEWORK_sender')}
              value_txt = {"JAB JAIS"}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            <CardInfoItem
              title = {translang.t('HOMEWORK_submitenddate')}
              value_txt = {"11/02/2021 "}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            <CardInfoItem
              title = {translang.t('HOMEWORK_submitstartdate')}
              value_txt = {"19/02/2021 - 19/02/2021"}
              titleColor = {Color.n_default_orange}
              infoColor = {Color.n_default_gray}
              style={{marginVertical: 5}}
              titleFontSize={24}
              infoFontSize={24}
            />

            <View style={{marginVertical: 5}}>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_description')}</Text>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>{homework.sMessage}</Text>
            </View>

            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('HomeworkHistoryAttach')}>
              <AttachInfoItemNoIcon
                style={{marginVertical: 5 }}
                icon_attach={require("../../assets/images/sample_attach.png")}
                label={translang.t('HOMEWORK_attachimg')}
              />
            </TouchableOpacity>

            <View style={{marginVertical: 5}}>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_orange, fontSize: 24, fontWeight: 'bold', marginBottom: 5}}>{translang.t('HOMEWORK_attachfile')}</Text>
              <Text style={{fontFamily: 'THSarabunNew', color: Color.n_default_gray, fontSize: 24, width: '100%'}}>{"-"}</Text>
            </View>
          </ScrollView>
        </View>
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
    height: '100%',
    backgroundColor: Color.backgroundColor,
  },
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
    fontSize: '22@ms',
    paddingRight: 100,
  },
  itemActions: {
    position: 'absolute',
    right: 1,
    alignItems: 'center',
  },
  options1Text: {
    color: 'blueviolet',
    fontSize: '25@ms0.3',
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
    fontSize: 16,
    fontWeight: 'bold'
  },
  value2: {
    fontFamily: 'THSarabunNew',
    fontSize: 16,
  },
  attach2: {
    width: 100,
    height: 100,
  }
});
