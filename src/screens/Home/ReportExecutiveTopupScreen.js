import React, {useState} from 'react';
import {Image, View, BackHandler, TouchableOpacity, ImageBackground, FlatList,} from 'react-native';
import {Col, Text} from 'native-base';
import {ScaledSheet} from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment';
import {BarChart, LineChart, XAxis} from 'react-native-svg-charts';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import BackNavigationBar from '../../components/BackNavigationBar';
import {ScrollView} from 'react-native-gesture-handler';
import {Text as SvgText} from 'react-native-svg'
import NumberFormat from 'react-number-format';
import * as scale from 'd3-scale';

export default class ReportExecutiveTopupScreen extends React.Component {
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
        const {navigation} = this.props;
        this.focusListener = navigation.addListener("didFocus", async () => {
            if (this.backhandler) {
                this.backhandler.remove();
            }
            this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

            const userInfo = await Storage.getUserInfo();

            this.setState({userInfo: userInfo, startDate: moment(), endDate: moment(), selectedDateDropdownValue: 'currently'}, () => {
                if (this.state.selectedDateDropdownValue == 'currently') {
                    this.loadDataSingle();
                } else {
                    this.loadDataRange();
                }

            });
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

    loadDataSingle = () => {
        this.setState({isLoading: true});

        const userInfo = this.state.userInfo;
        const date = this.state.startDate;

        ApiManager.getReportTopUpSingleDate(userInfo.SchoolID, date).then(list => {
            this.setState({reportList: list, isLoading: false}, () => {
                this.makeData();
            })
        }).catch(error => {
            console.log(error);
            this.setState({isLoading: false});
        });
    };

    loadDataRange = () => {
        this.setState({isLoading: true});

        const userInfo = this.state.userInfo;
        const start = this.state.startDate;
        const end = this.state.endDate;
        ApiManager.getReportTopUpRangeDate(userInfo.SchoolID, start, end).then(list => {
            this.setState({reportList: list, isLoading: false}, () => {
                this.makeData();
            })
        }).catch(error => {
            console.log(error);
            this.setState({isLoading: false});
        });
    };

    makeData = () => {
        const list = this.state.reportList.Chart;
        let resList = [];
        let resXList = [];
        let weekstrList = [translang.t('SUN'), translang.t('MON'), translang.t('TUE'), translang.t('WED'), translang.t('THU'), translang.t('FRI'), translang.t('SAT')];
        let monthstrList = [translang.t('JAN'), translang.t('FEB'), translang.t('MAR'), translang.t('APR'), translang.t('MAY'), translang.t('JUN'), translang.t('JUL'), translang.t('AUG'), translang.t('SEP'), translang.t('OCT'), translang.t('NOV'), translang.t('DEC'),];

        if (this.state.selectedDateDropdownValue == 'currently') {
            const CountHours = 4;
            let tempsum = 0;

            for (let i = 0; i < list.length; i++) {
                tempsum = tempsum + list[i].TotatlMoney;
                if (i == 0) {
                    resList.push(parseFloat(tempsum).toFixed(2));
                    resXList.push(moment(list[i].Date).format('HH:mm'));
                    tempsum = 0;
                } else {
                    if (i != list.length - 1) {
                        if (i % CountHours == 0) {
                            resList.push(parseFloat(tempsum).toFixed(2));
                            resXList.push(moment(list[i].Date).format('HH:mm'));
                            tempsum = 0;
                        }
                    } else {
                        resList.push(parseFloat(tempsum).toFixed(2));
                        resXList.push(moment(list[i].Date).format('HH:mm'));
                        tempsum = 0;
                    }
                }
            }
        } else if (this.state.selectedDateDropdownValue == 'weekly') {
            resXList = [];
            resList = [];
            for (let i = 0; i < list.length; i++) {
                resList.push(parseFloat(list[i].TotatlMoney).toFixed(2));
                resXList.push(weekstrList[i]);
            }
        } else if (this.state.selectedDateDropdownValue == 'monthly') {
            const CountDay = 1;
            let tempsum = 0;
            for (let i = 0; i < list.length; i++) {
                tempsum = tempsum + list[i].TotatlMoney;
                if (i == 0) {
                    resList.push(parseFloat(tempsum).toFixed(2));
                    resXList.push(moment(list[i].Date).format('DD'));
                    tempsum = 0;
                } else {
                    if (i != list.length - 1) {
                        if (i % CountDay == 0) {
                            resList.push(parseFloat(tempsum).toFixed(2));
                            resXList.push(moment(list[i].Date).format('DD'));
                            tempsum = 0;
                        }
                    } else {
                        resList.push(parseFloat(tempsum).toFixed(2));
                        resXList.push(moment(list[i].Date).format('DD'));
                        tempsum = 0;
                    }
                }
            }
        } else if (this.state.selectedDateDropdownValue == 'yearly') {
            for (let i = 1; i < 13; i++) {
                const tempM = list.filter(item => moment(item.Date).format('M') == `${i}`);

                let total = 0;
                tempM.forEach((item) => {
                    total = total + item.TotatlMoney;
                });
                resList.push(parseFloat(total).toFixed(2));
                resXList.push(monthstrList[i - 1]);
            }
        }

        this.setState({chartList: resList, xList: resXList});
    }

    renderItem = (item) => {
        const total = item.TotatlMoney;
        const type = item.TOPUPTYPE;
        let temptotal = 0;
        this.state.reportList.Detail.forEach(item => {
            temptotal = temptotal + item.TotatlMoney;
        })

        const percent = (total / temptotal * 100).toFixed(1);


        return (
            <View style={styles.detailContainer}>
                <Image source={Images.n_ic_report_users_ontime} style={{width: 40, height: 40}}></Image>
                <Text style={{...styles.detailText, flex: 1, marginLeft: 10}}>{type}</Text>
                <NumberFormat
                    value={total}
                    displayType={'text'}
                    thousandSeparator={true}
                    renderText={value => (<Text style={styles.detailText}>{`${value}   (${percent}%)`}</Text>)}/>
            </View>
        );

    };

    render() {
        const today = moment().clone().format('YYYY-MM-DD');
        const todaystr = moment().clone().format('DD MMM YYYY');
        const startOfWeek = moment().clone().startOf('week').format('YYYY-MM-DD');
        const startOfWeekstr = moment().clone().startOf('week').format('DD MMM yyyy');
        const endOfWeek = moment().clone().endOf('week').format('YYYY-MM-DD');
        const endOfWeekstr = moment().clone().endOf('week').format('DD MMM yyyy');
        const startOfMonth = moment().clone().startOf('month').format('YYYY-MM-DD');
        const startOfMonthstr = moment().clone().startOf('month').format('DD MMM yyyy');
        const endOfMonth = moment().clone().endOf('month').format('YYYY-MM-DD');
        const endOfMonthstr = moment().clone().endOf('month').format('DD MMM yyyy');
        const startOfYear = moment().clone().startOf('year').format('YYYY-MM-DD');
        const startOfYearstr = moment().clone().startOf('year').format('DD MMM yyyy');
        const endOfYear = moment().clone().endOf('year').format('YYYY-MM-DD');
        const endOfYearstr = moment().clone().endOf('year').format('DD MMM yyyy');


        const dropdownPickerItems = [
            {label: translang.t('CURRENTLY') + "\t\t" + todaystr, value: 'currently', start: today, end: today},
            {
                label: translang.t('USERINFO_weekly') + "\t\t\t" + startOfWeekstr + " - " + endOfWeekstr,
                value: 'weekly',
                start: startOfWeek,
                end: endOfWeek
            },
            {
                label: translang.t('USERINFO_monthly') + "\t\t" + startOfMonthstr + " - " + endOfMonthstr,
                value: 'monthly',
                start: startOfMonth,
                end: endOfMonth
            },
            {
                label: translang.t('USERINFO_yearly') + "\t\t\t" + startOfYearstr + " - " + endOfYearstr,
                value: 'yearly',
                start: startOfYear,
                end: endOfYear
            },
        ];

        let title = "";
        if (this.state.selectedDateDropdownValue === 'currently') {
            title = translang.t('TOTAL_TOPUP_TODAY');
        } else if (this.state.selectedDateDropdownValue === 'weekly') {
            title = translang.t('TOTAL_TOPUP_WEEK');
        } else if (this.state.selectedDateDropdownValue === 'monthly') {
            title = translang.t('TOTAL_TOPUP_MONTH');
        } else if (this.state.selectedDateDropdownValue === 'yearly') {
            title = translang.t('TOTAL_TOPUP_YEAR');
        }
        let total = 0;
        if (this.state.reportList.Chart) {
            this.state.reportList.Chart.forEach(item => {
                total = total + item.TotatlMoney;
            });
        }


        const {chartList, xList} = this.state;

        const chartData = chartList.map((value, index) => ({
            value: parseFloat(value),
            svg: {
                fill: Color.n_button_gradient_green_end,
            },
            key: `${index}`,
        }));
        const CUT_OFF = Math.max.apply(Math, chartData.map(function (o) {
            return o.value;
        })) + 200;
        const Labels = ({x, y, bandwidth, data}) => (
            chartList.map((item, index) => (
                <SvgText
                    key={index}
                    x={x(index) + (bandwidth / 2)}
                    y={item < CUT_OFF ? y(item) - 10 : y(item) + 15}
                    fontSize={6}
                    fill={item >= CUT_OFF ? 'white' : 'black'}
                    alignmentBaseline={'middle'}
                    textAnchor={'middle'}>
                    {item > 0 ? item : ''}
                </SvgText>
            ))
        )

        let detailList = [];
        if (this.state.reportList.Detail) {
            detailList = this.state.reportList.Detail;
        }

        return (
            <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
                <BackNavigationBar
                    title={translang.t('TOPUP_REPORT')}
                    onMenuTap={this.back}
                />

                <ScrollView style={styles.container}>
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
                            const start = moment(item.start).format('YYYY-MM-DD');
                            const end = moment(item.end).format('YYYY-MM-DD');
                            this.setState({
                                selectedDateDropdownValue: item.value,
                                startDate: start,
                                endDate: end
                            }, () => {
                                if (this.state.selectedDateDropdownValue == 'currently') {
                                    this.loadDataSingle();
                                } else {
                                    this.loadDataRange();
                                }
                            });
                        }}
                    />
                    <View style={styles.chartContainer}>
                        <Text style={{
                            fontSize: 20,
                            fontFamily: 'THSarabunNew',
                            color: Color.n_default_gray
                        }}>{translang.t('LAST_UPDATE')}</Text>
                        <Text style={{
                            fontSize: 20,
                            fontFamily: 'THSarabunNew',
                            color: Color.n_default_gray
                        }}>{moment().format('HH:mm DD/MM/YYYY')}</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.text}>{title}</Text>
                            <NumberFormat
                                value={parseFloat(total).toFixed(2)}
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
                    {detailList.map((item) => this.renderItem(item))}
                </ScrollView>
                <ProgressHud isVisible={this.state.isLoading}/>
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
        fontWeight: 'bold',
        color: Color.n_default_gray,
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
