import React, {useState} from 'react';
import {Image, View, BackHandler, Dimensions, ScrollView, Text, TouchableOpacity, FlatList} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import {SafeAreaView} from 'react-native-safe-area-context';
import CalendarModal from '../../components/CalendarModal';
import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';
import CustomSwitcher from '../../components/CustomSwitcher';
import {BarChart, XAxis, PieChart} from 'react-native-svg-charts';
import NextButton from '../../components/NextButton';
import {Text as SvgText} from 'react-native-svg'
import NumberFormat from 'react-number-format';

const screenWidth = Dimensions.get('window').width;
export default class ReportExecutiveAttendanceNoTabScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            showCalendarModal: false,
            userInfo: {},
            tabIndex: 0,
            selectedDate: '',
            studentReportList: {},
            personalReportList: {},
            showBarchat: true,
            student_expands: [{expands: false, list: []}, {expands: false, list: []}, {
                expands: false,
                list: []
            }, {expands: false, list: []}, {expands: false, list: []}, {expands: false, list: []}, {
                expands: false,
                list: []
            }],
            personal_expands: [{expands: false, list: []}, {expands: false, list: []}, {
                expands: false,
                list: []
            }, {expands: false, list: []}, {expands: false, list: []}, {expands: false, list: []}, {
                expands: false,
                list: []
            }],
            initialExpands: [{expands: false, list: []}, {expands: false, list: []}, {
                expands: false,
                list: []
            }, {expands: false, list: []}, {expands: false, list: []}, {expands: false, list: []}, {
                expands: false,
                list: []
            }],
            isLoading: false,
        };
    }

    handleBackButton = () => {
        if (this.state.showCalendarModal) {
            this.setState({showCalendarModal: false});
            return true;
        }
        this.back();
        return true;
    };

    componentDidMount() {
        console.log("ReportExecutiveAttendanceNoTabScreen");
        const {navigation} = this.props;
        this.focusListener = navigation.addListener("didFocus", () => {
            if (this.backhandler) {
                this.backhandler.remove();
            }
            this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

            const userInfo = this.props.navigation.getParam('userInfo');
            const selectedDate = this.props.navigation.getParam('date');
            this.setState({userInfo: userInfo, selectedDate: selectedDate}, () => {
                this.loadData();
            })
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

        const parentRoute = this.props.navigation.getParam('parent') ?? 'Report';
        this.props.navigation.navigate(parentRoute);
    };

    loadData = () => {
        this.setState({isLoading: true});

        const userInfo = this.state.userInfo;
        const date = this.state.selectedDate;

        ApiManager.getAttendanceSchoolReportGraph(userInfo.SchoolID, date).then(list => {
            let studentList = {};
            let personalList = {};

            if ((list.student ?? []).length > 0) {
                studentList = list.student[0];
            }
            if ((list.employees ?? []).length > 0) {
                personalList = list.employees[0];
            }

            this.setState({studentReportList: studentList, personalReportList: personalList, isLoading: false});
        }).catch(error => {
            console.log(error);
            this.setState({isLoading: false});
        });
    }

    onDateSelected = (date) => {
        if (date) {
            const _date = moment(date).format('YYYY-MM-DD');
            this.setState({showCalendarModal: false, selectedDate: _date}, () => {
                this.loadData();
            });
        } else {
            this.setState({showCalendarModal: false});
        }
    }

    onChangeSwitcher = (index) => {
        this.setState({tabIndex: index, isEdit: false})
    }

    onMoreDetail = () => {
        if (this.state.tabIndex == 0) {
            this.props.navigation.navigate('ReportExecutiveClassList', {
                date: this.state.selectedDate,
                userInfo: this.state.userInfo
            });
        } else {
            this.props.navigation.navigate('ReportExecutiveDepartmentList', {
                date: this.state.selectedDate,
                userInfo: this.state.userInfo
            });
        }
    }

    toggleExpand = async (index, peoples) => {
        const type = this.state.tabIndex === 0 ? 'student' : 'personal';
        const expandsKey = type === 'student' ? 'student_expands' : 'personal_expands';
        const expands = [...this.state[expandsKey]];

        if (expands[index].expands === false) {
            this.setState({isLoading: true});
            try {
                const data = await ApiManager.getLogStatus(this.state.userInfo.SchoolID, this.state.selectedDate, `status_${index}`, type === 'student' ? 'Student' : 'Employees');
                console.log("log data:", data.sbulevel_NameEN);
                expands[index].list = data.length > 0 ? data : [];
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            this.setState({[expandsKey]: expands, isLoading: false});
        }

        expands[index].expands = !expands[index].expands;
        this.setState({[expandsKey]: expands});
    };

    renderStudentView = (item, index) => {
        let name, logTime, logTimes;
        name = (item.FirstNameTH ?? '') + ' ' + (item.LastNameTH ?? '');
        if (getCurrentLocale() == 'en') {
            if (item.FirstNameEN) {
                name = (item.FirstNameEN ?? '') + ' ' + (item.LastNameEN ?? '');
            }
        }
        if (this.state.tabIndex == 1) {
            name = item.name;
        }
        if (item.LogTime) {
            logTimes = item.LogTime.split(':');
            logTime = logTimes[0] + ':' + logTimes[1]
        } else {
            logTime = '';
        }

        return (
            <View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <Text style={{
                        ...styles.attendanceStudentLabel,
                        flexBasis: 'auto',
                        flexGrow: 0
                    }}>{index + 1}.</Text>
                    <Text style={{
                        ...styles.attendanceStudentLabel,
                        flexBasis: 100,
                        flexGrow: 1,
                        marginLeft: 3
                    }}>{name}</Text>
                    <Text
                        style={{...styles.attendanceStudentLabel, flexBasis: 'auto', flexGrow: 0}}>{logTime}</Text>
                </View>
            </View>
        )
    }

    renderClassView = (item, index) => {
        let name, logDatas;
        if (this.state.tabIndex == 0) {
            name = getCurrentLocale() == 'th' ? item.sbulevel_Name : item.sbulevel_NameEN ?? item.sbulevel_Name;
            logDatas = item.logDatas;
        } else {
            name = getCurrentLocale() == 'th' ? item.department_Name : item.department_NameEN ?? item.department_Name;
            logDatas = item.LogDatas;
        }
        return (
            <View style={{marginBottom: 16}}>
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between',}}>
                    <Text style={styles.attendanceItemLabel}>{name}</Text>
                    <NumberFormat
                        value={logDatas.length}
                        displayType={'text'}
                        thousandSeparator={true}
                        renderText={value => (<Text style={{
                            ...styles.attendanceItemLabel,
                        }}>{`${value} ${translang.t('PEOPLE')}`}</Text>)}/>
                </View>
                {(logDatas.length > 0) &&
                <FlatList
                    data={logDatas}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item, index}) => this.renderStudentView(item, index)}/>
                }

            </View>
        )
    }

    renderAttendanceItem = (index, title, peoples, totalCount, image) => {
        let percentage = 0, expands, list;
        if (totalCount > 0) {
            percentage = parseFloat((peoples / totalCount) * 100).toFixed(1);
        }

        const logStatus = this.state.tabIndex == 0 ? this.state.student_expands[index] : this.state.personal_expands[index];

        if (logStatus) {
            expands = logStatus.expands;
            list = logStatus.list;
        } else {
            expands = false;
            list = [];
        }

        return (
            <View>
                <TouchableOpacity style={styles.attendanceItem} onPress={() => this.toggleExpand(index, peoples)}>
                    <Image source={image} style={{width: 43, height: 43, marginRight: 20,}}/>
                    <Text
                        style={{
                            ...styles.attendanceItemLabel,
                            flex: 1,
                            marginRight: 10,
                            textAlign: 'left'
                        }}>{title}</Text>
                    <NumberFormat
                        value={peoples}
                        displayType={'text'}
                        thousandSeparator={true}
                        renderText={value => (<Text style={{
                            ...styles.attendanceItemLabel,
                            flex: 1,
                            marginRight: 10,
                            textAlign: 'right'
                        }}>{`${value} ${translang.t('PEOPLE')}`} {`(${percentage}%)`}</Text>)}/>
                </TouchableOpacity>
                {expands && list.length > 0 &&
                <View style={styles.logStatusView}>
                    <FlatList
                        style={{marginTop: 10}}
                        data={list}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => this.renderClassView(item, index)}/>
                </View>
                }
            </View>
        )
    };

    render() {
        const options = [
            {title: translang.t('STUDENT')},
            {title: translang.t('PERSONAL1')}
        ];

        let info = {};
        let onTime = 0;
        let late = 0;
        let absence = 0;
        let event = 0;
        let sickLeave = 0;
        let personalLeave = 0;
        let holiday = 0;
        let otherLeave = 0;

        let data = [];
        let total = 0;
        let statusTexts = [];
        let pieChartColors = [];

        if (this.state.tabIndex == 0) { //Student
            info = this.state.studentReportList;

            onTime = info.status_0 ?? 0;
            late = info.status_1 ?? 0;
            absence = info.status_2 ?? 0;
            personalLeave = info.status_3 ?? 0;
            sickLeave = info.status_4 ?? 0;
            event = info.status_5 ?? 0;
            otherLeave = info.status_6 ?? 0;

            total = onTime + late + absence + personalLeave + sickLeave + event + otherLeave;
            data = [onTime, late, absence, personalLeave, sickLeave, event, otherLeave];
            statusTexts = [translang.t('ON_TIME'), translang.t('LATE'), translang.t('ABSENCE'), translang.t('PERSONAL'), translang.t('SICK'), translang.t('EVENT'), translang.t('UNDEFINED')];
            pieChartColors = [Color.n_button_gradient_green_end, Color.n_default_brown, Color.n_default_orange, Color.n_seance, Color.n_electric_violet, Color.n_science_blue, Color.n_scorpion];
        } else {
            info = this.state.personalReportList;

            onTime = info.status_0 ?? 0;
            late = info.status_1 ?? 0;
            absence = info.status_2 ?? 0;
            personalLeave = info.status_3 ?? 0;
            sickLeave = info.status_4 ?? 0;
            otherLeave = info.status_5 ?? 0;
            holiday = info.status_6 ?? 0;

            total = onTime + late + absence + personalLeave + sickLeave + otherLeave + holiday;
            data = [onTime, late, absence, personalLeave, sickLeave, otherLeave, holiday];
            statusTexts = [translang.t('ON_TIME'), translang.t('LATE'), translang.t('ABSENCE'), translang.t('PERSONAL'), translang.t('SICK'), translang.t('OTHER_LEAVE'), translang.t('HOLIDAY')];
            pieChartColors = [Color.n_button_gradient_green_end, Color.n_default_brown, Color.n_default_orange, Color.n_seance, Color.n_electric_violet, Color.n_scorpion, Color.n_scorpion];
        }
        const chartData = data.map((value, index) => ({
            value,
            svg: {
                fill: pieChartColors[index],
            },
            key: `${index}`,
        }));

        const CUT_OFF = Math.max.apply(Math, chartData.map(function (o) {
            return o.value;
        })) + 200;
        const Labels = ({x, y, bandwidth, data}) => (
            data.map((item, index) => (
                <SvgText
                    key={index}
                    x={x(index) + (bandwidth / 2)}
                    y={item.value < CUT_OFF ? y(item.value) - 10 : y(item.value) + 15}
                    fontSize={9}
                    fill={item.value >= CUT_OFF ? 'white' : 'black'}
                    alignmentBaseline={'middle'}
                    textAnchor={'middle'}>
                    {item.value}
                </SvgText>
            ))
        )

        const pieData = data.map((value, index) => ({
            value,
            svg: {
                fill: pieChartColors[index],
            },
            key: `${index}`,
        }));

        const date = moment(this.state.selectedDate).format('DD MMMM YYYY');

        let titleText = "";
        // if(this.state.tabIndex == 0){
        //   titleText = translang.t('ALL_STUDENT') + ` ${total} ` + translang.t('PEOPLE');
        // }else{
        //   titleText = translang.t('ALL_EMPLOYEE') + ` ${total} ` + translang.t('PEOPLE');
        // }

        return (
            <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
                <ProgressHud isVisible={this.state.isLoading}/>
                <BackNavigationBar
                    title={translang.t('DRAWER_reportattendance')}
                    onMenuTap={() => this.back()}
                    is_calendar="1"
                    onCalendarTap={() => this.setState({showCalendarModal: true})}
                />

                <View style={styles.container}>
                    <CustomSwitcher
                        dataList={options}
                        selectedIndex={this.state.tabIndex ?? 0}
                        onChangedSwitch={(index) => this.onChangeSwitcher(index)}
                        containerStyle={{marginHorizontal: 15, height: 50, marginTop: 20, marginBottom: 20}}
                        radius={15}
                        textSize={23}
                    />

                    <ScrollView style={styles.container}>
                        <Text style={styles.topText1}>{date}</Text>
                        <NumberFormat
                            value={total}
                            displayType={'text'}
                            thousandSeparator={true}
                            renderText={value => (<Text
                                style={styles.topText2}>{`${this.state.tabIndex == 0 ? translang.t('TOTAL_STUDENTS') : translang.t('TOTAL_PERSONAL')} ${value} ${translang.t('PEOPLE')}`}</Text>)}/>
                        <View style={styles.content}>
                            <View style={{
                                height: 25,
                                width: 70,
                                alignSelf: 'flex-end',
                                flexDirection: 'row',
                                marginTop: 10,
                                marginRight: 10,
                            }}>
                                <TouchableOpacity
                                    onPress={() => this.setState({showBarchat: true})}
                                    style={{
                                        borderTopLeftRadius: 5,
                                        borderBottomLeftRadius: 5,
                                        borderWidth: 1,
                                        flexDirection: 'row',
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: this.state.showBarchat ? Color.n_sel_button_color_blue : Color.white,
                                        borderColor: this.state.showBarchat ? Color.n_sel_button_color_blue : Color.n_default_gray,
                                    }}
                                >
                                    <Image style={{width: 20, height: 20, resizeMode: 'contain'}}
                                           source={this.state.showBarchat ? Images.n_ic_chat_bar_sel : Images.n_ic_chat_bar_unsel}/>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => this.setState({showBarchat: false})}
                                    style={{
                                        borderTopRightRadius: 5,
                                        borderBottomRightRadius: 5,
                                        borderWidth: 1,
                                        flexDirection: 'row',
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: this.state.showBarchat ? Color.white : Color.n_sel_button_color_blue,
                                        borderColor: this.state.showBarchat ? Color.n_default_gray : Color.n_sel_button_color_blue,
                                    }}
                                >
                                    <Image style={{width: 20, height: 20, resizeMode: 'contain'}}
                                           source={this.state.showBarchat ? Images.n_ic_chat_pie_unsel : Images.n_ic_chat_pie_sel}/>
                                </TouchableOpacity>
                            </View>

                            {this.state.showBarchat && <View>
                                <BarChart
                                    style={{height: 250, marginTop: 20, marginHorizontal: 20, marginBottom: 10}}
                                    data={chartData}
                                    svg={{fill: 'rgba(134, 65, 244, 0.8)'}}
                                    yAccessor={({item}) => item.value}
                                    contentInset={{top: 20,}}>
                                    <Labels/>
                                </BarChart>
                                <XAxis
                                    style={{marginHorizontal: 20, marginBottom: 20}}
                                    data={data}
                                    formatLabel={(value, index) => statusTexts[index]}
                                    contentInset={{left: 20, right: 20}}
                                    svg={{
                                        fontSize: 14,
                                        fill: 'black',
                                        fontWeight: 'bold',
                                        fontFamily: 'THSarabunNew'
                                    }}
                                />
                            </View>}
                            {!this.state.showBarchat && <View>
                                <PieChart
                                    style={{height: 288, marginTop: 20, marginHorizontal: 20, marginBottom: 10}}
                                    data={pieData}
                                    innerRadius="76%"
                                    padAngle={0.01}/>
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
                        { //cntPersonalLeave > 0 &&
                            this.renderAttendanceItem(3, translang.t('PERSONAL_LEAVE'), personalLeave, total, Images.n_ic_report_users_personleave)
                        }
                        { //cntSickLeave > 0 &&
                            this.renderAttendanceItem(4, translang.t('SICK_LEAVE'), sickLeave, total, Images.n_ic_report_users_sickleave)
                        }
                        {this.state.tabIndex == 0 &&
                        this.renderAttendanceItem(5, translang.t('EVENT'), event, total, Images.n_ic_report_users_event)
                        }

                        {this.state.tabIndex == 0 &&
                        this.renderAttendanceItem(6, translang.t('UNDEFINED'), otherLeave, total, Images.n_ic_report_users_undifine)
                        }

                        {this.state.tabIndex == 1 &&
                        this.renderAttendanceItem(5, translang.t('OTHER_LEAVE'), otherLeave, total, Images.n_ic_report_users_undifine)
                        }
                        {this.state.tabIndex == 1 &&
                        this.renderAttendanceItem(6, translang.t('HOLIDAY'), holiday, total, Images.n_ic_report_users_undifine)
                        }

                        <NextButton
                            label={translang.t('MORE_DETAIL')}
                            containerStyle={{
                                width: '90%',
                                marginRight: 'auto',
                                marginLeft: 'auto',
                                marginVertical: 15
                            }}
                            buttonStyle={{borderRadius: 38, height: 78}}
                            colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                            isVerticalGradient={false}
                            _onPress={() => this.onMoreDetail()}/>
                    </ScrollView>


                </View>
                <CalendarModal
                    isVisible={this.state.showCalendarModal}
                    type={'single'}
                    onDateSelect={result => this.onDateSelected(result)}/>
                <ProgressHud isVisible={this.state.isLoading}/>
            </SafeAreaView>
        );
    }
}

const
    styles = ScaledSheet.create({
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
        logStatusView: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 20,
            marginVertical: 8,
            paddingHorizontal: 15,
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
        attendanceStudentLabel: {
            fontFamily: 'THSarabunNew',
            fontSize: 16,
            color: Color.n_default_gray,
        },
    });
