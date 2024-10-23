import React from 'react';
import { Image, View, BackHandler, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Images from '../../themes/Images';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ProgressHud from '../../components/ProgressHud';
import Caretdown from 'react-native-vector-icons/AntDesign';
import ApiManager from '../../managers/ApiManager';
import CustomRadioButtonItem from '../../components/CustomRadioButtonItem';

export default class BroadcastGroupSelectClassScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      modalBody: '',
      expandStatus: {},
      userInfo: null,
      deliveryFormat: {},
      recipient: {},
      selectedIds: [],

      classList: [],
      
      studentList: [],
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
      const deliveryFormat = this.props.navigation.getParam('deliveryFormat');
      const recipient = this.props.navigation.getParam('recipient');
      const selectedIds = this.props.navigation.getParam('selectedIds');
      
      this.setState({ userInfo: userInfo, deliveryFormat: deliveryFormat, recipient: recipient, selectedIds: selectedIds }, ()=>{
        this.loadClassLevel();
      });
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

    this.props.navigation.navigate('Broadcast');
  };

  loadClassLevel = () => {
    this.setState({isLoading: true});
    ApiManager.getAllClass(this.state.userInfo.SchoolID).then(list => {
      list.forEach(itemCL => {
        itemCL.isSelected = false
        itemCL.isExpand = false
        itemCL.level2.forEach(itemC => {
          itemC.isSelected = false
        });
      });
      
      this.setState({classList: list, isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  onNext = async () => {
    let level2idList = [];

    this.state.classList.forEach(itemCL => {
      itemCL.level2.forEach(itemC => {
        if(itemC.isSelected){
          level2idList.push(itemC);
        }
      });
    });

    if(level2idList.length == 0){
      this.setState({modalBody: translang.t('SELECT_CLASS'), showModal: true});
      return;
    }else{
      console.log(level2idList);
      let params = { 
        deliveryFormat: this.state.deliveryFormat, 
        recipient: this.state.recipient, 
        selectedIds: this.state.selectedIds, 
        parent: 'BroadcastGroupSelectClass', 
        userInfo: this.state.userInfo,
        level2id: level2idList
      };
      this.props.navigation.navigate('BroadcastFillInfo', params);
    }
    
  };

  renderHeaderItem = (index) => {
    const value = this.state.classList[index];
    let levelName = value.levelname;
    if(getCurrentLocale() == 'en' && value.levelnameEN && value.levelnameEN != ""){
      levelName = value.levelnameEN;
    }
    const isExpend = value.isExpand;

    return (
      <TouchableOpacity 
        style={styles.listItem} 
        onPress={() => {
          const tmp = this.state.classList;
          tmp[index].isExpand = !tmp[index].isExpand;;
          this.setState({ classList: tmp });
        }}>
        <CustomRadioButtonItem 
          isSelected={value.isSelected} 
          selectedColor={Color.n_button_gradient_green_start}
          radioSize={20}
          onPress = {()=>{this.onSelectHeaderItem(index)}} />
        <Text style={{...styles.itemText, marginHorizontal: 10, flex: 1}}>{levelName}</Text>
        <View style={{width: 20, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: 5}}>
          {value.level2 && value.level2.length > 0 && isExpend &&
            <Caretdown name="caretup" size={15} color={Color.n_default_orange} />
          }
          {value.level2 && value.level2.length > 0 && !isExpend &&
            <Caretdown name="caretdown" size={15} color={Color.n_default_orange} />
          }
        </View>
      </TouchableOpacity>
    );
  }

  renderItem = (item, index, parentIdx) => {
    let levelName = item.NameTH;
    if(getCurrentLocale() == 'en' && item.NameEN && item.NameEN != ""){
      levelName = item.NameEN;
    }

    return (
      <View style={{...styles.listItem, backgroundColor: Color.n_backgroud_gray_light, borderBottomWidth: 0, marginHorizontal: 0,}}>
        <View style={{flexDirection: 'row', flex: 1, marginLeft: 45,}}>
          <CustomRadioButtonItem 
            isSelected={item.isSelected} 
            selectedColor={Color.n_button_gradient_green_start}
            radioSize={20}
            onPress = {()=>{this.onSelectItem(parentIdx, index)}} />
          <Text style={{...styles.itemText, marginHorizontal: 10}}>{levelName}</Text>
        </View>
      </View>
    );
  };

  renderItems = (index) => {
    const isExpand = this.state.classList[index].isExpand ?? false;
    const classRoomList = this.state.classList[index].level2;

    if (isExpand) {
      return (
        <View>
          { classRoomList.map((value, idx) => {
            return this.renderItem(value, idx, index);
          })
          }
        </View>
      );
    } else {
      return null;
    }
  };

  onSelectHeaderItem = (index) => {
    const tmpClassList = this.state.classList;
    tmpClassList[index].isSelected = !tmpClassList[index].isSelected;
    
    tmpClassList[index].level2.forEach(item=>{
      item.isSelected = tmpClassList[index].isSelected
    })
    this.setState({classList: tmpClassList});
  }

  onSelectItem = (parentIdx, index) => {
    const tmpClassList = this.state.classList;
    tmpClassList[parentIdx].level2[index].isSelected = !tmpClassList[parentIdx].level2[index].isSelected;

    let pSelected = false
    tmpClassList[parentIdx].level2.forEach(item=>{
      if(item.isSelected){
        pSelected = true
      }
    });
    
    tmpClassList[parentIdx].isSelected = pSelected;
    
    this.setState({classList: tmpClassList});
  }

  render() {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_broadcast')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <View style={styles.list}>
            <Text style={styles.title}>{translang.t('SELECT_CLASS')}</Text>
            <ScrollView>
              { this.state.classList.map((value, index) => {
                return (
                  <View key={index}>
                    { this.renderHeaderItem(index) }
                    { this.renderItems(index) }
                  </View>
                )
              })
              }
            </ScrollView>
          </View>
          

          <NextButton
            label={translang.t('COMMON_next')}
            containerStyle={{width: '90%', marginLeft: 'auto', marginRight: 'auto', marginVertical: 30}}
            buttonStyle={{height: 75, borderRadius: 38 }}
            colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
            isVerticalGradient={false}
            _onPress={() => this.onNext()} />
        </View>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.n_ic_warning}
          message={this.state.modalBody}
          buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
          isVerticalGradient={false}
          onClose={() => {
            this.setState({ showModal: false });
          }}
        />
        <ProgressHud isVisible={this.state.isLoading} />
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
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    textAlign: 'center',
    marginBottom: 10,
  },
  list: {
    flex: 1,
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

    marginHorizontal: 15,
    marginBottom: 10,
    marginTop: 30,
    paddingTop: 30,
    paddingBottom: 10,

  },
  listItem: {
    flexDirection: 'row', 
    flex: 1, 
    alignItems: 'center', 
    borderBottomColor: Color.n_default_brown,
    borderBottomWidth: 1,
    
    marginHorizontal: 30,
    paddingVertical: 10,
    paddingHorizontal: 5,
    
  },
  itemText: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    color: Color.n_default_gray
  },
  itemAvatar: {
    width: 60, 
    height: 60, 
    borderRadius: 30,
    marginRight: 15,
    marginLeft: 25
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
