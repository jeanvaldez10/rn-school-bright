import React from 'react';
import {Image, View, BackHandler, TouchableOpacity, ImageBackground, FlatList,} from 'react-native';
import {Col, Text} from 'native-base';
import {ScaledSheet} from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import ClassAttendanceStatusModal from '../../components/ClassAttendanceStatusModal';
import ProgressHud from '../../components/ProgressHud';
import Images from '../../themes/Images';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import {AttendanceStatusValueArray, AttendanceStatusMap, AttendanceStatusMapOneColor} from '../../constants/constants';
import CustomTextSearch from '../../components/CustomTextSearch';
import ApiManager from '../../managers/ApiManager';


export default class ClassAttendStudentListScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            showModal: false,
            showClassLevelModal: false,
            showClassModal: false,
            isStatusChangeModalVisible: false,
            isSearching: false,
            searchKeyword: '',
            shouldSetAll: false,
            studentList: [],
            classLevel: {},
            classRoom: {},
            subject: {},
            userInfo: null,
            selectedItemIndex: -1,
            isEdit: false,
            filteredStudentIndexs: [],
            selectedDate: null,
            searchVal: '',

            showNextButton: true,

            sendStudentList: [],
            fromTimetable: false,
        };
    }

    handleBackButton = () => {
        this.back();
        return true;
    };

    componentDidMount() {
        console.log("ClassAttendStudentList");
        const {navigation} = this.props;
        this.focusListener = navigation.addListener("didFocus", () => {
            if (this.backhandler) {
                this.backhandler.remove();
            }
            this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

            const userInfo = this.props.navigation.getParam('userInfo');
            const studentList = this.props.navigation.getParam('students');
            const classLevel = this.props.navigation.getParam('classLevel');
            const classRoom = this.props.navigation.getParam('classRoom');
            const subject = this.props.navigation.getParam('subject');
            const fromTimetable = this.props.navigation.getParam('fromTimetable') ?? false;

            const isEdit = this.props.navigation.getParam('isEdit');
            const selectedDate = this.props.navigation.getParam('selectedDate');

            studentList.forEach((item, index) => {
                if (item.scanstatus == "" || item.scanstatus == " " || item.scanstatus == "-1" || item.scanstatus == null || item.Student_State != 0) {
                    item.scanstatus = "99";
                }
            });

            let showNextButton = true;
            let showModal = false;
            let showModalMsg = "";

            if (isEdit) {
                const notEmptyTeacherStatus = studentList.filter(student => (student.teacherId != null && student.teacherId != ""));
                if (notEmptyTeacherStatus.length > 0) {
                    const validTeacherStatus = notEmptyTeacherStatus.filter(student => (student.teacherId != userInfo.ID));
                    if (validTeacherStatus.length > 0) {
                        const otherTeacherName = validTeacherStatus[0].teachername;
                        showModal = true;
                        showModalMsg = `${translang.t('NOT_PERMISSION_EDIT')}${otherTeacherName}`;
                        showNextButton = false;
                    }
                }
            }

            this.setState({
                showModal: showModal,
                modalBody: showModalMsg,
                showNextButton: showNextButton,
                userInfo: userInfo,
                studentList: studentList,
                classLevel: classLevel,
                classRoom: classRoom,
                subject: subject,
                isEdit: isEdit,
                selectedDate: selectedDate,
                filteredStudentIndexs: [],
                searchKeyword: '',
                sendStudentList: [],
                fromTimetable,
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

        if (this.state.isSearching) {
            this.setState({isSearching: false, searchKeyword: '', filteredStudentIndexs: []});
        } else {
            if(this.state.fromTimetable){
                this.props.navigation.navigate('Timetable');
            }
            else if (this.state.isEdit) {
                this.props.navigation.navigate('ClassAttendEdit');
            } else {
                this.props.navigation.navigate('ClassAttendTake');
            }
        }
    };

    __next = async () => {
        if (this.state.isSearching) {
            this.setState({isSearching: false, searchKeyword: '', filteredStudentIndexs: []});
            return;
        }

        const validStatusStudents = this.state.studentList.filter(student => (student.scanstatus && student.scanstatus !== '' && student.scanstatus !== '99'));
        if (validStatusStudents.length === 0) {
            this.setState({showModal: true, modalBody: translang.t('SELECT_STATUS_AT_LEAST_ONE_PERSON')});
            return;
        }

        const params = {
            userInfo: this.state.userInfo,
            studentList: this.state.studentList,
            classLevel: this.state.classLevel,
            classRoom: this.state.classRoom,
            subject: this.state.subject,
            isEdit: this.state.isEdit,
            detail: "",
            parent: "ClassAttendStudentList",
            selectedDate: this.state.selectedDate,
            sendStudentList: this.state.sendStudentList
        };
        this.props.navigation.navigate('ClassAttendSummary', params);


        // if(this.state.isEdit){
        //   const params = {
        //     userInfo: this.state.userInfo,
        //     studentList: this.state.studentList,
        //     classLevel: this.state.classLevel,
        //     classRoom: this.state.classRoom,
        //     subject: this.state.subject,
        //     isEdit: this.state.isEdit,
        //     detail: "",
        //     parent: "ClassAttendStudentList",
        //   };
        //   this.props.navigation.navigate('ClassAttendSummary', params);
        // }else{
        //   const params = {
        //     userInfo: this.state.userInfo,
        //     studentList: this.state.studentList,
        //     classLevel: this.state.classLevel,
        //     classRoom: this.state.classRoom,
        //     subject: this.state.subject,
        //     isEdit: this.state.isEdit
        //   };
        //   this.props.navigation.navigate('ClassAttendAddSummary', params);
        // }


    };

    onTapCopy = () => {
        this.setState({isLoading: true});
        const schoolid = this.state.userInfo.SchoolID;
        const level2 = this.state.classRoom.ID;
        const scheduleId = this.state.subject.scheduleId;
        const teacherid = this.state.userInfo.ID;

        // const schoolid = "849";
        // const level2 = "21018";
        // const scheduleId = "1021196";
        // const teacherid = "423381";

        ApiManager.getStudentInClassForClassAttendanceCopy(schoolid, level2, scheduleId, teacherid).then(students => {
            if (students.Status) {
                if (students.Status != "-1" && students.Student && students.Student.length > 0) {
                    const studentList = students.Student
                    const temp1 = [];
                    studentList.forEach((item, index) => {
                        if (item.scanstatus == "" || item.scanstatus == " " || item.scanstatus == "-1" || item.scanstatus == null || item.Student_State != 0) {
                            item.scanstatus = "99";
                        } else {
                            temp1.push({UserId: item.UserId, scanstatus: item.scanstatus});
                        }
                    });
                    this.setState({studentList: studentList, isLoading: false, sendStudentList: temp1});
                } else {
                    this.setState({isLoading: false, showModal: true, modalBody: translang.t('NO_DATA')});
                }
            } else {
                if (students.length > 0) {
                    const studentList = students[0].Student
                    const temp2 = [];
                    studentList.forEach((item, index) => {
                        if (item.scanstatus == "" || item.scanstatus == " " || item.scanstatus == "-1" || item.scanstatus == null || item.Student_State != 0) {
                            item.scanstatus = "99";
                        } else {
                            temp2.push({UserId: item.UserId, scanstatus: item.scanstatus});
                        }
                    });
                    this.setState({studentList: studentList, isLoading: false, sendStudentList: temp2});
                } else {
                    this.setState({isLoading: false, showModal: true, modalBody: translang.t('NO_DATA')});
                }

            }
        }).catch(error => {
            console.log(error);
            this.setState({isLoading: false});
        })
    }

    onSelectItem = (index) => {
        this.setState({isStatusChangeModalVisible: true, selectedItemIndex: index, shouldSetAll: false});
    }

    onChangeScanStatus = (status) => {
        const shouldSetAll = this.state.shouldSetAll;
        const selectedIndex = this.state.selectedItemIndex;

        let tempSStudentL = this.state.sendStudentList;
        // return {UserId: student.UserId, scanstatus: student.scanstatus};

        if (shouldSetAll) {
            if (this.state.searchKeyword !== '' || this.state.filteredStudentIndexs.length > 0) {
                this.state.filteredStudentIndexs.forEach(index => {
                    if (this.state.studentList[index].Student_State != 0 || this.state.studentList[index].authorized == false) {
                        // this.state.studentList[index].scanstatus = "99";
                    } else {
                        this.state.studentList[index].scanstatus = status.toString();

                        tempSStudentL = tempSStudentL.filter(item => item.UserId != this.state.studentList[index].UserId);
                        tempSStudentL.push({
                            UserId: this.state.studentList[index].UserId,
                            scanstatus: status.toString()
                        });
                    }
                })
            } else {
                this.state.studentList.forEach(student => {
                    if (student.Student_State != 0 || student.authorized == false) {
                        // student.scanstatus = "99";
                    } else {
                        student.scanstatus = status.toString();

                        tempSStudentL = tempSStudentL.filter(item => item.UserId != student.UserId);
                        tempSStudentL.push({UserId: student.UserId, scanstatus: status.toString()});
                    }
                });
            }
        } else {
            if (this.state.searchKeyword !== '' || this.state.filteredStudentIndexs.length > 0) {
                if (selectedIndex < this.state.filteredStudentIndexs.length) {
                    const index = this.state.filteredStudentIndexs[selectedIndex];
                    this.state.studentList[index].scanstatus = status.toString();

                    tempSStudentL = tempSStudentL.filter(item => item.UserId != this.state.studentList[index].UserId);
                    tempSStudentL.push({UserId: this.state.studentList[index].UserId, scanstatus: status.toString()});
                }
            } else {
                if (selectedIndex < this.state.studentList.length) {
                    this.state.studentList[selectedIndex].scanstatus = status.toString();

                    tempSStudentL = tempSStudentL.filter(item => item.UserId != this.state.studentList[selectedIndex].UserId);
                    tempSStudentL.push({
                        UserId: this.state.studentList[selectedIndex].UserId,
                        scanstatus: status.toString()
                    });
                }
            }
        }

        this.setState({
            isStatusChangeModalVisible: false,
            selectedItemIndex: -1,
            shouldSetAll: false,
            sendStudentList: tempSStudentL
        });
    }

    _onChangeSearchVal = (searchVal) => {
        let filteredIndexes = [];
        if (searchVal !== '') {
            this.state.studentList.forEach((data, index) => {
                let studentNameEn = data.FirstNameEN + " " + data.LastNameEN;
                let studentNameTh = data.FirstNameTH + " " + data.LastNameTH;
                let studentCode = data.studentCode ?? "";

                if (studentNameEn.toLowerCase().includes(searchVal.toLowerCase()) || studentNameTh.toLowerCase().includes(searchVal.toLowerCase()) || studentCode.includes(searchVal.toLowerCase())) {
                    filteredIndexes.push(index);
                }
            });
        }
        this.setState({searchVal: searchVal, searchKeyword: searchVal, filteredStudentIndexs: filteredIndexes});
    };

    renderItem = (index) => {
        let student = {};

        if (this.state.searchKeyword !== '' || this.state.filteredStudentIndexs.length > 0) {
            const _index = this.state.filteredStudentIndexs[index];
            student = this.state.studentList[_index];
        } else {
            student = this.state.studentList[index];
        }

        let scanStatus = -1;

        if (student.scanstatus && student.scanstatus !== "") {
            scanStatus = parseInt(student.scanstatus);
        }

        if (student.scanstatus && student.scanstatus !== "") {
            scanStatus = parseInt(student.scanstatus);
        }

        if (!AttendanceStatusValueArray.includes(parseInt(scanStatus))) {
            scanStatus = -1;
        }
        let firstName = student.FirstNameTH;
        let lastName = student.LastNameTH;

        if (getCurrentLocale() == "en" && student.FirstNameEN && student.FirstNameEN != '') {
            firstName = student.FirstNameEN;
            lastName = student.LastNameEN;
        }
        const AttendanceStatusTitle = {
            '0': {title: translang.t('ATTENDANCE_STATUS_on_time')},
            '1': {title: translang.t('ATTENDANCE_STATUS_late')},
            '3': {title: translang.t('ATTENDANCE_STATUS_absence')},
            '4': {title: translang.t('ATTENDANCE_STATUS_personal_leave')},
            '5': {title: translang.t('ATTENDANCE_STATUS_sick_leave')},
            '6': {title: translang.t('ATTENDANCE_STATUS_event')},
            '-1': {title: translang.t('ATTENDANCE_STATUS_undefined')},
            '99': {title: translang.t('ATTENDANCE_STATUS_undefined')}
        };
        const stateColors = AttendanceStatusMapOneColor[scanStatus].color;
        const stateTitle = AttendanceStatusTitle[scanStatus].title;

        const AttendanceCheckInStatusTitle = {
            '0': {title: translang.t('ATTENDANCE_STATUS_on_time')},
            '1': {title: translang.t('ATTENDANCE_STATUS_late')},
            '3': {title: translang.t('ATTENDANCE_STATUS_absence')},
            '6': {title: translang.t('ATTENDANCE_STATUS_holiday')},
            '8': {title: translang.t('ATTENDANCE_STATUS_holiday')},
            '9': {title: translang.t('ATTENDANCE_STATUS_holiday')},
            '10': {title: translang.t('ATTENDANCE_STATUS_personal_leave')},
            '11': {title: translang.t('ATTENDANCE_STATUS_sick_leave')},
            '12': {title: translang.t('ATTENDANCE_STATUS_event')},
            '-1': {title: translang.t('ATTENDANCE_STATUS_undefined')},
            '99': {title: translang.t('ATTENDANCE_STATUS_undefined')}
        };

        const come2school_status = student.come2school_status ?? -1;
        try {
            const checkInLabel1 = AttendanceCheckInStatusTitle[come2school_status].title;
            const checkInColor1 = AttendanceStatusMapOneColor[come2school_status].color;
        } catch (e) {
            console.log(student);
            console.log(e);
        }

        const checkInLabel = AttendanceCheckInStatusTitle[come2school_status].title;
        const checkInColor = AttendanceStatusMapOneColor[come2school_status].color;


        let profileImage = student.sex === '0' ? Images.man_user : Images.women_user;
        if (student.pic) {
            profileImage = {uri: student.pic};
        }

        const AttendanceStateTitle = {
            '0': {title: translang.t('STUDY')},
            '1': {title: translang.t('DISPUTE')},
            '2': {title: translang.t('RESIGNED')},
            '3': {title: translang.t('DROPPED')},
            '4': {title: translang.t('GRADUATED')},
            '5': {title: translang.t('LOSE_CONTACT_WITH')},
            '6': {title: translang.t('RETIRED'),},
            '7': {title: translang.t('EXCHANGE_STUDENT')},
            '-1': {title: translang.t('UNDEFINED')},
            '99': {title: translang.t('UNDEFINED')},
        };
        let enableState = student.Student_State == '0' ? true : false;
        let stateLabel = AttendanceStateTitle[student.Student_State].title;

        if (student.authorized == false) {
            enableState = false;
            stateLabel = stateTitle;
        }

        if (enableState) {
            return (
                <TouchableOpacity style={styles.listItem} onPress={() => this.onSelectItem(index)}>
                    <Text style={styles.itemText}>{index + 1}.</Text>
                    <Image source={profileImage} style={styles.itemAvatar}></Image>
                    <View style={{
                        flexDirection: 'column',
                        flex: 1,
                        height: '100%',
                        justifyContent: 'space-around',
                        marginLeft: 15,
                    }}>
                        <Text style={styles.itemText}>{student.studentCode}</Text>
                        <Text style={styles.itemText}>{firstName}</Text>
                        <Text style={styles.itemText}>{lastName}</Text>
                    </View>
                    <View style={{...styles.statusCircle, backgroundColor: checkInColor}}>
                        <Text style={styles.statusText}>{checkInLabel}</Text>
                    </View>
                    <View style={{...styles.statusCircle, backgroundColor: stateColors}}>
                        <Text style={styles.statusText}>{stateTitle}</Text>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return (
                <View style={{...styles.listItem, backgroundColor: Color.n_default_gray_light}}>
                    <Text style={styles.itemText}>{index + 1}.</Text>
                    <Image source={profileImage} style={styles.itemAvatar}></Image>
                    <View style={{
                        flexDirection: 'column',
                        flex: 1,
                        height: '100%',
                        justifyContent: 'space-around',
                        marginLeft: 15,
                    }}>
                        <Text style={styles.itemText}>{student.studentCode}</Text>
                        <Text style={styles.itemText}>{firstName}</Text>
                        <Text style={styles.itemText}>{lastName}</Text>
                    </View>
                    <View style={{...styles.statusCircle, backgroundColor: stateColors}}>
                        <Text style={styles.statusText}>{stateLabel}</Text>
                    </View>
                </View>
            );
        }

    };

    render() {
        const {searchVal} = this.state;
        const {classLevel, classRoom} = this.state;

        // let STRclasslevel = '';
        // if (classLevel != null) {
        //     if (getCurrentLocale() == 'en')
        //         STRclasslevel = classLevel.NameEN;
        //     if (getCurrentLocale() == 'th')
        //         STRclasslevel = classLevel.NameTH;
        // }

        let STRselclass = '';
        if (classRoom != null) {
            if (getCurrentLocale() == 'en')
                STRselclass = classRoom.NameEN;
            if (getCurrentLocale() == 'th')
                STRselclass = classRoom.NameTH;
        }

        let studentList = [];
        if (this.state.searchKeyword !== '' || this.state.filteredStudentIndexs.length > 0) {
            studentList = this.state.filteredStudentIndexs.map(index => this.state.studentList[index]);
        } else {
            studentList = this.state.studentList;
        }

        return (
            <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
                <BackNavigationBar
                    title={this.state.isEdit ? translang.t('DRAWER_edit_classattend') : translang.t('DRAWER_take_classattend')}
                    onMenuTap={() => this.back()}
                    is_copy={true}
                    onCopyTap={() => this.onTapCopy()}
                />

                <View style={styles.container}>
                    {this.state.isEdit &&
                    <View style={{height: 40, backgroundColor: Color.n_default_orange, justifyContent: 'center'}}>
                        <Text style={styles.titleDate}>{this.state.selectedDate.format('DD MMMM YYYY')}</Text>
                    </View>
                    }

                    <View style={{
                        ...styles.listItem1,
                        justifyContent: 'space-between',
                        paddingHorizontal: 16,
                        height: 'auto'
                    }}>
                        <View style={{marginTop: 10, marginBottom: 10}}>
                            <Text style={{
                                ...styles.title,
                                marginHorizontal: 0
                            }}>{translang.t('BEHAVIOR_class')} : {STRselclass}</Text>
                            <Text style={{
                                ...styles.title,
                                marginHorizontal: 0
                            }}>{translang.t('BEHAVIOR_subject')} : {this.state.subject.scheduleName}</Text>
                        </View>
                        <TouchableOpacity style={{width: 37, height: 45}} onPress={() => {
                            this.setState({
                                isStatusChangeModalVisible: true,
                                selectedItemIndex: -1,
                                shouldSetAll: true
                            });
                        }}>
                            <Image source={Images.n_ic_selectAll}
                                   style={{width: '100%', height: '100%', resizeMode: 'contain'}}></Image>
                        </TouchableOpacity>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                        paddingHorizontal: 15
                    }}>
                        <CustomTextSearch
                            inputWrapperStyle={styles.inputWrapperStyle}
                            value={searchVal}
                            onChangeText={this._onChangeSearchVal}
                            inputStyle={{fontSize: 27}}
                            placeholder={translang.t('SEARCH_Placeholder_namestudent')}
                            placeholderTextColor={Color.n_default_orange}
                            clickSearch={() => {
                            }}
                        />
                        <View style={styles.labelText}>
                            <Text style={styles.labelText1}>
                                {translang.t('ONLINE_CHECKIN')}
                            </Text>
                        </View>
                        <View style={styles.labelText}>
                            <Text style={styles.labelText1}>
                                {translang.t('ONLINE_SUBJECT')}
                            </Text>
                        </View>
                    </View>

                    {this.state.studentList.length > 0 &&
                    <FlatList style={styles.list}
                              data={studentList}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={({item, index}) => this.renderItem(index)}
                    />
                    }
                    {this.state.studentList.length === 0 &&
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={styles.emptyText}>{translang.t('BEHAVIOR_nolist')}</Text>
                    </View>
                    }
                    <NextButton
                        label={translang.t('COMMON_next')}
                        containerStyle={{width: '90%', marginLeft: 'auto', marginRight: 'auto', marginVertical: 15}}
                        buttonStyle={{height: 75, borderRadius: 38}}
                        colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
                        isVerticalGradient={false}
                        _onPress={() => this.__next()}/>
                </View>

                <AlertWithImageModal
                    isVisible={this.state.showModal}
                    image={Images.alert_inbox}
                    message={this.state.modalBody}
                    buttonColors={[Color.red_orange, Color.soft_red]}
                    isVerticalGradient={false}
                    onClose={() => {
                        this.setState({showModal: false})
                    }}
                />
                <ClassAttendanceStatusModal
                    isVisible={this.state.isStatusChangeModalVisible}
                    onSelect={this.onChangeScanStatus}
                    onCan={() => this.setState({isStatusChangeModalVisible: false})}
                />
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
    titleContainer: {
        width: '100%',
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Color.bluegray,
    },
    title: {
        fontFamily: 'THSarabunNew',
        fontSize: 24,
        fontWeight: 'bold',
        color: Color.n_default_orange,
        marginHorizontal: 20,
    },
    list: {
        flex: 1,
    },
    listItem: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
        marginVertical: 10,
        marginHorizontal: 15,
        paddingLeft: 10,
    },
    listItem1: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
        marginVertical: 10,
        marginHorizontal: 15,
        paddingLeft: 10,
    },
    itemText: {
        fontSize: 24,
        fontFamily: 'THSarabunNew',
        color: Color.n_default_gray
    },
    itemAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginHorizontal: 8,
    },
    statusCircle: {
        width: 60,
        height: '90%',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 4,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '300',
        color: Color.white,
        textAlign: 'center',
    },
    buttonStyle: {
        width: '100%',
        height: 60,
        borderRadius: 5,
        backgroundColor: Color.green_button_next_color1,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
    },

    emptyText: {
        fontSize: 30,
        fontWeight: 'bold',
        fontFamily: 'THSarabunNew',
        color: Color.n_default_gray,
    },
    titleDate: {
        fontFamily: 'THSarabunNew',
        fontSize: 22,
        fontWeight: 'bold',
        color: Color.white,
        textAlign: 'center',
    },
    labelText: {
        height: 50,
        alignContent: 'center',
        justifyContent: 'center',
        width: 60,
        borderRadius: 10,
        borderColor: Color.n_default_orange,
        borderWidth: 1,
        marginHorizontal: 4
    },
    labelText1: {
        fontSize: 9,
        color: Color.n_default_orange,
        textAlign: 'center'
    },
    inputWrapperStyle: {
      height: 50,
      flex: 1,
      borderRadius: 25,
      borderColor: Color.n_default_orange,
      borderWidth: 1
    }
});
