import moment from 'moment';
import React from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { Text as SvgText } from 'react-native-svg';
import { BarChart, PieChart, XAxis } from 'react-native-svg-charts';
import NextButton from '../../../../components/NextButton';
import Color from '../../../../constants/color';
import Storage from '../../../../managers/StorageManager';
import Images from '../../../../themes/Images';
import translang from '../../../../utils/language.utils';

const screenWidth = Dimensions.get('window').width;

export default class MorningAlitingReportTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showBarchat: true,
      reportList: {},
      userInfo: {},
    };
  }

  async componentDidMount() {
    const userInfo = await Storage.getUserInfo();
    this.setState({userInfo: userInfo});
  }

  componentWillUnmount = () => {

  };

  onMoreDetails = () => {
    this.props.navigation.navigate('ReportExecutiveDepartmentList', {date: this.props.date, userInfo: this.state.userInfo});
  }

  renderAttendanceItem = (index, title, peoples, totalCount, image) => {
    let percentage = 0;
    if (totalCount > 0) {
      percentage = parseInt((peoples / totalCount) * 100);
    }
    
    return (
      <View style={styles.attendanceItem}>
        <Image source={image} style={{width: 43, height: 43, marginRight: 20,}} />
        <Text style={{ ...styles.attendanceItemLabel, flex: 1, marginRight: 10, textAlign: 'left'}}>{title}</Text>
        <Text style={{ ...styles.attendanceItemLabel, flex: 1,marginRight: 10, textAlign: 'right' }}>{`${peoples} ${translang.t('PEOPLE')}`} {`(${percentage}%)`}</Text>
      </View>
    )
  };

  render() {
    const info = this.props.reportList;

    const onTime = info.status_0 ?? 0;
    const late = info.status_1 ?? 0;
    const absence = info.status_2 ?? 0;
    const event = info.status_3 ?? 0;
    const sickLeave = info.status_4 ?? 0;
    const personalLeave = info.status_5 ?? 0;
    const otherLeave = info.status_7 ?? 0;
    const holiday = info.status_6 ?? 0;

    const total = onTime + late + absence + event + sickLeave + personalLeave + otherLeave + holiday;

    const data = [onTime, late, absence, event, sickLeave, personalLeave, otherLeave, holiday];
    const statusTexts = [translang.t('ON_TIME'), translang.t('LATE'), translang.t('ABSENCE'), translang.t('EVENT'), translang.t('SICK'), translang.t('PERSONAL'), translang.t('OTHER'), translang.t('HOLIDAY')]
    const pieChartColors = [Color.n_button_gradient_green_end, Color.n_default_brown, Color.n_default_orange, Color.n_science_blue, Color.n_electric_violet, Color.n_seance, Color.n_scorpion, Color.n_scorpion];

    const chartData = data.map((value, index) => ({
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

    const pieData = data
      .map((value, index) => ({
        value,
        svg: {
          fill: pieChartColors[index],
        },
        key: `${index}`,
      }));
      
    const date = moment(this.props.date).format('DD MMMM YYYY');
    const titleText = translang.t('ALL_EMPLOYEE') + ` ${total} ` + translang.t('PEOPLE');

    return (
      <View style={styles.container} key={this.props.reportList}>
        <ScrollView style={styles.container}>
          <Text style={styles.topText1}>{date}</Text>
          <Text style={styles.topText2}>{titleText}</Text>
          <View style={styles.content}>
            <View style={{height: 25, width: 70, alignSelf: 'flex-end', flexDirection: 'row', marginTop: 10, marginRight: 10,}}>
              <TouchableOpacity 
                onPress={() => this.setState({showBarchat: true})}
                style={{borderTopLeftRadius: 5, borderBottomLeftRadius: 5, borderWidth: 1, flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: this.state.showBarchat ? Color.n_sel_button_color_blue : Color.white, borderColor: this.state.showBarchat ? Color.n_sel_button_color_blue : Color.n_default_gray, }}
              >
                <Image style={{width: 20, height: 20, resizeMode: 'contain'}} source={this.state.showBarchat ? Images.n_ic_chat_bar_sel : Images.n_ic_chat_bar_unsel} />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => this.setState({showBarchat: false})}
                style={{borderTopRightRadius: 5, borderBottomRightRadius: 5, borderWidth: 1, flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: this.state.showBarchat ? Color.white : Color.n_sel_button_color_blue, borderColor: this.state.showBarchat ? Color.n_default_gray : Color.n_sel_button_color_blue, }}
              >
                <Image style={{width: 20, height: 20, resizeMode: 'contain'}} source={this.state.showBarchat ? Images.n_ic_chat_pie_unsel : Images.n_ic_chat_pie_sel} />
              </TouchableOpacity>
            </View>

            {this.state.showBarchat && <View>
              <BarChart
                style={{ height: 250, marginTop: 20, marginHorizontal: 20, marginBottom: 10 }}
                data={chartData}
                svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
                yAccessor={({item}) => item.value}
                contentInset={{ top: 20,}}>
                <Labels/>
              </BarChart>
              <XAxis 
                style={{ marginHorizontal: 20, marginBottom: 20 }}
                data={data}
                formatLabel={(value, index) => statusTexts[index]}
                contentInset={{ left: 20, right: 20 }}
                svg={{ fontSize: 14, fill: 'black', fontWeight: 'bold', fontFamily: 'THSarabunNew' }}
              />
            </View>}
            {!this.state.showBarchat && <View>
              <PieChart
                style={{height: 288, marginTop: 20, marginHorizontal: 20, marginBottom: 10}}
                data={pieData}
                innerRadius="76%"
                padAngle={0.01} />
            </View>}
            
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
          { //cntEvent > 0 &&
            this.renderAttendanceItem(3, translang.t('EVENT'), event, total, Images.n_ic_report_users_event)
          }
          { //cntSickLeave > 0 &&
            this.renderAttendanceItem(4, translang.t('SICK_LEAVE'), sickLeave, total, Images.n_ic_report_users_sickleave)
          }
          { //cntPersonalLeave > 0 &&
            this.renderAttendanceItem(5, translang.t('PERSONAL_LEAVE'), personalLeave, total, Images.n_ic_report_users_personleave)
          }
          { //cntUncheck > 0 &&
            this.renderAttendanceItem(6, translang.t('OTHER_LEAVE'), otherLeave, total, Images.n_ic_report_users_undifine)
          }
          { //cntUncheck > 0 &&
            this.renderAttendanceItem(7, translang.t('HOLIDAY'), holiday, total, Images.n_ic_report_users_undifine)
          }
          

          <NextButton
            label={translang.t('MORE_DETAIL')}
            containerStyle={{width: '90%', marginRight: 'auto', marginLeft: 'auto', marginVertical: 15}}
            buttonStyle={{ borderRadius: 38, height: 78 }}
            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
            isVerticalGradient={false}
            _onPress={() => this.onMoreDetails()} />
        </ScrollView>
      </View>
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
    backgroundColor: 'white',
    margin: 20,
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
  topText1: {
    width: '100%',
    fontSize: 25,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  topText2: {
    width: '100%',
    fontSize: 18,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  barChart: {
    height: screenWidth * 0.7,
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