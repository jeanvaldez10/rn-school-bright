import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ImageBackground, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Images from '../../themes/Images';
import translang from '../../utils/language.utils';
import CustomRadioButtonItem from '../../components/CustomRadioButtonItem';
import _ from 'lodash';

export default class SendIndividualUserListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: '',
      selectedIndexes: [],
      isSearching: false,
      searchKeyword: '',
      studentList: [],
      classLevel: {},
      classRoom: {},
      subject: {},
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const studentList = this.props.navigation.getParam('students');
    const classLevel = this.props.navigation.getParam('classLevel');
    const classRoom = this.props.navigation.getParam('classRoom');
    const subject = this.props.navigation.getParam('subject');

    this.setState({ studentList: studentList, classLevel: classLevel, classRoom: classRoom, subject: subject });
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
    if (this.state.isSearching) {
      this.setState({isSearching: false, searchKeyword: ''});
    } else {
      this.props.navigation.navigate('SendIndividual');
    }
  };

  __next = async () => {
    if (this.state.selectedIndexes.length === 0) {
      this.setState({ showModal: true, modalBody: translang.t('BEHAVIOR_msg_select_student') });
    } else {
      const students = this.state.selectedIndexes.map(index => this.state.studentList[index]);
      const params = { classLevel: this.state.classLevel, classRoom: this.state.classRoom, subject: this.state.subject, students: students, sendType: 1 };

      this.props.navigation.navigate('HomeworkFillInfo', params);
    }
  };

  onSelectItem = (index) => {
    let selectedIndexes = this.state.selectedIndexes;
    if (selectedIndexes.includes(index)) {
      selectedIndexes = _.without(selectedIndexes, index);
    } else {
      selectedIndexes.push(index);
    }
    this.setState({ selectedIndexes });
  }

  renderItem = (item, index) => {
    const isSelected = this.state.selectedIndexes.includes(index);

    // const student = this.state.studentList[index];
    const student = item;
    let name = student.studentnameEN.trim();
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

    return (
      <TouchableOpacity style={styles.listItem} onPress={() => this.onSelectItem(index)}>
        <Text style={styles.itemText}>{index + 1}.</Text>
        <Image source={profileImage} style={styles.itemAvatar}></Image>
        <View style={{flexDirection: 'column', flex: 1, height: '100%', justifyContent: 'space-around'}}>
          <Text style={styles.itemText}>{firstName}</Text>
          <Text style={styles.itemText}>{lastName}</Text>
        </View>
        <CustomRadioButtonItem isSelected={isSelected} />
      </TouchableOpacity>
    );
  };

  render() {
    const isSelectedAll = this.state.studentList.length === this.state.selectedIndexes.length;
    const headerText = this.state.classRoom.NameTH + ', ' + this.state.subject.plane_id + ' - ' + this.state.subject.scheduleName;

    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_add_behavior')}
          onMenuTap={() => this.back()}
          is_selectAll={!isSelectedAll}
          is_deselectAll={isSelectedAll}
          is_search={true}
          is_searching={this.state.isSearching}
          searchKeyword={this.state.searchKeyword}
          onSelectAllTap={() => {
            const indexes = this.state.studentList.map((value, index) => { return index });
            this.setState({selectedIndexes: indexes});
          }}
          onDeselectAllTap={() => {
            this.setState({selectedIndexes: []});
          }}
          onSearchTap={() => {
            this.setState({isSearching: true});
          }}
          onChangeSearchText={ text => {
            this.setState({searchKeyword: text});
          }}
        />

        <View style={styles.container}>

          <View style={styles.titleContainer}> 
            <Text style={styles.title}>{headerText}</Text>
          </View>
          <FlatList style={styles.list}
            data={this.state.studentList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(item, index)}
          />
          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={{ paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
            buttonStyle={{ borderRadius: 3 }}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.__next()} />
        </View>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.alert_inbox}
          message={this.state.modalBody}
          buttonColors={[Color.red_orange, Color.soft_red]}
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
  },
  titleContainer: {
    width: '100%',
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.bluegray,
  },
  title: {
    fontSize: 16,
    fontWeight: '300',
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row', 
    flex: 1, 
    alignItems: 'center', 
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginVertical: 5,
    marginHorizontal: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '300',
  },
  itemAvatar: {
    width: 70, 
    height: 70, 
    borderRadius: 35,
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
});
