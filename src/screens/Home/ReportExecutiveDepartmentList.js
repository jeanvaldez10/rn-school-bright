import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';

import LinearGradient from 'react-native-linear-gradient';

import { SafeAreaView } from 'react-native-safe-area-context';

import moment from 'moment';

import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import BackNavigationBar from '../../components/BackNavigationBar';
import { BarChart, XAxis, } from 'react-native-svg-charts';
import { Text as SvgText } from 'react-native-svg'
import NextButton from '../../components/NextButton';

export default class ReportExecutiveDepartmentListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      isLoading: false,
      departmentList: [],
      date: '',
      expandIndex: -1
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
      console.log("ReportExecutiveDepartmentListScreen");
      const userInfo = this.props.navigation.getParam('userInfo');
      const date = this.props.navigation.getParam('date');

      this.setState({ userInfo: userInfo, date: date }, () => {
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
    this.setState({ isLoading: true });

    const userInfo = this.state.userInfo;
    const date = this.state.date;

    ApiManager.getAttendanceSchoolDetailDepartment(userInfo.SchoolID, date).then(list => {

      this.setState({ departmentList: list, isLoading: false})
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.navigate('ReportExecutiveAttendance');
  };

  onSelectItem = (item, index) => {
    if (this.state.expandIndex === index) {
      this.setState({ expandIndex: -1 });
    } else {
      this.setState({ expandIndex: index });
    }
  };

  onMoreDetail = (item, index) => {
    this.props.navigation.navigate('ReportExecAttendanceDepartmentDetail', {report: item, date: this.state.date, userInfo: this.state.userInfo});
  }

  renderAttendanceItem = (index, title, peoples, totalCount, image) => {
    let percentage = 0;
    if (totalCount > 0) {
      percentage = parseInt((peoples / totalCount) * 100);
    }

    return (
      <View style={styles.attendanceItem}>
        <Image source={image} style={{width: 30, height: 30, marginRight: 20,}} />
        <Text style={{ ...styles.attendanceItemLabel, flex: 1, marginRight: 10, textAlign: 'left'}}>{title}</Text>
        <Text style={{ ...styles.attendanceItemLabel, flex: 1,marginRight: 10, textAlign: 'right' }}>{`${peoples} ${translang.t('PEOPLE')}`} {`(${percentage}%)`}</Text>
      </View>

    )
  };

  renderItemDetail = (item, index) => {
    const info = item.statuses ?? {};

    const onTime = info.status_0 ?? 0;
    const late = info.status_1 ?? 0;
    const absence = info.status_2 ?? 0;
    const personalLeave = info.status_3 ?? 0;
    const sickLeave = info.status_4 ?? 0;
    const otherLeave = info.status_5 ?? 0;
    const holiday = info.status_6 ?? 0;

    const total = onTime + late + absence + sickLeave + personalLeave + otherLeave + holiday;

    const data = [onTime, late, absence, personalLeave, sickLeave, otherLeave, holiday];
    const statusTexts = [translang.t('ON_TIME'), translang.t('LATE'), translang.t('ABSENCE'), translang.t('PERSONAL'), translang.t('SICK'), translang.t('OTHER_LEAVE'), translang.t('HOLIDAY')]
    const pieChartColors = [Color.n_button_gradient_green_end, Color.n_default_brown, Color.n_default_orange, Color.n_seance, Color.n_electric_violet, Color.n_scorpion, Color.n_scorpion];

    const chartData = data
      .map((value, index) => ({
        value,
        svg: {
          fill: pieChartColors[index],
        },
        key: `${index}`,
      }));

    const CUT_OFF = Math.max.apply(Math, chartData.map(function(o) { return o.value; })) + 200;
    const Labels = ({ x, y, bandwidth, data }) => (
        data.map((item, index) => (
            <SvgText
                key={ index }
                x={ x(index) + (bandwidth / 2) }
                y={ item.value < CUT_OFF ? y(item.value) - 10 : y(item.value) + 15 }
                fontSize={ 9 }
                fill={ item.value >= CUT_OFF ? 'white' : 'black' }
                alignmentBaseline={ 'middle' }
                textAnchor={ 'middle' }>
                {item.value}
            </SvgText>
        ))
    )

    const date = moment(this.props.date).format('DD MMMM YYYY');
    const totalText = translang.t('TOTAL_PERSONAL') + ` ${item.department_Number} ` + translang.t('PEOPLE');

    return (
      <View>
        <View style={styles.itemContainer}>
          <TouchableOpacity onPress={() => this.onSelectItem(item, index)}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={styles.department} numberOfLines={1}>{`${translang.t('PERSONAL_TYPE')} ${item.department_Name}`}</Text>
              <Text style={styles.date} numberOfLines={1}>{date}</Text>
            </View>
            <Text style={styles.total}>{totalText}</Text>
          </TouchableOpacity>

          <BarChart
            style={{ height: 250, marginTop: 20, marginHorizontal: 20, }}
            data={chartData}
            svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
            yAccessor={({item}) => item.value}
            contentInset={{ top: 20,}}>
            <Labels/>
          </BarChart>
          <View style={{ marginHorizontal: 20, height: 1, backgroundColor: Color.divider_color, marginBottom: 10}}></View>
          <XAxis
            style={{ marginHorizontal: 20, marginBottom: 20 }}
            data={data}
            formatLabel={(value, index) => statusTexts[index]}
            contentInset={{ left: 20, right: 20 }}
            svg={{ fontSize: 8, fill: 'black' }}
          />
        </View>

        { //cntOnTime > 0 &&
          this.renderAttendanceItem(0, translang.t('ON_TIME'), onTime, total, Images.n_ic_report_users_ontime)
        }
        { //cntLate > 0 &&
          this.renderAttendanceItem(1, translang.t('LATE'), late, total, Images.n_ic_report_users_late)
        }
        { //cntAbsence > 0 &&
          this.renderAttendanceItem(2, translang.t('ABSENCE'), absence, total, Images.n_ic_report_users_absence)
        }
        { //cntPersonalLeave > 0 &&
          this.renderAttendanceItem(3, translang.t('PERSONAL_LEAVE'), personalLeave, total, Images.n_ic_report_users_personleave)
        }
        { //cntSickLeave > 0 &&
          this.renderAttendanceItem(4, translang.t('SICK_LEAVE'), sickLeave, total, Images.n_ic_report_users_sickleave)
        }
        { //cntUncheck > 0 &&
          this.renderAttendanceItem(5, translang.t('OTHER_LEAVE'), otherLeave, total, Images.n_ic_report_users_undifine)
        }
        { //cntUncheck > 0 &&
          this.renderAttendanceItem(6, translang.t('HOLIDAY'), holiday, total, Images.n_ic_report_users_undifine)
        }

        <NextButton
            label={translang.t('MORE_DETAIL')}
            containerStyle={{width: '90%', marginRight: 'auto', marginLeft: 'auto', marginVertical: 15}}
            buttonStyle={{ borderRadius: 25, height: 50 }}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            textStyle={{fontSize: 30, fontWeight: 'bold'}}
            isVerticalGradient={false}
            _onPress={() => this.onMoreDetail(item, index)} />
      </View>
    )
  }

  renderItem = (item, index) => {
    const date = moment(this.state.date).format('DD MMMM YYYY');
    const totalText = translang.t('TOTAL_PERSONAL') + ` ${item.department_Number} ` + translang.t('PEOPLE');
    return (
      <View>
        { this.state.expandIndex !== index && (
        <View style={styles.itemContainer}>
          <TouchableOpacity onPress={() => this.onSelectItem(item, index)}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={styles.department} numberOfLines={1}>{`${translang.t('PERSONAL_TYPE')} ${item.department_Name}`}</Text>
              <Text style={styles.date} numberOfLines={1}>{date}</Text>
            </View>
            <Text style={styles.total}>{totalText}</Text>
          </TouchableOpacity>
        </View>)}
        { this.state.expandIndex === index && (
          <View>
            {this.renderItemDetail(item, index)}
          </View>
        )}
      </View>
    );
  };

  render() {

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_reportattendance')}
          onMenuTap={this.back}
        />

        <View style={styles.container}>
          <FlatList
            style={{flex: 1}}
            data={this.state.departmentList}
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
    backgroundColor: Color.white
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
  department: {
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
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'left',
  },
});
