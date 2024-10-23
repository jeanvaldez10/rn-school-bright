import React from 'react';
import { View, ScrollView, Text, Image, BackHandler } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import moment from 'moment';
import { PieChart } from 'react-native-svg-charts';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Storage from '../../managers/StorageManager';
import Images from '../../themes/Images';
import ProgressHud from '../../components/ProgressHud';
import translang from '../../utils/language.utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import CalendarModal from '../../components/CalendarModal';
import ApiManager from '../../managers/ApiManager';
import NumberFormat from 'react-number-format';

const pieWidth = 300;

export default class ReportTeacherExcutableTuitionDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showCalendarModal: false,
      selectedIndex: 0,


      startDate: null,
      endDate: null,
      statusList: [],
      userInfo: {},
      year: null,
      semester: null,
    };
  }
  handleBackButton = () => {
    if(this.state.showCalendarModal){
      this.setState({showCalendarModal: false});
      return true;
    }

    this._back();
    return true;
  };
  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = this.props.navigation.getParam('userInfo');
      const year = this.props.navigation.getParam('year');
      const semester = this.props.navigation.getParam('semester');

      this.setState({userInfo, year, semester}, ()=>{
        this.loadData();
      })
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
  _back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
    this.props.navigation.navigate(parentRoute);
  }

  onSelectItem = (index) => {

  }

  onDateSelected = (dates) => {
    this.setState({ showCalendarModal: false });

    if (dates === null) {
      return;
    }

    this.loadData();
  }

  loadData = () => {
    const schoolid = this.state.userInfo.SchoolID;
    const termId = this.state.semester.ID;
    ApiManager.getTeacherReportTuition(schoolid, termId).then(list => {
      this.setState({ statusList: list, isLoading: false });
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  render() {
    let totalMoney = 0;
    let totalStudent = 0;

    let overdueItem = {GrandTotal: 0, PaidTotal: 0, BalanceTotal: 0, PaymentStatus: "Overdue", StudentCount: 0};
    let paidItem = {GrandTotal: 0, PaidTotal: 0, BalanceTotal: 0, PaymentStatus: "Paid", StudentCount: 0};
    let partiallyItem = {GrandTotal: 0, PaidTotal: 0, BalanceTotal: 0, PaymentStatus: "Pending", StudentCount: 0};

    if(this.state.statusList.length > 0){
      const toverdueItems = this.state.statusList.filter(val => val.PaymentStatus == "Overdue");
      const tpaidItems = this.state.statusList.filter(val => val.PaymentStatus == "Paid");
      const tpartiallyItems = this.state.statusList.filter(val => val.PaymentStatus == "Pending");

      let overGTotal = 0;
      let overPTotal = 0;
      let overBTotal = 0;
      let overSTotal = 0;
      toverdueItems.forEach(item=>{
        overGTotal += item.GrandTotal;
        overPTotal += item.PaidTotal;
        overBTotal += item.BalanceTotal;
        overSTotal += item.StudentCount;
      });
      overdueItem = {GrandTotal: overGTotal, PaidTotal: overPTotal, BalanceTotal: overBTotal, PaymentStatus: "Overdue", StudentCount: overSTotal};

      let paidGTotal = 0;
      let paidPTotal = 0;
      let paidBTotal = 0;
      let paidSTotal = 0;
      tpaidItems.forEach(item=>{
        paidGTotal += item.GrandTotal;
        paidPTotal += item.PaidTotal;
        paidBTotal += item.BalanceTotal;
        paidSTotal += item.StudentCount;
      });
      paidItem = {GrandTotal: paidGTotal, PaidTotal: paidPTotal, BalanceTotal: paidBTotal, PaymentStatus: "Paid", StudentCount: paidSTotal};

      let partGTotal = 0;
      let partPTotal = 0;
      let partBTotal = 0;
      let partSTotal = 0;
      tpartiallyItems.forEach(item=>{
        partGTotal += item.GrandTotal;
        partPTotal += item.PaidTotal;
        partBTotal += item.BalanceTotal;
        partSTotal += item.StudentCount;
      });
      partiallyItem = {GrandTotal: partGTotal, PaidTotal: partPTotal, BalanceTotal: partBTotal, PaymentStatus: "Pending", StudentCount: partSTotal};
    }
    totalMoney = overdueItem.BalanceTotal + paidItem.PaidTotal + partiallyItem.BalanceTotal;
    totalStudent = overdueItem.StudentCount + paidItem.StudentCount + partiallyItem.StudentCount;

    let perOverdue = Math.floor((overdueItem.BalanceTotal/totalMoney)*100);
    let perPaid = Math.floor((paidItem.PaidTotal/totalMoney)*100);
    let perpartially = Math.floor((partiallyItem.BalanceTotal/totalMoney)*100);

    // if(isNaN(perOverdue)){
    //   perOverdue = 0;
    // }
    // if(isNaN(perPaid)){
    //   perPaid = 0;
    // }
    // if(isNaN(perpartially)){
    //   perpartially = 0;
    // }

    const data = [paidItem.PaidTotal, partiallyItem.BalanceTotal, overdueItem.BalanceTotal];
    const pieChartColors = [Color.n_button_gradient_green_end, Color.n_default_brown, Color.n_default_orange];

    const pieData = data.map((value, index) => ({
        value,
        svg: {
          fill: pieChartColors[index],
          onPress: () => { this.onSelectItem(index) },
        },
        key: `${index}`,
      }));

    let strTitle = "";
    if(this.state.year != null && this.state.semester != null){
      strTitle = translang.t('ACADEMIC_year') + " " + this.state.year.name + " " + translang.t('ACADEMIC_semester') + " " + this.state.semester.name
    }

    let strTime = `${translang.t('LAST_UPDATE')} ${moment().format("HH:mm DD MMMM YYYY")}`;

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('TUITION_REPORT')}
          onMenuTap={() => this._back()}
          // is_calendar={true}
          // onCalendarTap={() => {
          //   this.setState({ showCalendarModal: true, });
          // }}
        />

        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.contentPie}>
            <Text style={{fontSize: 25, fontFamily: 'THSarabunNew', color: Color.n_default_gray, textAlign: 'center', fontWeight: 'bold'}}>{strTitle}</Text>
            <Text style={{fontSize: 22, fontFamily: 'THSarabunNew', color: Color.n_default_gray, textAlign: 'center'}}>{strTime}</Text>

            <PieChart
              style={styles.pieChart}
              data={pieData}
              innerRadius="76%"
              padAngle={0.01} />
            <View style={{ position: 'absolute', top: 10, left: pieWidth*0.22, right: pieWidth*0.22, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.pieChartDate}>{translang.t('TUITION_AMOUNT')}</Text>
              <NumberFormat
                value={totalMoney}
                displayType={'text'}
                thousandSeparator={true}
                renderText={value => (<Text style={styles.pieChartTitle}>{value}</Text>)}/>
            </View>

            <Text style={{fontSize: 25, fontFamily: 'THSarabunNew', color: Color.n_default_gray, textAlign: 'center', fontWeight: 'bold', marginTop: 20}}>{`${translang.t('ALL_INVOICES')} ${totalStudent}`}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Image source={Images.n_ic_report_users_ontime} style={{width: 40, height: 40, marginRight: 10}}></Image>
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{...styles.detailText, flex: 1}}>{translang.t('TUITION_PAID')}</Text>
                <NumberFormat
                  value={paidItem.PaidTotal}
                  displayType={'text'}
                  thousandSeparator={true}
                  renderText={value => (<Text style={{...styles.detailText, color: Color.n_button_gradient_green_end}}>{`${value} (${perPaid}%)`}</Text>)}/>
              </View>
              <Text style={styles.detailText}>{`${translang.t('TOTAL_INVOICES')}   ${paidItem.StudentCount}`}</Text>
            </View>

          </View>

          <View style={styles.detailContainer}>
            <Image source={Images.n_ic_report_users_late} style={{width: 40, height: 40, marginRight: 10}}></Image>
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{...styles.detailText, flex: 1}}>{translang.t('PENDING')}</Text>
                <NumberFormat
                  value={partiallyItem.BalanceTotal}
                  displayType={'text'}
                  thousandSeparator={true}
                  renderText={value => (<Text style={{...styles.detailText, color: Color.n_default_brown}}>{`${value} (${perpartially}%)`}</Text>)}/>
              </View>
              <Text style={styles.detailText}>{`${translang.t('TOTAL_INVOICES')}   ${partiallyItem.StudentCount}`}</Text>
            </View>
          </View>

          <View style={styles.detailContainer}>
            <Image source={Images.n_ic_report_users_absence} style={{width: 40, height: 40, marginRight: 10}}></Image>
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{...styles.detailText, flex: 1}}>{translang.t('TUITITION_OVERDUE')}</Text>
                <NumberFormat
                  value={overdueItem.BalanceTotal}
                  displayType={'text'}
                  thousandSeparator={true}
                  renderText={value => (<Text style={{...styles.detailText, color: Color.n_default_orange}}>{`${value} (${perOverdue}%)`}</Text>)}/>

              </View>
              <Text style={styles.detailText}>{`${translang.t('TOTAL_INVOICES')}   ${overdueItem.StudentCount}`}</Text>
            </View>
          </View>
        </ScrollView>

        <ProgressHud isVisible={this.state.isLoading} />
        <CalendarModal
          isVisible={this.state.showCalendarModal}
          type={'period'}
          onDateSelect={ result => this.onDateSelected(result)} />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  textPageTitle: {
    marginTop: 25,
    marginBottom: 15,
    width: '100%',
    textAlign: 'center',
    color: Color.n_default_orange,
    fontWeight: 'bold',
    fontSize: 24
  },

  contentPie: {
    minHeight: 460,
    backgroundColor: Color.white,
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 13,
    borderRadius: 15,
    marginTop: 40,
    marginBottom: 20,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  contentDescription: {
    width: '100%',
    height: '100%',
  },

  pieChart: {
    marginTop: 20,
    width: 300,
    height: 300,
    alignSelf: 'center',
  },
  pieChartTitle: {
    textAlign: 'center',
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    fontSize: 27,
    color: Color.n_default_gray
  },
  pieChartDate: {
    textAlign: 'center',
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    color: Color.n_default_gray
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceItemMarkImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 20,
    marginLeft: 35,
    marginVertical: 10,
  },
  attendanceItemLabel: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    textAlign: 'left',
  },

  detailContainer: {
    backgroundColor: Color.white,
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 13,
    borderRadius: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 20,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  detailText: {
    fontSize: 22,
    color: Color.n_default_gray,
    fontFamily: 'THSarabunNew'
  }

});
