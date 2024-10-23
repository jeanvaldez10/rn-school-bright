import React, {useState} from 'react';
import {Image, View, BackHandler, TouchableOpacity, ScrollView, Text,} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';

import ProgressHud from '../../components/ProgressHud';
import BackNavigationBar from '../../components/BackNavigationBar';
import FilterModal from '../../components/FilterModal';
import ReportAttendanceCheckInTab from './ReportAttendanceCheckInTab';
import ReportAttendanceSubjectTab from './ReportAttendanceSubjectTab';

import translang, {getCurrentLocale} from '../../utils/language.utils';
import CustomSwitcher from '../../components/CustomSwitcher';
import ClassLevelModal from '../../components/SelectListModal';
import ClassModal from '../../components/SelectListModal';
import SchoolYearModal from '../../components/SchoolYearModal';
import SemesterModal from '../../components/SemesterModal';
import SubjectModal from '../../components/SelectListModal';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import NextButton from '../../components/NextButton';
import Storage from '../../managers/StorageManager';
import ApiManager from '../../managers/ApiManager';
import moment from 'moment';

export default class ReportAttendanceNoTabScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            tabIndex: 0,
            userInfo: null,

            showClassLevelModal: false,
            showClassModal: false,
            showSchoolYearModal: false,
            showSemesterModal: false,
            showSubjectModal: false,

            selectedClassLevel: null,
            selectedClassRoom: null,
            selectedSchoolYear: null,
            selectedSemester: null,
            selectedSubject: null,

            classLevelList: [],
            classRoomList: [],
            yearList: [],
            termList: [],
            subjectList: [],
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
            this.setState({userInfo: userInfo}, () => {
                this.getYearList();
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

        this.setState({
            tabIndex: 0,
            selectedSchoolYear: null,
            selectedSemester: null,
            selectedClassLevel: null,
            selectedClassRoom: null,
            selectedSubject: null
        }, () => {
            const parentRoute = this.props.navigation.getParam('parent') ?? 'Report';
            this.props.navigation.navigate(parentRoute);
        });


    };

    onChangeSwitcher = (index) => {
        console.log(this.state.yearList);
        this.setState({
            tabIndex: index,
            // selectedSchoolYear: null,
            // selectedSemester: null,
            // selectedClassLevel: null,
            // selectedClassRoom: null,
            // selectedSubject: null
        }, () => {
          // this.InitYear(this.state.yearList);
        });
    }

    InitYear = (list_years) => {
        if(!this.state.selectedSchoolYear){
            list_years.forEach((item) => {
                if (item.IsCurrentAcademicYear) {
                    item.name = item.YearNumber;
                    item.nameEn = item.YearNumberEn;
                    this.setState({selectedSchoolYear: item}, () => {
                        this.getTermList(true);
                        this.getClassLevelData();
                    });
                }
            })
        }

    };

    getYearList = () => {
        this.setState({isLoading: true})
        ApiManager.getYearSelectGrade(this.state.userInfo.SchoolID).then(data => {
            console.log("yeardata:", data);
            this.setState({yearList: data, isLoading: false});
            this.InitYear(data);
        }).catch(error => {
            console.error("ERRROR", error);
        });
    };
    getTermList = (autoInit = false) => {
        ApiManager.getTermSelectGrade(this.state.selectedSchoolYear.Yearid, this.state.userInfo.ID).then(data => {
            console.log("terms data: ", data);
            let temp = null;
            const current = moment();
            if (autoInit) {
                data.forEach((val) => {
                    if (temp) {
                        if (current.isAfter(temp.dEnd) && current.isBefore(val.dEnd)) {
                            temp = val;
                        }
                    } else {
                        if (current.isBefore(val.dEnd)) {
                            temp = val;
                        }
                    }
                });

                if ((!temp) && (data.length)) {
                    temp = data[data.length - 1];
                }
                if (temp) {
                    temp.name = temp.sTerm;
                    temp.ID = temp.nTerm;
                }

                this.setState({termList: data, isLoading: false, selectedSemester: temp});

            } else {
                this.setState({termList: data, isLoading: false, selectedSemester: null});
            }
        }).catch(error => {
            console.error(error);
        });
    };

    getClassLevelData = () => {
        ApiManager.getStudentClassLevel(this.state.userInfo.SchoolID).then(list => {
            this.setState({classLevelList: list});
        }).catch(error => {
            console.log(error);
            this.setState({isLoading: false});
        });
    };

    getClassRoomData = () => {
        ApiManager.getSchoolClassroom(this.state.userInfo.SchoolID, this.state.selectedClassLevel.ID).then(list => {
            this.setState({classRoomList: list});
        }).catch(error => {
            console.log(error);
            this.setState({isLoading: false});
        });
    };

    getSubjectData = () => {
        ApiManager.getSubject(this.state.userInfo.SchoolID, this.state.selectedClassRoom.ID).then(list => {
            if (list.length > 0 && list[0].plane_id) {
                this.setState({subjectList: list});
            } else {
                this.setState({subjectList: []});
            }
        }).catch(error => {
            console.log(error);
            this.setState({isLoading: false});
        })
    }

    getPlanData = () => {
        const teacherid = this.state.userInfo.ID;
        const termid = this.state.selectedSemester.ID;
        const levelid = this.state.selectedClassRoom.ID;
        ApiManager.getPlanInfo(teacherid, termid, levelid).then(list => {
            if (list.length > 0 && list[0].PlaneID) {
                this.setState({subjectList: list});
            } else {
                this.setState({subjectList: []});
            }
        }).catch(error => {
            console.log(error);
        });
    }
    _onChangeSchoolYear = () => {
        this.setState({
            showSchoolYearModal: true,
        });
    };
    onSchoolYearSelect = (item) => {
        if (item == null) {
            this.setState({showSchoolYearModal: false})
        } else {
            this.setState({
                showSchoolYearModal: false,
                selectedSchoolYear: item,
                selectedSemester: null,
                selectedClassLevel: null,
                selectedClassRoom: null,
                selectedSubject: null
            }, () => {
                this.getTermList();
            })
        }
    };

    _onChangeSemester = () => {
        const {selectedSchoolYear} = this.state;
        if (selectedSchoolYear == null) {
            this.setState({showModal: true, modalBody: translang.t('ACADEMIC_msg_selectyear')});
            return;
        }

        this.setState({
            showSemesterModal: true,
        });
    };
    onSemesterSelect = (item) => {
        if (item == null) {
            this.setState({showSemesterModal: false});
        } else {
            this.setState({
                showSemesterModal: false,
                selectedSemester: item,
                selectedClassLevel: null,
                selectedClassRoom: null,
                selectedSubject: null
            }, () => {
                this.getClassLevelData();
            });
        }
    };

    _onChangeClassLevel = () => {
        if (this.state.selectedSemester == null) {
            this.setState({showModal: true, modalBody: translang.t('ACADEMIC_msg_selectsemester')});
            return;
        }

        this.setState({showClassLevelModal: true});
    };
    onClassLevelSelect = (item, index) => {
        if (item == null) {
            this.setState({showClassLevelModal: false})
        } else {
            const classLevel = this.state.classLevelList[index];
            this.setState({
                showClassLevelModal: false,
                selectedClassLevel: classLevel,
                selectedClassRoom: null,
                selectedSubject: null
            }, () => {
                this.getClassRoomData();
            });
        }
    };

    _onChangeClass = () => {
        if (this.state.selectedClassLevel == null) {
            this.setState({showModal: true, modalBody: translang.t('HOMEWORK_select_classlevel')});
            return;
        }

        if (this.state.classRoomList.length === 0) {
            this.setState({showModal: true, modalBody: translang.t('NO_CLASSROOM')});
        } else {
            this.setState({
                showClassModal: true,
            });
        }
    };
    onClassSelect = (item, index) => {
        if (item == null) {
            this.setState({showClassModal: false})
        } else {
            const classRoom = this.state.classRoomList[index];
            this.setState({showClassModal: false, selectedClassRoom: classRoom, selectedSubject: null}, () => {
                this.getPlanData();
            })
        }
    };

    _onChangeSubject = () => {
        if (this.state.selectedClassRoom == null) {
            this.setState({showModal: true, modalBody: translang.t('HOMEWORK_select_class')});
            return;
        }
        if (this.state.subjectList.length === 0) {
            this.setState({showModal: true, modalBody: translang.t('HAVE_NOT_ARRANGED_TIME_TABLE')});
        } else {
            this.setState({
                showSubjectModal: true,
            });
        }
    };
    onSubjectSelect = (item, index) => {
        if (item == null) {
            this.setState({showSubjectModal: false})
        } else {
            this.setState({showSubjectModal: false, selectedSubject: item})
        }
    };

    renderSubjectListItem = (item, index) => {
        let ScheduleName = item.ScheduleName;
        let courseCode = item.courseCode;
        if (getCurrentLocale() == "en" && item.ScheduleNameEN && item.ScheduleNameEN != "") {
            ScheduleName = item.ScheduleNameEN
        }

        if (getCurrentLocale() == "en" && item.courseCodeEN && item.courseCodeEN != "") {
            courseCode = item.courseCodeEN
        }

        return (
            <TouchableOpacity onPress={() => this.onSubjectSelect(item, index)}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: 40
                }}>
                    <Text
                        style={{fontFamily: 'THSarabunNew', fontSize: 26}}>
                        {courseCode}
                    </Text>
                    <Text
                        style={{fontFamily: 'THSarabunNew', fontSize: 26, marginLeft: 10}}>
                        {ScheduleName}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    __next = () => {
        const {selectedSchoolYear, selectedSemester, selectedClassLevel, selectedClassRoom} = this.state;

        if (selectedSchoolYear == null) {
            this.setState({showModal: true, modalBody: translang.t('ACADEMIC_msg_selectyear')});
            return;
        } else if (selectedSemester == null) {
            this.setState({showModal: true, modalBody: translang.t('ACADEMIC_msg_selectsemester')});
            return;
        } else if (selectedClassLevel == null) {
            this.setState({showModal: true, modalBody: translang.t('HOMEWORK_select_classlevel')});
            return;
        } else if (selectedClassRoom == null) {
            this.setState({showModal: true, modalBody: translang.t('BEHAVIOR_msg_selectclass')});
            return;
        }

        const {selectedSubject} = this.state;
        if (selectedSubject == null && this.state.tabIndex != 0) {
            this.setState({showModal: true, modalBody: translang.t('HOMEWORK_select_subject')});
            return;
        }
        let params = {}

        if (this.state.tabIndex == 0) {
            params = {
                year: selectedSchoolYear,
                userInfo: this.state.userInfo,
                classRoom: selectedClassRoom,
                classLevel: selectedClassLevel,
                terminfo: selectedSemester,
            }
            this.props.navigation.navigate('ReportAttendanceCalendar', params);
        } else {
            params = {
                year: selectedSchoolYear,
                userInfo: this.state.userInfo,
                classRoom: selectedClassRoom,
                subject: selectedSubject,
                terminfo: selectedSemester,
            };
            this.props.navigation.navigate('ReportAttendanceSubjectCalendar', params);
        }


    };

    render() {
        const options = [
            {title: translang.t('Check_Name')},
            {title: translang.t('CHECKIN_SUBJECT')},
        ];

        const {selectedSchoolYear, selectedSemester, selectedClassLevel, selectedClassRoom, selectedSubject} = this.state;
        let schoolyear = '';
        if (selectedSchoolYear != null) {
            schoolyear = selectedSchoolYear.YearNumber;
            if (getCurrentLocale() == 'en' && selectedSchoolYear.YearNumberEn && selectedSchoolYear.YearNumberEn != '') {
                schoolyear = selectedSchoolYear.YearNumberEn;
            }
        }
        let semester = '';
        if (selectedSemester != null) {
            semester = selectedSemester.name;
        }

        let classlevel = '';
        if (selectedClassLevel != null) {
            if (getCurrentLocale() === 'th' && selectedClassLevel.NameTH && selectedClassLevel.NameTH !== '') {
                classlevel = selectedClassLevel.NameTH;
            } else if (getCurrentLocale() === 'en' && selectedClassLevel.NameEN && selectedClassLevel.NameEN !== '') {
                classlevel = selectedClassLevel.NameEN;
            } else {
                classlevel = selectedClassLevel.Value;
            }
        }
        let selclass = '';
        if (selectedClassRoom != null) {
            if (getCurrentLocale() === 'th' && selectedClassRoom.NameTH && selectedClassRoom.NameTH !== '') {
                selclass = selectedClassRoom.NameTH;
            } else if (getCurrentLocale() === 'en' && selectedClassRoom.NameEN && selectedClassRoom.NameEN !== '') {
                selclass = selectedClassRoom.NameEN;
            } else {
                selclass = selectedClassRoom.Value;
            }
        }

        const classLevelList = this.state.classLevelList.map(level => {
            if (getCurrentLocale() === 'th' && level.NameTH && level.NameTH !== '') {
                return {title: level.NameTH};
            } else if (getCurrentLocale() === 'en' && level.NameEN && level.NameEN !== '') {
                return {title: level.NameEN};
            }
            return {title: level.Value};
        });
        const classRoomList = this.state.classRoomList.map(classRoom => {
            if (getCurrentLocale() === 'th' && classRoom.NameTH && classRoom.NameTH !== '') {
                return {title: classRoom.NameTH};
            } else if (getCurrentLocale() === 'en' && classRoom.NameEN && classRoom.NameEN !== '') {
                return {title: classRoom.NameEN};
            }
            return {title: classRoom.Value};
        });

        let selsubject = "";
        if (selectedSubject != null) {
            selsubject = selectedSubject.ScheduleName;

            if (getCurrentLocale() == "en" && selectedSubject.ScheduleNameEN && selectedSubject.ScheduleNameEN != "") {
                selsubject = selectedSubject.ScheduleNameEN;
            }
        }

        return (
            <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
                <BackNavigationBar
                    title={translang.t('CHECK_IN_REPORT')}
                    onMenuTap={() => this.back()}
                />

                <View style={styles.container}>
                    <CustomSwitcher
                        dataList={options}
                        selectedIndex={this.state.tabIndex ?? 0}
                        onChangedSwitch={(index) => this.onChangeSwitcher(index)}
                        containerStyle={{marginHorizontal: 15, height: 50, marginTop: 20, marginBottom: 20,}}
                        radius={15}
                        textSize={23}
                    />
                    <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}}>
                        <TouchableOpacity onPress={this._onChangeSchoolYear} style={styles.bigContainer}
                                          activeOpacity={1}>
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <Text style={{...styles.title2}}>{translang.t('ACADEMIC_year2')}</Text>
                                <Text
                                    style={{...styles.selectValueText}}>{schoolyear ? schoolyear : translang.t('ACADEMIC_msg_selectyear')}</Text>
                            </View>
                            <View style={styles.bottomline}/>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this._onChangeSemester} style={styles.bigContainer}
                                          activeOpacity={1}>
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <Text style={{...styles.title2}}>{translang.t('ACADEMIC_semester')}</Text>
                                <Text
                                    style={{...styles.selectValueText}}>{semester ? semester : translang.t('ACADEMIC_msg_selectsemester')}</Text>
                            </View>
                            <View style={styles.bottomline}/>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.bigContainer} onPress={this._onChangeClassLevel}
                                          activeOpacity={1}>
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <Text style={{
                                    ...styles.title2,
                                    textAlign: 'center'
                                }}>{translang.t('BEHAVIOR_classlevel')}</Text>
                                <Text style={{...styles.selectValueText,}}>
                                    {classlevel ? classlevel : translang.t('BEHAVIOR_msg_selectclasslevel')}
                                </Text>
                            </View>
                            <View style={styles.bottomline}/>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this._onChangeClass} style={styles.bigContainer} activeOpacity={1}>
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <Text style={{
                                    ...styles.title2,
                                    textAlign: 'center'
                                }}>{translang.t('BEHAVIOR_class')}</Text>
                                <Text
                                    style={{...styles.selectValueText}}>{selclass ? selclass : translang.t('BEHAVIOR_msg_selectclass')}</Text>
                            </View>
                            <View style={styles.bottomline}/>
                        </TouchableOpacity>

                        {this.state.tabIndex == 1 &&
                        <TouchableOpacity onPress={this._onChangeSubject} style={styles.bigContainer} activeOpacity={1}>
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <Text style={{
                                    ...styles.title2,
                                    textAlign: 'center'
                                }}>{translang.t('BEHAVIOR_subject')}</Text>
                                <Text style={{...styles.selectValueText, color: '#666'}}>
                                    {selsubject ? selsubject : translang.t('BEHAVIOR_msg_selectsubject')}
                                </Text>
                            </View>
                            <View style={styles.bottomline}/>
                        </TouchableOpacity>}

                        <NextButton
                            label={translang.t('COMMON_next')}
                            containerStyle={styles.buttonStyle}
                            buttonStyle={{borderRadius: 40}}
                            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
                            isVerticalGradient={false}
                            _onPress={() => this.__next()}/>
                    </ScrollView>


                </View>

                <AlertWithImageModal
                    isVisible={this.state.showModal}
                    image={Images.n_ic_warning}
                    message={this.state.modalBody}
                    buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    isVerticalGradient={false}
                    onClose={() => {
                        this.setState({showModal: false})
                    }}
                />
                <SchoolYearModal
                    isVisible={this.state.showSchoolYearModal}
                    onSchoolYearSelect={this.onSchoolYearSelect}
                    listData={this.state.yearList}
                />

                <SemesterModal
                    isVisible={this.state.showSemesterModal}
                    onSemesterSelect={this.onSemesterSelect}
                    listData={this.state.termList}
                />

                <ClassLevelModal
                    isVisible={this.state.showClassLevelModal}
                    onListSelect={this.onClassLevelSelect}
                    listData={classLevelList}
                    dialogTtitle={translang.t('BEHAVIOR_classlevel')}
                />

                <ClassModal
                    isVisible={this.state.showClassModal}
                    onListSelect={this.onClassSelect}
                    listData={classRoomList}
                    dialogTtitle={translang.t('BEHAVIOR_class')}
                />

                <SubjectModal
                    isVisible={this.state.showSubjectModal}
                    onListSelect={this.onSubjectSelect}
                    listData={this.state.subjectList}
                    renderItem={this.renderSubjectListItem}
                    dialogTtitle={translang.t('BEHAVIOR_subject')}
                />
                <ProgressHud isVisible={this.state.isLoading}/>
            </SafeAreaView>
        );
    }
}

const styles = ScaledSheet.create({

    container: {
        flex: 1,
        backgroundColor: Color.n_background_white
    },

    bigContainer: {
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 20,
        marginVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 15,
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
        justifyContent: 'center',
        minHeight: 200,
    },

    title2: {
        fontFamily: 'THSarabunNew',
        fontSize: 30,
        fontWeight: 'bold',
        color: Color.n_default_orange,
        marginTop: 20,

    },
    selectValueText: {
        width: '100%',
        textAlign: 'center',
        fontFamily: 'THSarabunNew',
        fontSize: 28,
        color: Color.n_default_gray,
        position: 'absolute',
        bottom: 40,
    },

    buttonStyle: {
        width: 290,
        marginVertical: 30,
        marginLeft: 'auto',
        marginRight: 'auto',
    },

    bottomline: {
        height: 1,
        width: '100%',
        backgroundColor: Color.n_default_orange,
        position: 'absolute',
        bottom: 35,
    },

});
