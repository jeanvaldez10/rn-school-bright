import React from 'react';
import {View, ScrollView, Text, TouchableOpacity, Dimensions} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import Color from '../../constants/color';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment';
import {PieChart} from 'react-native-svg-charts';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import Images from '../../themes/Images';
import ProgressHud from '../../components/ProgressHud';
import translang from '../../utils/language.utils';
import CalendarModal from '../../components/CalendarModal';


const screenWidth = Dimensions.get('window').width;


let pieWidth = 236;
if (screenWidth >= 600) {
    pieWidth = 350;
}

export default class AttendanceTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            showCalendarModal: false,
            showModal: false,
            selectedIndex: 0,
            selectedDateDropdownValue: translang.t('USERINFO_weekly'),
            selectedDateValue: "",
            startDate: null,
            endDate: null,
            statusList: [],
            userInfo: {},
        };
    }

    async componentDidMount() {
        const userInfo = await Storage.getUserInfo();
        const startOfWeek = moment().clone().startOf('week');
        const endOfWeek = moment().clone().endOf('week');

        const strStartOfWeek = moment().clone().startOf('week').add(1, 'day').format('DD MMM yyyy');
        const strEndOfWeek = moment().clone().endOf('week').add(1, 'day').format('DD MMM yyyy');
        const strWeek = strStartOfWeek + " - " + strEndOfWeek;

        this.setState({userInfo: userInfo, selectedDateDropdownValue: translang.t('USERINFO_weekly')}, () => {
            if (this.props.isSelected) {

                this.loadData(startOfWeek, endOfWeek);
            }
        });

    }

    componentWillUnmount = () => {

    };

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (!this.props.isSelected && nextProps.isSelected) {
            const startOfWeek = moment().clone().startOf('week');
            const endOfWeek = moment().clone().endOf('week');
            this.setState({selectedDateDropdownValue: translang.t('USERINFO_weekly')});
            this.loadData(startOfWeek, endOfWeek);
        }
        return true;
    }

    renderAttendanceItem = (index, itemColor, title, times, totalCount) => {
        let percentage = 0;
        if (totalCount > 0) {
            percentage = parseInt((times / totalCount) * 100);
        }

        return (
            <TouchableOpacity style={styles.attendanceItem} activeOpacity={1} onPress={() => {
                this.onSelectItem(index)
            }}>
                <View style={{...styles.attendanceItemMarkImage, backgroundColor: itemColor}}/>
                <Text style={{...styles.attendanceItemLabel, flex: 1, marginRight: 10}}>{title}</Text>
                <Text style={{
                    ...styles.attendanceItemLabel,
                    width: 90,
                    marginRight: 10
                }}>{`${times} ${translang.t('TIMES')}`}</Text>
                <Text style={{...styles.attendanceItemLabel, width: 65}}>{`(${percentage}%)`}</Text>
            </TouchableOpacity>
        )
    };

    onSelectItem = (index) => {
        this.setState({showModal: true, selectedIndex: index});
    }

    onDateSelected = (dates) => {
        this.setState({showCalendarModal: false});

        if (dates === null) {
            return;
        }

        this.loadData(dates.start, dates.end);
    }

    loadData = (start, end) => {
        this.setState({isLoading: true});
        const userInfo = this.state.userInfo;
        ApiManager.getCome2School(userInfo.ID, userInfo.SchoolID, start, end, -1).then(list => {
            const strValue = `${moment(start).format('DD MMM yyyy')} - ${moment(end).format('DD MMM yyyy')}`;
            this.setState({
                statusList: list,
                startDate: start,
                endDate: end,
                selectedDateValue: strValue,
                isLoading: false
            });
        }).catch(error => {
            console.log(error);
            this.setState({isLoading: false});
        });
    }

    render() {
        const startOfWeek = moment().clone().startOf('week').add(1, 'day');
        const endOfWeek = moment().clone().endOf('week').add(1, 'day');
        const startOfMonth = moment().clone().startOf('month');
        const endOfMonth = moment();
        const startOfYear = moment().clone().startOf('year');
        const endOfYear = moment();

        const dropdownPickerItems = [
            {
                label: translang.t('USERINFO_weekly') + "\t\t" + startOfWeek.format('DD MMM yyyy') + " - " + endOfWeek.format('DD MMM yyyy'),
                value: translang.t('USERINFO_weekly'),
                start: startOfWeek,
                end: endOfWeek
            },
            {
                label: translang.t('USERINFO_monthly') + "\t\t" + startOfMonth.format('DD MMM yyyy') + " - " + endOfMonth.format('DD MMM yyyy'),
                value: translang.t('USERINFO_monthly'),
                start: startOfMonth,
                end: endOfMonth
            },
            {
                label: translang.t('USERINFO_yearly') + "\t\t" + startOfYear.format('DD MMM yyyy') + " - " + endOfYear.format('DD MMM yyyy'),
                value: translang.t('USERINFO_yearly'),
                start: startOfYear,
                end: endOfYear
            },
            {label: translang.t('USERINFO_selectdate'), value: translang.t('USERINFO_selectdate'), start: "", end: ""}
        ];

        // const totalCount = this.state.statusList.length;
        const cntOnTime = this.state.statusList.filter(val => val.StatusIN == 0 || val.StatusIN == 7).length;
        const cntLate = this.state.statusList.filter(val => val.StatusIN == 1).length;
        const cntAbsence = this.state.statusList.filter(val => val.StatusIN == 3).length;
        const cntPersonalLeave = this.state.statusList.filter(val => val.StatusIN == 4 || val.StatusIN == 10).length;
        const cntSickLeave = this.state.statusList.filter(val => val.StatusIN == 5 || val.StatusIN == 11).length;
        const cntEvent = this.state.statusList.filter(val => val.StatusIN == 6 || val.StatusIN == 12).length;
        const cntLeaveOther = this.state.statusList.filter(val => val.StatusIN >= 21 && val.StatusIN <= 26).length;
        const cntUncheck = this.state.statusList.filter(val => val.StatusIN == 99).length;

        const totalCount = cntOnTime + cntLate + cntAbsence + cntPersonalLeave + cntSickLeave + cntEvent + cntLeaveOther + cntUncheck;

        const data = [cntOnTime, cntLate, cntAbsence, cntEvent, cntSickLeave, cntPersonalLeave, cntLeaveOther, cntUncheck];
        const pieChartColors = [Color.n_jungle_green, Color.n_default_brown, Color.n_default_orange, Color.n_science_blue, Color.n_electric_violet, Color.n_seance, Color.n_purple, Color.n_scorpion];

        const pieData = data
            .map((value, index) => ({
                value,
                svg: {
                    fill: pieChartColors[index],
                    onPress: () => {
                        this.onSelectItem(index)
                    },
                },
                key: `${index}`,
            }));

        const alertImages = [Images.ic_sticker_ontime, Images.ic_sticker_late,
            Images.ic_sticker_absence, Images.ic_sticker_event,
            Images.ic_sticker_sick_leave, Images.ic_sticker_personal_leave,
            Images.ic_sticker_absence];
        const alertTitles = [
            translang.t('USERINFO_ontime'), translang.t('USERINFO_late'),
            translang.t('USERINFO_absence'), translang.t('USERINFO_event'),
            translang.t('USERINFO_sickleave'), translang.t('USERINFO_personalleave'),
            translang.t('USERINFO_leaveother'), translang.t('USERINFO_uncheck')];
        const alertImage = alertImages[this.state.selectedIndex];
        const alertTitle = alertTitles[this.state.selectedIndex] + `${data[this.state.selectedIndex]} ${translang.t('TIMES')}`;
        const alertMsg = translang.t('USERINFO_total') + `${totalCount} ${translang.t('TIMES')}`;

        const isStudent = (this.state.userInfo.StudentId ?? '') !== ''

        return (
            <ScrollView style={styles.container}>
                <Text
                    style={styles.textPageTitle}> {isStudent ? translang.t('USERINFO_attendance') : translang.t('USERINFO_attendreport')} </Text>

                <DropDownPicker
                    arrowColor={Color.n_default_orange}
                    items={dropdownPickerItems}
                    defaultValue={this.state.selectedDateDropdownValue}
                    style={styles.dropdownPicker}
                    itemStyle={{justifyContent: 'flex-start'}}
                    containerStyle={styles.dropdownPickerContainer}
                    labelStyle={styles.dropdownPickerLabel}
                    dropDownStyle={styles.dropDown}
                    dropDownMaxHeight={240}
                    onChangeItem={item => {
                        this.setState({selectedDateDropdownValue: item.value});
                        if (item.value !== translang.t('USERINFO_selectdate')) {
                            this.loadData(item.start, item.end);
                        } else {
                            this.setState({showCalendarModal: true});
                        }
                    }}
                />

                <View style={styles.content}>
                    <View style={styles.contentPie}>
                        <PieChart
                            style={styles.pieChart}
                            data={pieData}
                            innerRadius="76%"
                            padAngle={0.01}/>
                        <View style={{
                            position: 'absolute',
                            top: 0,
                            left: pieWidth * 0.12,
                            right: pieWidth * 0.12,
                            bottom: 0,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text style={styles.pieChartTitle}>{this.state.selectedDateDropdownValue}</Text>
                            <Text style={styles.pieChartDate}>{this.state.selectedDateValue}</Text>

                        </View>
                    </View>
                    <View style={styles.contentDescription}>

                        { //cntOnTime > 0 &&
                            this.renderAttendanceItem(0, Color.n_jungle_green, translang.t('USERINFO_ontime'), cntOnTime, totalCount)
                        }
                        { //cntLate > 0 &&
                            this.renderAttendanceItem(1, Color.n_default_brown, translang.t('USERINFO_late'), cntLate, totalCount)
                        }
                        { //cntAbsence > 0 &&
                            this.renderAttendanceItem(2, Color.n_default_orange, translang.t('USERINFO_absence'), cntAbsence, totalCount)
                        }
                        { //cntEvent > 0 &&
                            this.renderAttendanceItem(3, Color.n_science_blue, translang.t('USERINFO_event'), cntEvent, totalCount)
                        }
                        { //cntSickLeave > 0 &&
                            this.renderAttendanceItem(4, Color.n_electric_violet, translang.t('USERINFO_sickleave'), cntSickLeave, totalCount)
                        }
                        { //cntPersonalLeave > 0 &&
                            this.renderAttendanceItem(5, Color.n_seance, translang.t('USERINFO_personalleave'), cntPersonalLeave, totalCount)
                        }
                        {
                            this.renderAttendanceItem(6, Color.n_purple, translang.t('USERINFO_leaveother'), cntLeaveOther, totalCount)
                        }
                        { //cntUncheck > 0 &&
                            this.renderAttendanceItem(7, Color.n_scorpion, translang.t('USERINFO_uncheck'), cntUncheck, totalCount)
                        }
                    </View>
                </View>
                <AlertWithImageModal
                    isVisible={this.state.showModal}
                    image={Images.n_ic_attendance_dialog}
                    title={alertTitle}
                    message={alertMsg}
                    buttonColors={[Color.green_button_color]}
                    onClose={() => {
                        this.setState({showModal: false})
                    }}
                />
                <ProgressHud isVisible={this.state.isLoading}/>
                <CalendarModal
                    isVisible={this.state.showCalendarModal}
                    type={'period'}
                    onDateSelect={result => this.onDateSelected(result)}/>
            </ScrollView>
        );
    }
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
    },
    textPageTitle: {
        marginTop: "25@vs",
        marginBottom: "15@vs",
        width: '100%',
        textAlign: 'center',
        color: Color.n_default_orange,
        fontWeight: 'bold',
        fontSize: "24@ms"
    },

    dropdownPickerContainer: {
        width: '92%',
        height: "45@ms",
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
        borderTopLeftRadius: "23@ms",
        borderTopRightRadius: "23@ms",
        borderBottomLeftRadius: "23@ms",
        borderBottomRightRadius: "23@ms"
    },
    dropDown: {
        backgroundColor: Color.white,

        shadowColor: 'black',
        shadowOffset: {
            width: "2@ms",
            height: "2@ms",
        },
        shadowOpacity: 0.3,
        elevation: 13,
        borderBottomLeftRadius: "23@ms",
        borderBottomRightRadius: "23@ms"
    },
    dropdownPickerLabel: {
        fontSize: "22@ms",
        fontFamily: 'THSarabunNew',
        color: Color.n_default_gray,
    },
    content: {
        marginTop: (pieWidth / 2) + 35,
        backgroundColor: Color.n_default_brown_light,
        borderTopLeftRadius: 90,
        paddingHorizontal: 15,
        paddingBottom: 15,
    },

    contentPie: {
        position: 'relative',
        width: pieWidth,
        height: pieWidth,
        marginTop: pieWidth / 2 * -1,
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: Color.white,
        elevation: 2,
        borderRadius: pieWidth / 2,
    },
    contentDescription: {
        width: '100%',
        height: '100%',
        paddingBottom: "40@vs",
    },

    pieChart: {
        width: '100%',
        height: '100%',
    },
    pieChartTitle: {
        textAlign: 'center',
        fontFamily: 'THSarabunNew',
        fontSize: "20@ms",
    },
    pieChartDate: {
        textAlign: 'center',
        fontFamily: 'THSarabunNew',
        fontSize: "18@ms",
    },
    attendanceItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    attendanceItemMarkImage: {
        width: "22@ms",
        height: "22@ms",
        borderRadius: "11@ms",
        marginRight: "20@ms",
        marginLeft: "35@ms",
        marginVertical: "10@vs",
    },
    attendanceItemLabel: {
        fontFamily: 'THSarabunNew',
        fontSize: "20@ms",
        textAlign: 'left',
    }
});
