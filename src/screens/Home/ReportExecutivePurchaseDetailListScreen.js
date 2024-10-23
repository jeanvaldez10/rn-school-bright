import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'native-base';
import { DrawerActions } from 'react-navigation-drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

import NavigationBar from '../../components/NavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import BackNavigationBar from '../../components/BackNavigationBar';
import { BarChart, XAxis, } from 'react-native-svg-charts';
import { Text as SvgText } from 'react-native-svg'
import NextButton from '../../components/NextButton';
import NumberFormat from 'react-number-format';
export default class ReportExecutivePurchaseDetailListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      isLoading: false,
      list: [],
      selectedDateDropdownValue: "",
      userInfo: {},

    };

  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      console.log("ReportExecutivePurchaseDetailListScreen");
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = this.props.navigation.getParam('userInfo');
      const selectedDateDropdownValue = this.props.navigation.getParam('selectedDateDropdownValue');
      const detailData = this.props.navigation.getParam('detailData');
      this.setState({ userInfo: userInfo, selectedDateDropdownValue: selectedDateDropdownValue, list: detailData });
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
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.navigate('ReportPurchase');
  };

  renderItem = (item, index) => {
    const date = moment(this.state.date).format('DD MMMM YYYY');

    const totalText = `${translang.t('TOTAL_SALE')} ${item.TotatlMoney} `;
    return (
      <View style={styles.itemContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={styles.class} numberOfLines={1}>{item.shop_name}</Text>
        </View>
        <NumberFormat
          value={totalText}
          displayType={'text'}
          thousandSeparator={true}
          renderText={value => (<Text style={styles.total}>{value}</Text>)}/>
      </View>
    );
  };

  render() {
    let title = "";
    if (this.state.selectedDateDropdownValue === 'currently') {
      title = translang.t('TODAY_REPORT');
    } else if (this.state.selectedDateDropdownValue === 'weekly') {
      title = translang.t('WEEK_REPORT');
    } else if (this.state.selectedDateDropdownValue === 'monthly') {
      title = translang.t('MONTH_REPORT');
    } else if (this.state.selectedDateDropdownValue === 'yearly') {
      title = translang.t('YEAR_REPORT');
    }
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('PURCHASE_REPORT')}
          onMenuTap={this.back}
        />

        <View style={{...styles.container, marginTop: 30}}>
          <Text style={{fontFamily: 'THSarabunNew',fontSize: 24,fontWeight: 'bold', textAlign: 'center'}}>{title}</Text>
          <FlatList
            style={{flex: 1}}
            data={this.state.list}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item, index)}
          />
          <ProgressHud isVisible={this.state.isLoading} />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  itemContainer: {

    marginHorizontal: 15,
    marginVertical: 8,
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
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  class: {
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_gray_dark,
  },
  date: {
    width: 120,
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    color: Color.n_default_gray_dark,
    marginLeft: 5
  },
  total: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: Color.n_default_gray_dark,
  },
  barChart: {
    height: 300,
    marginVertical: 20,
    backgroundColor: 'red'
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 8,
    paddingHorizontal: 15,
    height: 70,
    backgroundColor: Color.white,
    borderRadius: 15,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowColor: 'black',
    shadowRadius: 3,
    elevation: 2,
    shadowOpacity: 0.4,

  },
  attendanceItemMarkImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendanceItemLabel: {
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.n_default_gray,
  },
});
