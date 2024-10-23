import React from 'react';
import { View, BackHandler, TouchableOpacity, ImageBackground, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import BackNavigationBar from '../../components/BackNavigationBar';
import { ScrollView } from 'react-native-gesture-handler';
import CustomTextInput from '../../components/CustomTextInput';


export default class ClassAttendTakeAddSummaryScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classLevel: {},
      classRoom: {},
      subject: {},
      studentList: [],
      userInfo: null,
      isEdit: false,
      detail: "",
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

      const userInfo = this.props.navigation.getParam('userInfo');
      const studentList = this.props.navigation.getParam('studentList');
      const classLevel = this.props.navigation.getParam('classLevel');
      const classRoom = this.props.navigation.getParam('classRoom');
      const subject = this.props.navigation.getParam('subject');
      const isEdit = this.props.navigation.getParam('isEdit') ?? false;
      this.setState({ userInfo: userInfo, studentList: studentList, classLevel: classLevel, classRoom: classRoom, subject: subject, isEdit: isEdit, detail: ""});
    });
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
    global.onDrawerChanged = null;
  };

  onDrawerChanged = () => {
    this.setState({showClassModal: false, showClassLevelModal: false, showSubjectModal: false, selectedClassRoom: null, selectedClassLevel: null, selectedSubject: null, classRoomList: [], subjectList: []});
  };

  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.navigate('ClassAttendStudentList');
  };

  __next = async () => {
    const params = {
      userInfo: this.state.userInfo, 
      studentList: this.state.studentList, 
      classLevel: this.state.classLevel, 
      classRoom: this.state.classRoom, 
      subject: this.state.subject, 
      isEdit: this.state.isEdit, 
      detail: this.state.detail,
      parent: "ClassAttendAddSummary",
    };
    this.props.navigation.navigate('ClassAttendSummary', params);
    
  };


  render() {
    let subject = "";
    if(this.state.subject){
      subject = this.state.subject.scheduleName;
    }
    
    let room = "";
    if(this.state.classRoom){
      if(getCurrentLocale() == 'en'){ 
        room = this.state.classRoom.NameEN;
      }else if(getCurrentLocale() == 'th'){
        room = this.state.classRoom.NameTH;
      }
    }

    const date = moment().format('DD MMMM YYYY');
    const time = moment().format('HH:mm');
    

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_take_classattend')}
          onMenuTap={() => this.back()}
        />
        <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}}>
          <Text style={{...styles.title1, textAlign: 'center'}}>{translang.t('SAVE_AFTER_TEACHING')}</Text>
          <View style={styles.bigContainer}>
            <View style={styles.itemContainer}>
              <Text style={styles.title}>{translang.t('SUBJECT')}</Text>
              <Text style={styles.content}>{`: ${subject}`}</Text>
            </View>
            <View style={styles.itemContainer}>
              <Text style={styles.title}>{translang.t('DATE')}</Text>
              <Text style={styles.content}>{`: ${date}`}</Text>
            </View>
            <View style={styles.itemContainer}>
              <Text style={styles.title}>{translang.t('HOMEWORK_time')}</Text>
              <Text style={styles.content}>{`: ${time}`}</Text>
            </View>
            <View style={styles.itemContainer}>
              <Text style={styles.title}>{translang.t('HOMEWORK_class')}</Text>
              <Text style={styles.content}>{`: ${room}`}</Text>
            </View>

            <View style={{flex: 1, flexDirection: 'row'}}>
              <Text style={styles.title}>{translang.t('DETAIL')}</Text>
            </View>
            <CustomTextInput
              inputStyle={{
                borderWidth: 0,
                borderBottomWidth: 0,
                borderColor: Color.n_default_brown,
                fontSize: 25
              }}
              inputWrapperStyle={{
                marginBottom: 10,
                marginTop: 10,
                width: '100%',
                borderColor: Color.n_default_brown,
                borderBottomWidth: 1,
              }}
              multiline={true}
              placeholder={"Detail"}
              value={this.state.detail}
              placeholderTextColor={Color.n_text_placeholder_gray}
              onChangeText={text => this.setState({ detail: text })}
            />
          </View>
          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={styles.buttonStyle}
            buttonStyle={{ borderRadius: 40}}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />
        </ScrollView>
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
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 2,
    justifyContent: 'center',
  },

  buttonStyle:{
    width: 290,
    marginVertical:20,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  title1: {
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    marginTop: 20,
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  title: {
    width: 80,
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    fontWeight: 'bold',
    color: Color.n_default_orange,
  },
  content: {
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    color: Color.n_default_gray,
  },
});
