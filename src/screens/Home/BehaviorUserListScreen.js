import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, FlatList, } from 'react-native';
import { Right, Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import CustomRadioButtonItem from '../../components/CustomRadioButtonItem';
import _ from 'lodash';
import moment from 'moment';
import CustomTextSearch from '../../components/CustomTextSearch';

export default class BehaviorUserListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      selectedClassLevel: null,
      selectedClass: null,
      isSearching: false,
      searchKeyword: '',
      isReduce: false,
      studentList: [],
      classLevel: {},
      classRoom: {},
      userInfo: {},
      filteredStudentIndexs: [],
      searchVal: '',
      isRefresh: false,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidMount() {
    console.log("BehaviorUserListScreen");
    const { navigation } = this.props;
    this.init();

    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      console.log("BehaviorUserListScreen Focus", !this.state.classLevel);
      if(!this.state.classLevel){
        this.init();
      }

      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    });
  }

  init = () => {
    const userInfo = this.props.navigation.getParam('userInfo');
    const studentList = this.props.navigation.getParam('students');
    const classLevel = this.props.navigation.getParam('classLevel');
    const classRoom = this.props.navigation.getParam('classRoom');
    const isReduce = this.props.navigation.getParam('isReduce') ?? false;

    studentList.forEach(item=>{
      item.isExpand = item.BehaviorsHistory.length > 0;
      item.isSelected = false;
    });

    this.setState({ studentList: studentList, classLevel: classLevel, classRoom: classRoom, isReduce: isReduce, userInfo: userInfo, isRefresh: true,});
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

    // this.props.navigation.goBack();
    this.setState({isSearching: false, searchKeyword: '', searchVal: '', filteredStudentIndexs: [], classLevel:null,});

    if (this.state.isReduce) {
      this.props.navigation.navigate('BehaviorReduce');
    } else {
      this.props.navigation.navigate('BehaviorAdd');
    }

  };

  __next = async () => {
    const selectedStudent = this.state.studentList.filter(item=>item.isSelected && item.Student_State == '0');

    if (selectedStudent && selectedStudent.length > 0){
      const params = {
        classLevel: this.state.classLevel,
        classRoom: this.state.classRoom,
        students: selectedStudent,
        isReduce: this.state.isReduce,
        userInfo: this.state.userInfo,
        parent: 'BehaviorUserList',
        isRefresh: this.state.isRefresh,
      };
      this.setState({ isRefresh: false });
      this.props.navigation.navigate('BehaviorEdit', params);
    } else {
      this.setState({ showModal: true, modalBody: translang.t('BEHAVIOR_msg_select_student'), filteredStudentIndexs: [] });
    }
  };

  _onChangeSearchVal = (searchVal) => {
    let filteredIndexes = [];
    if (searchVal !== '') {
      this.state.studentList.forEach((data, index) => {
        const NameEN = data.FirstNameEN + "" + data.LastNameEN;
        const NameTH = data.FirstNameTH + "" + data.LastNameTH;
        const studentCode = data.StudentCode.toString();
        if (NameEN.toLowerCase().includes(searchVal.toLowerCase()) || NameTH.toLowerCase().includes(searchVal.toLowerCase()) || studentCode.includes(searchVal)) {
          filteredIndexes.push(index);
        }
      });
    }
    this.setState({searchVal: searchVal, searchKeyword: searchVal, filteredStudentIndexs: filteredIndexes});
  };

  onSelectItem = (item) => {
    const studentList = this.state.studentList;
    const index = studentList.findIndex(e=>e.StudentID == item.StudentID);
    studentList[index].isSelected = !studentList[index].isSelected;

    this.setState({ studentList: studentList });
  }

  onSelectAllItem = () => {
    const tmpStudentList = this.state.studentList;
    let isSelectedAll = true;

    const tmp = tmpStudentList.filter(item=>item.isSelected);
    if(tmp && tmp.length > 0){
      isSelectedAll = false;
    }
    if (this.state.searchKeyword !== '' || this.state.filteredStudentIndexs.length > 0) {
      if(isSelectedAll){
        this.state.filteredStudentIndexs.forEach(item=>{
          tmpStudentList[item].isSelected = true
        });
      }else{
        this.state.filteredStudentIndexs.forEach(item=>{
          tmpStudentList[item].isSelected = false
        });
      }
    }else{
      if(isSelectedAll){
        tmpStudentList.forEach(item=>{
          item.isSelected = true
        });
      }else{
        tmpStudentList.forEach(item=>{
          item.isSelected = false
        });
      }
    }
    this.setState({studentList: tmpStudentList});
  }


  onExpandItem = (item) => {
    let studentList = this.state.studentList
    const index = studentList.findIndex(e=>e.StudentID == item.StudentID)
    studentList[index].isExpand = !studentList[index].isExpand
    this.setState({ studentList });
  }

  rendeTodayBehaviors(item, index) {
    const behaviorData = item.BehaviorsHistory;
    var res = []
    if(behaviorData.length > 0){
      for(let i = 0; i < behaviorData.length; i++){
        const item = behaviorData[i];
        let score = item.Score ?? '';
        let themeColor = Color.n_button_gradient_green_start;
        if(item.BehaviorsType === '1'){
          themeColor = Color.n_default_orange;
          score = "-" + score;
        }
        let isToday = false;
        if(moment().diff(item.Day, 'day') == 0){
          isToday = true;
        }
        const behaviorsName = getCurrentLocale() === 'th' ? item.BehaviorsName : item.BehaviorsNameEN ?? item.BehaviorsName

        res.push(
          <>
            <View style={{backgroundColor: Color.n_background_white, padding: 20,}} key={i}>
              {isToday && <View style={{position: 'absolute', left: 10, top: 10, heigth: 30, borderRadius: 15, flexDirection:'row', justifyContent: 'center', alignItems: 'center', backgroundColor: Color.n_default_gray, paddingHorizontal: 5}}>
                <Text style={{...styles.behaviorDetailText, color: Color.white}}>{translang.t('TODAY_RECORD')}</Text>
              </View>}
              <Text style={{...styles.behaviorDetailText, textAlign: 'right', color: themeColor}}>{moment(item.Day).format('HH:mm')}</Text>
              <Text style={{...styles.behaviorDetailText, color: themeColor}}>
                {`${behaviorsName ?? ''}     ${score}`}
              </Text>
              <Text style={{...styles.behaviorDetailText, color: themeColor}}>{`by ${item.TheacherName ?? ''}`}</Text>
            </View>
            <View style={{height: 1, backgroundColor: Color.n_default_gray_light}} />
          </>
        );
      }
    }

    return res;
  }

  renderItem = (item, index) => {
    let student = item;
    let isSelected = item.isSelected;

    let firstName = student.FirstNameTH;
    let lastName = student.LastNameTH;
    if(getCurrentLocale() == "en" && student.FirstNameEN && student.FirstNameEN != ''){
      firstName = student.FirstNameEN;
      lastName = student.LastNameEN;
    }

    let profileImage = student.sex === '0' ? Images.man_user : Images.women_user;
    if (student.StudentPicture) {
      profileImage = {uri: student.StudentPicture};
    }
    let isExpand = false
    if(student.isExpand){
      isExpand = true
    }

    const enableState = student.Student_State == '0' ? true : false;

    if(enableState){
      return (
        <View style={styles.listItem} key = {index}>
          <TouchableOpacity style={{height: 130, flexDirection: 'row', flex: 1, alignItems: 'center', padding: 15, }}  onPress={() => this.onExpandItem(student)}>
            <Text style={styles.itemText}>{index + 1}.</Text>
            <Image source={profileImage} style={styles.itemAvatar}></Image>
            <View style={{flexDirection: 'column', flex: 1, justifyContent: 'space-around'}}>
              <Text style={styles.itemText}>{student.StudentCode}</Text>
              <Text style={styles.itemText}>{firstName}</Text>
              <Text style={styles.itemText}>{lastName}</Text>
            </View>
            <CustomRadioButtonItem
              isSelected={isSelected}
              selectedColor={this.state.isReduce ? Color.n_default_orange : Color.n_button_gradient_green_start}
              radioSize={30}
              onPress = {()=>{this.onSelectItem(student)}} />

          </TouchableOpacity>
          <View style={{height: 1, backgroundColor: Color.n_default_gray_light}} />
          {isExpand && <View>
            {this.rendeTodayBehaviors(student, index)}
          </View>}
        </View>
      );
    }else{
      return (
        <View style={{...styles.listItem, backgroundColor: Color.n_default_gray_light}} key = {index}>
          <View style={{height: 130, flexDirection: 'row', flex: 1, alignItems: 'center', padding: 15, }}>
            <Text style={styles.itemText}>{index + 1}.</Text>
            <Image source={profileImage} style={styles.itemAvatar}></Image>
            <View style={{flexDirection: 'column', flex: 1, justifyContent: 'space-around'}}>
              <Text style={styles.itemText}>{student.StudentCode}</Text>
              <Text style={styles.itemText}>{firstName}</Text>
              <Text style={styles.itemText}>{lastName}</Text>
            </View>
          </View>
        </View>
      );
    }
  };

  render() {
    const nextButtonColor = this.state.isReduce ? [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end] : [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]

    const { searchVal} = this.state;

    const {classRoom} = this.state;
    let StrclassName = ""

    if (getCurrentLocale() === 'th') {
      StrclassName = classRoom.NameTH;
    } else if (getCurrentLocale() === 'en') {
      StrclassName = classRoom.NameEN;
    } else {
      StrclassName = classRoom.Value;
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
          title={this.state.isReduce ? translang.t('DRAWER_reduce_behavior') : translang.t('DRAWER_add_behavior')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <Text style={styles.title}>{translang.t('BEHAVIOR_classlevel')}{": " + StrclassName}</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', height: 60, width: '100%', paddingHorizontal: 30,}}>
            <CustomTextSearch
              inputStyle={{
                borderColor: Color.n_default_brown,
                fontSize: 27
              }}
              inputWrapperStyle={{
                height: 50,
                flex: 1,
                borderRadius: 25,
                borderColor: Color.n_default_orange,
                borderWidth: 1
              }}
              value={searchVal}
              onChangeText={this._onChangeSearchVal}
              placeholder={translang.t('SEARCH_Placeholder_namestudent')}
              placeholderTextColor={Color.n_default_orange}

              clickSearch={()=>{

              }}
            />
            <TouchableOpacity
              style={{width: 37, height: 45, marginLeft: 30}}
              onPress={() => {this.onSelectAllItem();}}>
              <Image source={Images.n_ic_selectAll} style={{width: '100%', height: '100%', resizeMode: 'contain'}}></Image>
            </TouchableOpacity>

          </View>
          <FlatList
            style={styles.list}
            data={studentList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item, index)}
          />
          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={{width: '90%', marginLeft: 'auto', marginRight: 'auto', marginVertical: 15}}
            buttonStyle={{height: 75, borderRadius: 38 }}
            colors={nextButtonColor}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />
        </View>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => { this.setState({ showModal: false }) }}
        />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white
  },
  title: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  list: {
    flex: 1,
    marginTop: 30,
  },
  listItem: {
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
    marginVertical: 5,
    marginHorizontal: 10,
  },
  itemText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: Color.n_default_gray,
  },
  itemAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 8,
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

  behaviorDetailText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
  },
  flexButton: {
    width: 60,
    height: '100%',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    backgroundColor: Color.green_button_next_color2,
  },
  flexButtonText: {
    fontSize: 12,
    color: Color.n_background_white,
    textAlign: 'center'
  }
});
