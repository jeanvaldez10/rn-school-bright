import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment';
import {BarChart, XAxis} from 'react-native-svg-charts';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import BackNavigationBar from '../../components/BackNavigationBar';
import { ScrollView } from 'react-native-gesture-handler';
import NextButton from '../../components/NextButton';
import { Text as SvgText } from 'react-native-svg'
import NumberFormat from 'react-number-format';
import * as scale from 'd3-scale';

export default class ReportPurchaseScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      userInfo: {},
      isLoading: false,
      selectedDateDropdownValue: 'currently',
      startDate: '',
      endDate: '',
      reportList: [],
      chartList: [],
      xList: [],
    };
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
      console.log("ReportPurchaseScreen");
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
      const userInfo = await Storage.getUserInfo();
      this.setState({ userInfo: userInfo, startDate: moment(), endDate: moment(), selectedDateDropdownValue: 'currently'}, () => {
        if(this.state.selectedDateDropdownValue == 'currently'){
          this.loadDataSingle();
        }else{
          this.loadDataRange();
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
    if(this.backhandler){
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'Report';
    this.props.navigation.navigate(parentRoute);
  };

  loadDataSingle = () => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const date = this.state.startDate;

    ApiManager.getReportPurchaseSingleDate(userInfo.SchoolID, date).then(list => {
      this.setState({reportList: list, isLoading: false}, ()=>{
        this.makeData();
      })
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  loadDataRange = () => {
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const start = this.state.startDate;
    const end = this.state.endDate;

    ApiManager.getReportPurchaseRangeDate(userInfo.SchoolID, start, end).then(list => {
      this.setState({reportList: list, isLoading: false}, ()=>{
        this.makeData();
      })
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  makeData = ()=>{
    const list = this.state.reportList.Chart;
    let resList = [];
    let resXList = [];
    let weekstrList = [translang.t('SUN'), translang.t('MON'), translang.t('TUE'), translang.t('WED'), translang.t('THU'), translang.t('FRI'), translang.t('SAT')];
    let monthstrList = [translang.t('JAN'), translang.t('FEB'), translang.t('MAR'), translang.t('APR'), translang.t('MAY'), translang.t('JUN'), translang.t('JUL'), translang.t('AUG'), translang.t('SEP'), translang.t('OCT'), translang.t('NOV'), translang.t('DEC')];

    if(this.state.selectedDateDropdownValue == 'currently'){
      const CountHours = 4;
      let tempsum = 0;
      for(let i = 0; i < list.length; i++){
        tempsum = tempsum + list[i].TotatlMoney;
        if(i == 0){
          resList.push(parseFloat(tempsum).toFixed(2));
          resXList.push(moment(list[i].Date).format('HH:mm'));
          tempsum = 0;
        }else{
          if(i != list.length-1){
            if(i%CountHours == 0){
              resList.push(parseFloat(tempsum).toFixed(2));
              resXList.push(moment(list[i].Date).format('HH:mm'));
              tempsum = 0;
            }
          }else{
            resList.push(parseFloat(tempsum).toFixed(2));
            resXList.push(moment(list[i].Date).format('HH:mm'));
            tempsum = 0;
          }
        }
      }
    }else if(this.state.selectedDateDropdownValue == 'weekly'){
      resXList = [];
      resList = [];
      for(let i = 0; i < list.length; i++){
        resList.push(parseFloat(list[i].TotatlMoney).toFixed(2));
        resXList.push(weekstrList[i]);
      }
    }else if(this.state.selectedDateDropdownValue == 'monthly'){
      const CountDay = 1;
      let tempsum = 0;
      for(let i = 0; i < list.length; i++){
        tempsum = tempsum + list[i].TotatlMoney;
        if(i == 0){
          resList.push(parseFloat(tempsum).toFixed(2));
          resXList.push(moment(list[i].Date).format('DD'));
          tempsum = 0;
        }else{
          if(i != list.length-1){
            if(i%CountDay == 0){
              resList.push(parseFloat(tempsum).toFixed(2));
              resXList.push(moment(list[i].Date).format('DD'));
              tempsum = 0;
            }
          }else{
            resList.push(parseFloat(tempsum).toFixed(2));
            resXList.push(moment(list[i].Date).format('DD'));
            tempsum = 0;
          }
        }

        // resList.push(list[i].TotatlMoney);
        // if(i == 1 || i == list.length || i%CountDay == 0){
        //   resXList.push(`${moment(list[i-1].Date).format('DD')}`);
        // }else{
        //   resXList.push("");
        // }
      }
    }else if(this.state.selectedDateDropdownValue == 'yearly'){
      for(let i = 1; i< 13; i++){
        const tempM = list.filter(item=>moment(item.Date).format('M') == `${i}`);

        let total = 0;
        tempM.forEach((item)=>{
          total = total + item.TotatlMoney;
        });
        total = parseFloat(total).toFixed(2);
        // total = (parseFloat(total) * 100) / 100;
        resList.push(total);
        resXList.push(monthstrList[i-1]);
      }
    }

    this.setState({chartList: resList, xList: resXList});
  }

  onMoreDetail = () => {
    this.props.navigation.navigate('ReportExecutivePurchaseList', {selectedDateDropdownValue: this.state.selectedDateDropdownValue, userInfo: this.state.userInfo, detailData: this.state.reportList.Detail});
  }

  render() {
    const today = moment().clone();
    const startOfWeek = moment().clone().startOf('week');
    const endOfWeek = moment().clone().endOf('week');
    const startOfMonth = moment().clone().startOf('month');
    const endOfMonth = moment().clone().endOf('month');
    const startOfYear = moment().clone().startOf('year');
    const endOfYear = moment().clone().endOf('year');

    const dropdownPickerItems = [
      { label: translang.t('CURRENTLY') + "\t\t" + today.format('DD MMM YYYY'), value: 'currently', start: today, end: today},
      { label: translang.t('USERINFO_weekly') + "\t\t\t" + startOfWeek.format('DD MMM YYYY') + " - " + endOfWeek.format('DD MMM YYYY'), value: 'weekly', start: startOfWeek, end: endOfWeek },
      { label: translang.t('USERINFO_monthly') + "\t\t" + startOfMonth.format('DD MMM YYYY') + " - " + endOfMonth.format('DD MMM YYYY'), value: 'monthly', start: startOfMonth, end: endOfMonth },
      { label: translang.t('USERINFO_yearly') + "\t\t\t" + startOfYear.format('DD MMM YYYY') + " - " + endOfYear.format('DD MMM YYYY'), value: 'yearly', start: startOfYear, end: endOfYear },
    ];


    let title = "";
    if (this.state.selectedDateDropdownValue === 'currently') {
      title  = translang.t('TOTAL_SALE_TODAY');
    } else if (this.state.selectedDateDropdownValue === 'weekly') {
      title = translang.t('TOTAL_SALE_WEEK');
    } else if (this.state.selectedDateDropdownValue === 'monthly') {
      title = translang.t('TOTAL_SALE_MONTH');
    } else if (this.state.selectedDateDropdownValue === 'yearly') {
      title = translang.t('TOTAL_SALE_YEAR');
    }



    let total = 0;
    if(this.state.reportList.Chart){
      this.state.reportList.Chart.forEach(item=>{
        total = total + item.TotatlMoney;
      });
    }
    total = parseFloat(total).toFixed(2);


    const {chartList, xList}=this.state;
    const chartData = chartList.map((value, index) => ({
      value: parseFloat(value),
      svg: {
        fill: Color.n_button_gradient_green_end,
      },
      key: `${index}`,
    }));

    const CUT_OFF = Math.max.apply(Math, chartData.map(function(o) { return o.value; })) + 200;
    const Labels = ({ x, y, bandwidth, data }) => (
      chartList.map((item, index) => (
          <SvgText
            key={ index }
            x={ x(index) + (bandwidth / 2) }
            y={ item < CUT_OFF ? y(item) - 10 : y(item) + 15 }
            fontSize={ 6 }
            fill={ item >= CUT_OFF ? 'white' : 'black' }
            alignmentBaseline={ 'middle' }
            textAnchor={ 'middle' }>
            {item>0?item:''}
        </SvgText>
      ))
    )

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('PURCHASE_REPORT')}
          onMenuTap={this.back}
        />

        <ScrollView style={styles.container}>
          <DropDownPicker
            arrowColor={Color.n_default_orange}
            items={dropdownPickerItems}
            defaultValue={this.state.selectedDateDropdownValue}
            style={styles.dropdownPicker}
            itemStyle={{ justifyContent: 'flex-start' }}
            containerStyle = {styles.dropdownPickerContainer}
            labelStyle={styles.dropdownPickerLabel}
            dropDownStyle={styles.dropDown}
            dropDownMaxHeight={240}
            onChangeItem={ item => {
              const start = moment(item.start).format('YYYY-MM-DD');
              const end = moment(item.end).format('YYYY-MM-DD');
              this.setState({selectedDateDropdownValue: item.value, startDate: start, endDate: end}, () => {
                if(this.state.selectedDateDropdownValue == 'currently'){
                  this.loadDataSingle();
                }else{
                  this.loadDataRange();
                }
              });
            }}
          />
          <View style={styles.chartContainer}>
            <Text style={{fontSize: 20,fontFamily: 'THSarabunNew', color: Color.n_default_gray}}>{translang.t('LAST_UPDATE')}</Text>
            <Text style={{fontSize: 20,fontFamily: 'THSarabunNew', color: Color.n_default_gray}}>{moment().format('HH:mm DD/MM/YYYY')}</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.text}>{title}</Text>
              <NumberFormat
                value={total}
                displayType={'text'}
                thousandSeparator={true}
                renderText={value => (<Text style={styles.text}>{value}</Text>)}/>
            </View>

            <BarChart
                style={styles.chart}
                data={chartData}
                yAccessor={({item}) => item.value}
                contentInset={{top: 20, left: 20, right: 20}}>
              <Labels/>
            </BarChart>
            <XAxis
                style={{marginBottom: 20}}
                data={chartList}
                scale={scale.scaleBand}
                formatLabel={(value, index) => xList[index]}
                contentInset={{left: 20, right: 20}}
                svg={{fontSize: 15, fill: 'black', fontWeight: 'bold', fontFamily: 'THSarabunNew',}}
            />

          </View>

          <NextButton
            label={translang.t('MORE_DETAIL')}
            containerStyle={{width: '90%', marginRight: 'auto', marginLeft: 'auto', marginVertical: 15}}
            buttonStyle={{ borderRadius: 38, height: 78 }}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            _onPress={() => this.onMoreDetail()} />

        </ScrollView>
        <ProgressHud isVisible={this.state.isLoading} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({

  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  content: {
    flex: 1,
    margin: 10,
    backgroundColor: Color.white,
    borderRadius: 3,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 2,
    padding: 10,
  },
  dropdownPickerContainer: {
    marginTop: 30,
    width: '92%',
    height: 45,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  dropdownPicker: {
    backgroundColor: Color.white,
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 13,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    borderBottomLeftRadius: 23,
    borderBottomRightRadius: 23
  },
  dropDown: {
    backgroundColor: Color.white,

    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 13,
    borderBottomLeftRadius: 23,
    borderBottomRightRadius: 23
  },
  dropdownPickerLabel: {
    fontSize: 23,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
  },
  text: {
    fontSize: 25,
    fontFamily: 'THSarabunNew',
  },
  chartContainer: {
    backgroundColor: Color.white,
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 13,
    borderRadius: 15,
    margin: 20,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  chart: {
    height: 300,
  },
});
