import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import _ from 'lodash';

import CustomTextSearch from '../../components/CustomTextSearch';

export default class ReportTeacherStudentLeaveStudentListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalBody: '',
      selectedClassLevel: null,
      selectedClass: null,
      selectedYear: null,
      selectedSemester: null,
      searchKeyword: '',
      studentList: [],
      userInfo: {},
      filteredStudent: [],
      searchVal: ''
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const year = this.props.navigation.getParam('year');
      const semester = this.props.navigation.getParam('semester');
      const classLevel = this.props.navigation.getParam('classLevel');
      const classRoom = this.props.navigation.getParam('classRoom');
      const userInfo = this.props.navigation.getParam('userInfo');
      const students = this.props.navigation.getParam('students');

      this.setState({ selectedClassLevel: classLevel, selectedClass: classRoom, selectedYear: year, selectedSemester: semester, studentList: students, userInfo: userInfo, filteredStudent: students });  
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

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.navigate('ReportTeacherStudentLeave');
  };

  _onChangeSearchVal = (searchVal) => {
    let filtered = [];
    if (searchVal !== '') {
      this.state.studentList.forEach((data, index) => {
        if(getCurrentLocale() == 'en'){
          if(data.studentnameEN){
            if (data.studentnameEN.toLowerCase().includes(searchVal.toLowerCase())) {
              filtered.push(data);
            }
          }
        }else{
          if(data.studentname){
            if (data.studentname.includes(searchVal.toLowerCase())) {
              filtered.push(index);
            }
          }
        }
      });
    }else{
      filtered = this.state.studentList;
    }
    this.setState({searchVal, searchKeyword: searchVal, filteredStudent: filtered});
    
  };

  onSelectItem = (item) => {
    const params = {
      type: 'teacherstudent',
      userInfo: this.state.userInfo,
      selId: item.studentid,
      year: this.state.selectedYear,
      semester: this.state.selectedSemester,
      classlevel: this.state.selectedClassLevel,
      classroom: this.state.selectedClass,
      parent: 'ReportTeacherStudentLeaveStudentList',
    };
    
    this.props.navigation.navigate('ReportTeacherStudentLeaveList', params);
  }
  
  renderItem = (item, index) => {
    let student = {};
    student = item;

    let name = ""
    if(getCurrentLocale() == 'en')
      name = student.studentnameEN.trim();

    if (name === '') {
      name = student.studentname.trim();
    }
    const nameArray = name.split(' ');
    let firstName = '';
    let lastName = '';
    if (nameArray.length > 0) {
      firstName = nameArray[0];
    }
    if (nameArray.length > 1) {
      lastName = nameArray[nameArray.length - 1];
    }
    let profileImage = student.sex === '0' ? Images.man_user : Images.women_user;
    if (student.pic) {
      profileImage = {uri: student.pic};
    }

    let isExpand = false
    if(student.isExpand){
      isExpand = true
    }

    return (
      <View style={styles.listItem}>
        <TouchableOpacity style={{height: 130, flexDirection: 'row', flex: 1, alignItems: 'center', padding: 15, }}  onPress={() => this.onSelectItem(index)}>
          <Text style={styles.itemText}>{index + 1}.</Text>
          <Image source={profileImage} style={styles.itemAvatar}></Image>
          <View style={{flexDirection: 'column', flex: 1, justifyContent: 'space-around'}}>
            <Text style={styles.itemText}>{student.studentid}</Text>
            <Text style={styles.itemText}>{firstName}</Text>
            <Text style={styles.itemText}>{lastName}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    const { searchVal, selectedClass} = this.state;

    let StrclassName = ""
    if(selectedClass != null){
      if (getCurrentLocale() === 'th') {
        StrclassName = selectedClass.NameTH;
      } else if (getCurrentLocale() === 'en') {
        StrclassName = selectedClass.NameEN;
      } else {
        StrclassName = selectedClass.NameTH;
      }
    }
    
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_leave')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <Text style={styles.title}>{translang.t('BEHAVIOR_classlevel')}{": " + StrclassName}</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', height: 60, width: '100%', paddingHorizontal: 30,}}>
            <CustomTextSearch
              inputWrapperStyle={{
                height: 50,
                flex: 1,
                borderRadius: 25,
                borderColor: Color.n_default_orange,
                borderWidth: 1
              }}
              value={searchVal}
              onChangeText={this._onChangeSearchVal}
              inputStyle={{ fontSize: 27 }}
              placeholder={translang.t('SEARCH_Placeholder_namestudent')}
              placeholderTextColor={Color.n_default_orange}

              clickSearch={()=>{
                
              }}
            />
          </View>
          <FlatList style={styles.list}
            data={this.state.filteredStudent}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item, index)}
          />
        </View>
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
});
