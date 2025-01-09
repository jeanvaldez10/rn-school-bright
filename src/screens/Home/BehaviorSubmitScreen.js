import React from 'react';
import {Image, View, BackHandler, TouchableOpacity, ScrollView, FlatList} from 'react-native';
import {Text} from 'native-base';
import {ScaledSheet} from 'react-native-size-matters';
import IconInfoItem_OneLine from '../../components/IconInfoItem_OneLine';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Images from '../../themes/Images';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import ApiManager from '../../managers/ApiManager';
import Storage from '../../managers/StorageManager';
import _ from 'lodash';

export default class BehaviorSubmitScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: '',
      studentList: [],
      classLevel: {},
      classRoom: {},
      scores: [],
      isReduce: false,
      attachedImages: [],
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    console.log("BehaviorSubmitScreen");
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
      const scores = this.props.navigation.getParam('scores');
      const isReduce = this.props.navigation.getParam('isReduce') ?? false;
      const attachedImages = this.props.navigation.getParam('attachedImages');

      this.setState({
        userInfo: userInfo,
        studentList: studentList,
        classLevel: classLevel,
        classRoom: classRoom,
        scores: scores,
        isReduce: isReduce,
        attachedImages: attachedImages
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
    const parentRoute = this.props.navigation.getParam('parent') ?? 'BehaviorEdit';
    console.log(parentRoute);
    this.props.navigation.navigate(parentRoute, {isRefresh: false});
  };

  __next = async () => {
    const studentIds = this.state.studentList.map(student => student.StudentID);
    // const behaviorIds = this.state.scores.map(score => score.BehaviorsId);

    this.setState({isLoading: true});

    let score_data = await Promise.all(this.state.scores.map(async item => {
      let fileUploads = [];
      if (item.attachedImages) {
        fileUploads = await Promise.all(item.attachedImages.map(async item1 => {
          console.log("item1", item1);
          const res = await ApiManager.uploadImage('Behavior', this.state.userInfo.SchoolID, item1);
          console.log("res", res[0]);
          return res[0]
        }));
      }
      return {
        BehaviorsId: item.BehaviorsId,
        Note: item.Note,
        fileUploads: fileUploads
      };
    }));

    const param = {
      studentId: studentIds,
      behaviorDatas: score_data
    };

    ApiManager.updateStudentBehaviorScoreV2(this.state.userInfo.SchoolID, this.state.userInfo.ID, param).then(result => {
      if (result === 1) {
        this.setState({isLoading: false, showModal: true, modalBody: translang.t('COMPLETED')});
      } else if (result === -1) {
        this.setState({
          isLoading: false,
          showModal: true,
          modalBody: translang.t('SCHOOL_HOLIDAY_CANNOT_TRANSACTION')
        });
      } else {

        this.setState({isLoading: false, showModal: true, modalBody: translang.t('ERROR_OCCURED_TRY_AGAIN')});
      }
    }).catch(error => {
      console.log(error);
      this.setState({isLoading: false});
    })
  };

  renderUserItem = (item, index) => {
    let student = this.state.studentList[index];
    let name = student.FirstNameTH + " " + student.LastNameTH;

    if (getCurrentLocale() == "en" && student.FirstNameEN && student.FirstNameEN != '') {
      name = student.FirstNameEN + " " + student.LastNameEN;
    }


    // let name = (student.StudentName ?? '').trim();

    let profileImage = Images.man_user;
    if (student.StudentPicture && student.StudentPicture != "") {
      profileImage = {uri: student.StudentPicture};
    }

    return (
      <View style={styles.listItem} key={`user_${index}`}>
        <Text style={styles.itemText}>{index + 1}.</Text>
        <Image source={profileImage} style={styles.itemAvatar}></Image>
        <View style={{flexDirection: 'column', flex: 1, height: '100%', justifyContent: 'space-around'}}>
          <Text style={styles.itemText}>{name}</Text>
        </View>
      </View>
    );
  };

  renderScoreItem = (index) => {
    const scores = this.state.scores;
    const score = scores[index];
    const attachedImages = score.attachedImages ?? [];
    const note = score.Note ?? '';
    return (
      <View key={`scores_${index}`}>
        <View style={{
          ...styles.listItem,
          alignItems: 'flex-start',
          marginVertical: 3,
          borderBottomWidth: 1,
          borderBottomColor: Color.light_gray,
        }}>
          <Text style={{...styles.itemTextNo, width: 30}}>{index + 1}.</Text>
          <Text style={{...styles.itemTextName, flex: 1}}>
            {getCurrentLocale() === 'th' ? score.BehaviorsName : score.BehaviorsNameEN ?? score.BehaviorsName}
          </Text>
          <Text
            style={[styles.itemTextScore, this.state.isReduce ? {color: Color.n_default_orange} : {color: Color.n_button_gradient_green_start}, {marginLeft: 5}]}>{this.state.isReduce ? `-${score.Score}` : `+${score.Score}`}</Text>
        </View>
        {note !== '' &&
        <View style={styles.sectionContainer1}>
          <Text style={styles.noteText}>{translang.t('Note')}:{score.Note}</Text>
        </View>
        }
        {attachedImages.length > 0 &&
        <View style={{...styles.sectionContainer1, height: 80, marginBottom: 30,}}>
          <FlatList
            style={{flex: 0}}
            data={attachedImages}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={this.ItemSeparatorView}
            renderItem={({item, index}) => this.renderAttachImages(item, index)}
            horizontal
          />
        </View>
        }
      </View>
    );
  };

  renderAttachImages = (item, index) => {
    return (
      <View style={{marginHorizontal: 3, position: 'relative'}}>
        <Image style={{width: 120, height: 80}} source={{uri: item.uri}}/>
      </View>
    )
  }

  render() {
    let totalScore = 0;

    this.state.scores.map(score => {
      totalScore += score.Score;
    });

    // const buttonColor = this.state.isReduce ? [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end] : [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]
    const buttonColor = [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end];
    const totalScoreColor = this.state.isReduce ? Color.n_default_orange : Color.n_button_gradient_green_start;
    const alertImage = this.state.modalBody === translang.t('COMPLETED') ? Images.checked : Images.n_ic_warning;
    const alertButtonColor = this.state.modalBody !== translang.t('COMPLETED') ? [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end] : [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end];

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={this.state.isReduce ? translang.t('DRAWER_reduce_behavior') : translang.t('DRAWER_add_behavior')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <ScrollView style={styles.list}>
            <IconInfoItem_OneLine
              style={[styles.sectionHeader, this.state.isReduce ? {backgroundColor: Color.n_default_orange} : {backgroundColor: Color.n_button_gradient_green_start}]}
              topTextStyle={styles.sectionHeaderTitle}
              icon_mark={Images.n_ic_user_white}
              radiussize={0}
              imageSize={15}
              label={translang.t('BEHAVIOR_list_of_name')}
            />
            <View style={styles.sectionContainer}>
              {this.state.studentList.map((value, index) => {
                return this.renderUserItem(value, index);
              })
              }
            </View>
            <IconInfoItem_OneLine
              style={[styles.sectionHeader, this.state.isReduce ? {backgroundColor: Color.n_default_orange} : {backgroundColor: Color.n_button_gradient_green_start}]}
              topTextStyle={styles.sectionHeaderTitle}
              icon_mark={Images.n_ic_pencil_white}
              label={translang.t('BEHAVIOR_behavior_score')}
              radiussize={0}
              imageSize={15}
            />
            <View style={styles.sectionContainer}>
              {this.state.scores.map((value, index) => {
                return this.renderScoreItem(index);
              })
              }
              <View style={{height: 1, width: '100%', backgroundColor: totalScoreColor}}/>
              <View style={{...styles.listItem, marginVertical: 10}}>
                <Text style={{
                  ...styles.itemTextScore,
                  color: totalScoreColor,
                  marginRight: 30,
                }}>{translang.t('BEHAVIOR_total')}</Text>
                <Text style={{
                  ...styles.itemTextScore,
                  color: totalScoreColor
                }}>{this.state.isReduce ? `-${totalScore}` : `+${totalScore}`}</Text>
              </View>
            </View>

            {this.state.attachedImages.length > 0 && <>
              <IconInfoItem_OneLine
                style={[styles.sectionHeader, this.state.isReduce ? {backgroundColor: Color.n_default_orange} : {backgroundColor: Color.n_button_gradient_green_start}]}
                topTextStyle={styles.sectionHeaderTitle}
                icon_mark={Images.n_ic_image_white}
                radiussize={0}
                imageSize={15}
                label={translang.t('Image')}
              />
              <View style={{...styles.sectionContainer, height: 100, marginBottom: 30,}}>
                <FlatList
                  style={{flex: 0}}
                  data={this.state.attachedImages}
                  keyExtractor={(item, index) => index.toString()}
                  ItemSeparatorComponent={this.ItemSeparatorView}
                  renderItem={({item, index}) => this.renderAttachImages(item, index)}
                  horizontal
                />
              </View>
            </>}

            <NextButton
              label={translang.t('COMMON_submit').toUpperCase()}
              containerStyle={{
                width: '90%',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginVertical: 15,
              }}
              buttonStyle={{borderRadius: 38, height: 75}}
              colors={buttonColor}
              isVerticalGradient={false}
              _onPress={() => this.__next()}/>

          </ScrollView>

        </View>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={alertImage}
          message={this.state.modalBody}
          buttonColors={alertButtonColor}
          isVerticalGradient={false}
          onClose={() => {
            if (this.state.modalBody === translang.t('COMPLETED')) {
              this.setState({showModal: false}, () => {
                this.props.navigation.navigate('App');
              });
              // this.props.navigation.pop(1);
              // if (this.state.isReduce) {
              //   this.props.navigation.navigate('BehaviorReduce');
              // } else {
              //   this.props.navigation.navigate('BehaviorAdd');
              // }
            } else {
              this.setState({showModal: false});
            }
          }}
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
  titleContainer: {
    width: '100%',
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.bluegray,
  },
  title: {
    fontSize: 25,
    fontWeight: 'normal',
  },
  list: {
    // flex: 1,
  },
  sectionHeader: {
    height: 50,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginHorizontal: 15,
    marginVertical: 0,
    marginTop: 30,
  },
  sectionHeaderTitle: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.white,
  },
  itemAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    marginHorizontal: 25
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    marginVertical: 0,
    marginHorizontal: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionContainer1: {
    backgroundColor: '#fff',
    marginVertical: 0,
    marginHorizontal: 15,
    paddingTop: 4,
  },
  itemText: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
  },
  itemTextNo: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black'
  },
  itemTextName: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: 'black'
  },
  itemTextScore: {
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    fontWeight: 'bold'
  },
  totalTitle: {
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    fontWeight: 'bold'
  },
  totalScore: {
    marginLeft: 5,
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    fontWeight: 'bold',
    color: Color.green_button_next_color1
  },
  listItem: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 5,
    marginHorizontal: 15,
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
  noteText: {
    marginVertical: 5,
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    color: Color.n_default_gray
  }
});
