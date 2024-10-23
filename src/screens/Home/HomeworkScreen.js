import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import GradientButton from '../../components/GradientButton';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'native-base';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import HomeworkIconInfoItem from '../../components/HomeworkIconInfoItem';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';

export default class HomeworkScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      homeworkList: [],
      userInfo: {},
      currentPage: 0,
      isLoading: false,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const userInfo = await Storage.getUserInfo();
    this.setState({ userInfo: userInfo });
    this.loadData(true);
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
    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  onClickSubject = (index) => {
    const homeworkList = this.state.homeworkList;
    const homework = homeworkList[index];
    homeworkList[index].nStatus = 1;
    this.setState({ homeworkList });
    this.props.navigation.navigate('HomeworkHistory', {homework: homework});
  };

  loadData = (isRefresh) => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const page = isRefresh ? 0 : this.state.currentPage;

    ApiManager.getHomeworkList(userInfo.ID, userInfo.SchoolID, page).then(list => {
      if (isRefresh) {
        this.setState({ homeworkList: list, currentPage: page + 1, isLoading: false });
      } else {
        let homeworks = this.state.homeworkList;
        homeworks = homeworks.concat(list);
        this.setState({ homeworkList: homeworks, currentPage: page + 1, isLoading: false });
      }
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  renderItem = (index) => {
    const homework = this.state.homeworkList[index];
    const date = moment(homework.dSend ?? '').format('MMMM DD, YYYY hh:mm A');
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => { this.onClickSubject(index) }} >
        <HomeworkIconInfoItem
          label={homework.sTitle ?? ''}
          value_txt={homework.sMessage ?? ''}
          dateText={date}
          isRead={homework.nStatus === 1}
          hasAttachment={homework.file ?? false}
        />
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'bottom', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_onlineclassroom')}
          onMenuTap={() => this.back()}
        />
        <View style={styles.container}>
          <FlatList 
            style={styles.menuContainer}
            data={this.state.homeworkList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(index)}
            onEndReachedThreshold={0.01}
            onEndReached={ () => {
              if (this.state.homeworkList.length === 0) {

              } else {
                this.loadData(false)
              }
            }}
          />
        </View>
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  personImage: {
    width: 150,
    height: 150,
    margin: 2,
  },
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  menuContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  home: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000025',
  },
  dialogStyle: {
    width: '90%',
    height: 200,
    borderRadius: 5,
    backgroundColor: 'white',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

  },
});
