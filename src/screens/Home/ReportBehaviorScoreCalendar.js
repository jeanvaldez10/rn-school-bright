import React, { useState } from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, FlatList, } from 'react-native';
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
import Caretdown from 'react-native-vector-icons/AntDesign';
import moment from 'moment';

import AlertWithImageModal from '../../components/AlertWithImageModal';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import BackNavigationBar from '../../components/BackNavigationBar';
import CustomSwitcher from '../../components/CustomSwitcher';

export default class ReportBehaviorScoreCalendarScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      selected: '2021-06-06',
      isOpenCalendar: true,
      userInfo: {},
      isLoading: false,
      behaviorList: [],
      behavior: 0,
      tabIndex: 0,
      historyData: null,

      userTermInfo: {}
    };

  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const today = new Date();
      const userInfo = this.props.navigation.getParam('userInfo');
      this.setState({ selected: moment(today).format("YYYY-MM-DD"), userInfo: userInfo, tabIndex: 0 }, () => {
        this.loadData(moment(today));
        this.loadHistoryData();
      });
    });
  }

  loadData = (date) => {
    this.setState({ isLoading: true });   
    const userInfo = this.state.userInfo;

    ApiManager.getBehaviorScoreHistoryInDateRange(userInfo.SchoolID, "2", date, date).then(list => {
      this.setState({ behaviorList: list, isLoading: false}, () => {
        
      })
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  loadHistoryData = () => {
    const userInfo = this.state.userInfo;
    const termInfo = this.state.userTermInfo.TermID;
    this.setState({isLoading: true});
    ApiManager.getBehaviorScoreHistory(userInfo.ID, userInfo.SchoolID, termInfo).then(data => {
      this.setState({ historyData: data, isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  };

  onDaySelect = (date) => {
    const day = date.format('YYYY-MM-DD');
    this.setState({selected: day});
  };

  back = () => {
    
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.backhandler.remove();
    }

    this.props.navigation.navigate('Report');
    
  };

  onChangeSwitcher = (index) => {
    this.setState({tabIndex: index}, ()=>{
      if(this.state.tabIndex == 0){
        this.loadData(this.state.selected);
      }else{
        this.loadHistoryData();
      }
    })
  }

  onSelectBehavior = (item) => {
    this.props.navigation.navigate('ReportStudentBehaviorScoreDetail', {behavior: item});
  };
  
  renderItem = (item, index) => {
    const date = moment(item.day).format('DD MMM YYYY');
    let score = '';
    let color = Color.n_button_gradient_green_start;
    if (item.behaviorstype === '1') {
      score = `-${item.score} ${translang.t('Points')}`;
      color = Color.n_default_orange;
    } else {
      score = `+${item.score} ${translang.t('Points')}`;
      color = Color.n_button_gradient_green_start;
    }
    return (
      <TouchableOpacity style={styles.infoContainer} onPress={() => this.onSelectBehavior(item)}>
        <View style={{flex: 1,}}>
          <Text style={styles.infoDate}>{date}</Text>
          <Text style={styles.infoBehaviorName} numberOfLines={1}>
            {getCurrentLocale() === 'th' ? item.BehaviorsName : item.BehaviorsNameEN ?? item.BehaviorsName}
          </Text>
        </View>
        <Text style={{...styles.infoBehaviorScore, color: color}}>{score}</Text>
      </TouchableOpacity>
    )
  };

  renderHistoryItem = (item, index) => {
    const date = moment(item.Day).format('DD MMM YYYY');
    let score = '';
    let color = Color.n_button_gradient_green_start;
    if (item.BehaviorsType === '1') {
      score = `-${item.Score} ${translang.t('Points')}`;
      color = Color.n_default_orange;
    } else {
      score = `+${item.Score} ${translang.t('Points')}`;
      color = Color.n_button_gradient_green_start;
    }
    return (
      <TouchableOpacity style={styles.infoContainer} onPress={() => this.onSelectBehavior(item)}>
        <View style={{flex: 1,}}>
          <Text style={styles.infoDate}>{date}</Text>
          <Text style={styles.infoBehaviorName} numberOfLines={1}>
            {getCurrentLocale() === 'th' ? item.BehaviorsName : item.BehaviorsNameEN ?? item.BehaviorsName}
          </Text>
        </View>
        <Text style={{...styles.infoBehaviorScore, color: color}}>{score}</Text>
      </TouchableOpacity>
    )
  };

  render() {
    const options = [
      { title: translang.t('REPORT_calendar')},
      { title: translang.t('REPORT_list')},
    ];

    let markDates = {};
    this.state.behaviorList.forEach(behavior => {
      const day = moment(behavior.day).format('YYYY-MM-DD');
      if (!markDates[day]) {
        markDates[day] = {
          selected: true,
          selectedColor: Color.downy,
          selectedTextColor: 'white'
        };
      }
    });

    if (markDates[this.state.selected]) {
      markDates[this.state.selected] = {
        selected: true,
        disableTouchEvent: true,
        selectedColor: Color.jungle_green,
        selectedTextColor: 'white'
      };
    } else {
      markDates[this.state.selected] = {
        selected: true,
        disableTouchEvent: true,
        selectedColor: '#ff7a62',
        selectedTextColor: 'white'
      };
    }

    const selectedDate = moment(this.state.selected).format('DD MMM YYYY');
    const behaviorList = this.state.behaviorList.filter(behavior => {
      const day = moment(behavior.day).format('YYYY-MM-DD');
      if (this.state.selected === day) {
        return true;
      } else {
        return false;
      }
    });

    let historyRemainScore = 0;
    let historyList = [];

    if(this.state.historyData){
      historyRemainScore = this.state.historyData.LastScore;
      if(this.state.historyData.BehaviorsHistory){
        historyList = this.state.historyData.BehaviorsHistory;
      }
      
    }

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar 
          title={translang.t('DRAWER_reportbehavior')}
          onMenuTap={this.back}
        />

        <CustomSwitcher
          dataList={options}
          selectedIndex={this.state.tabIndex ?? 0}
          onChangedSwitch={(index)=>this.onChangeSwitcher(index)}
          containerStyle = {{marginHorizontal: 15, height: 50, marginTop: 20, marginBottom: 15,}}
          radius = {15}
          textSize = {20}
        />
        {this.state.tabIndex == 0 && 
        <View style={styles.container}>
          <ScrollView indicatorStyle={'white'}>
            <Calendar
              style={styles.calendar}
              onDayPress={(day) => {
                const date = moment(day.timestamp);
                this.onDaySelect(date);
              }}
              onMonthChange={(month) => {
                const date = moment(month.timestamp);
                this.loadData(date);
              }}
              monthFormat={'MMMM yyyy'}
              markedDates={markDates}
              disabledDaysIndexes={[0, 6]}
              hideExtraDays={false}
              disableAllTouchEventsForDisabledDays={false}

              theme={{
                todayTextColor:'white',
                textDayFontSize: 13,
                dayTextColor: Color.n_default_gray,
                todayTextColor: 'white',
                textSectionTitleColor: Color.n_default_gray,
                arrowColor: Color.n_default_gray,
                
                arrowColor: 'black',
                'stylesheet.calendar.header': {
                  monthText: {
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: Color.n_default_gray,
                  },
                  week: {
                    marginTop: 5,
                    marginHorizontal: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  },
                },
                'stylesheet.day.basic': {
                  today: {
                    fontFamily: 'THSarabunNew',
                    backgroundColor: Color.n_default_green_dark,
                    borderRadius: 16,
                  }
                },

              }}
            />
            <View style={ styles.menuContainer}>
              <Text style={styles.labelSelectDate}>{moment(this.state.selected).format('DD MMM YYYY')}</Text>
            </View>
            {/* <MenuItem
              label={selectedDate}
              show_caret="1"
              flag_open={!this.state.isOpenCalendar}
              onPressMenu={() => {
                // this.setState({ isOpenDate: !this.state.isOpenDate });
                this.setState({ isOpenCalendar: !this.state.isOpenCalendar });
              }}
              onPressCaret={() => {
                this.setState({ isOpenCalendar: !this.state.isOpenCalendar });
              }}
            /> */}
            <FlatList 
              data={behaviorList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem(item, index)}
            />

            <AlertWithImageModal
              isVisible={this.state.showModal}
              image={Images.ic_calendar}
              message={this.state.selectedDateData?.title ?? " "}
              buttonColors={[Color.green_button_next_color1, Color.green_button_next_color2]}
              isVerticalGradient={false}
              onClose={() => { this.setState({ showModal: false }) }}
            />
          </ScrollView>
          <ProgressHud isVisible={this.state.isLoading} />
        </View>}

        {this.state.tabIndex == 1 && <>
          
          <FlatList 
            data={historyList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderHistoryItem(item, index)}
          />

          <View style={{...styles.bottomContainer}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', }}>
              <Text style={styles.HeaderTitle}>{translang.t('REMAINING_SCORE')}</Text>
              <Text style={styles.HeaderScore}>{historyRemainScore}</Text>
            </View>
          </View>          
        </>

        }


        
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,
  },
  calendar: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: 'black', 
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    elevation: 2,
  },

  menuContainer: {
    height: 60,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: Color.n_default_brown,
    shadowColor: 'black', 
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2.0,
  },

  labelSelectDate:{
    fontFamily: 'THSarabunNew',
    color: Color.white,
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 50,
  },


  attendanceItemMarkImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 20,
    marginVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 6,
    alignItems: 'center'
  },
  infoContainer: {
    height: 100,
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

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
  infoDate: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_gray_dark,
  },
  infoBehaviorName: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: Color.n_default_gray_dark,
  },
  infoBehaviorScoreContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Color.red_color_bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBehaviorScore: {
    width: 100,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    marginLeft: 10,
  },
  bottomContainer: {
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 30,

    borderRadius: 20,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    
    borderBottomLeftRadius: 0, 
    borderBottomRightRadius: 0
  },
  HeaderTitle:{
    fontSize: 30, 
    fontWeight: 'bold', 
    color: Color.n_button_gradient_green_start, 
    fontFamily: 'THSarabunNew',
  },
  HeaderScore: {
    fontSize: 30, 
    fontWeight: 'bold', 
    color: Color.n_button_gradient_green_start, 
    fontFamily: 'THSarabunNew',
  },
});
