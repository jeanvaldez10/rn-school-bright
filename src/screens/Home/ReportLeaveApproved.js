import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Modal,
  ScrollView,
} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import Images from '../../themes/Images';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import Toast from 'react-native-simple-toast';
import Color from '../../constants/color';
import dimension from '../../constants/dimension';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import IconInfoItem from '../../components/IconInfoItem';
import AttachInfoItem from '../../components/AttachInfoItem';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import AlertWith2ButtonsModal from '../../components/AlertWith2ButtonsModal';
import GradientButton from '../../components/GradientButton';

import translang, { getCurrentLocale } from '../../utils/language.utils';


const OfferItem = ({ person, navigation, onCheckBoxPress }) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => navigation.navigate('ReportLeaveApprovedAttach', { person })}>
        <View style={styles.uperCardChild}>
          <Image source={Images.folder} style={styles.itemIcon} />
          <View>
            <Text style={styles.itemText}>{person}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onCheckBoxPress(person)}
            style={styles.itemActions}>
            <Text style={{ color: '#BE0B12', fontSize: 18, fontWeight: '700' }}>
              {' '}
              ...more{' '}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};
export default class ReportLeaveApproved extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      showConfirmModal: false,
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  componentDidMount() {
    this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentWillUnmount = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }
    if(this.focusListener){
      this.focusListener.remove();
    }
  };

  onCheckBoxPress = (folder) => {

  };

  _renderItem = ({ item }) => {
    return (
      <OfferItem
        person={item}
        navigation={this.props.navigation}
        onCheckBoxPress={this.onCheckBoxPress}
      />
    );
  };

  back = () => {
    this.props.navigation.goBack();
  };

  __next = async () => {

    this.setState({ showModal: true, modalBody: translang.t('LEAVE_success') });
    return;
  };

  render() {

    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_leave')}
          onMenuTap={() => this.back()}
          is_more='1'
          actions={[translang.t('LEAVE_confirm'),]}
          onMoreTap={(value, index) => {
            
            if (index === 0)
              this.setState({ showConfirmModal: true })
          }}
        />

        <ScrollView style={styles.dispcontainer}>

          <IconInfoItem
            style={{ marginHorizontal: 10, marginVertical: 10 }}
            icon_mark={Images.ic_send_green}
            label={translang.t('LEAVE_sender')}
            value_txt="JAB JAIS"
            topTextStyle={styles.title2}
            bottomTextStyle={styles.value2}
            imageSize={40}
          />
          <IconInfoItem
            style={{ marginHorizontal: 10, marginVertical: 10 }}
            icon_mark={Images.ic_chair_blue}
            label={translang.t('LEAVE_classroom')}
            value_txt="1/1"
            topTextStyle={styles.title2}
            bottomTextStyle={styles.value2}
            imageSize={40}
          />
          <IconInfoItem
            style={{ marginHorizontal: 10, marginVertical: 10 }}
            icon_mark={Images.ic_user_blue}
            label={translang.t('LEAVE_position')}
            value_txt="samp"
            topTextStyle={styles.title2}
            bottomTextStyle={styles.value2}
            imageSize={40}
          />

          <IconInfoItem
            style={{ marginHorizontal: 10, marginVertical: 10 }}
            icon_mark={Images.description}
            label={translang.t('LEAVE_reason')}
            value_txt="Personal leave"
            topTextStyle={styles.title2}
            bottomTextStyle={styles.value2}
            imageSize={40}
          />
          <IconInfoItem
            style={{ marginHorizontal: 10, marginVertical: 10 }}
            icon_mark={Images.ic_new_clock}
            label={translang.t('LEAVE_from')}
            value_txt="11/02/2021 "
            topTextStyle={styles.title2}
            bottomTextStyle={styles.value2}
            imageSize={40}
          />
          <IconInfoItem
            style={{ marginHorizontal: 10, marginVertical: 10 }}
            icon_mark={Images.ic_new_clock}
            label={translang.t('LEAVE_to')}
            value_txt="19/02/2021"
            topTextStyle={styles.title2}
            bottomTextStyle={styles.value2}
            imageSize={40}
          />
          <IconInfoItem
            style={{ marginHorizontal: 10, marginVertical: 10 }}
            icon_mark={Images.ic_new_clock}
            label={translang.t('LEAVE_dateapprove')}
            value_txt="19/02/2021"
            topTextStyle={styles.title2}
            bottomTextStyle={styles.value2}
            imageSize={40}
          />
          <IconInfoItem
            style={{ marginHorizontal: 10, marginVertical: 10 }}
            icon_mark={Images.description}
            label={translang.t('LEAVE_description2')}
            value_txt="----"
            topTextStyle={styles.title2}
            bottomTextStyle={styles.value2}
            imageSize={40}
          />
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('ReportLeaveApprovedAttach')}>
            <AttachInfoItem
              style={{ marginHorizontal: 10, marginVertical: 10 }}
              icon_mark={Images.attach_image}
              icon_attach={require("../../assets/images/sample_attach.png")}
              label={translang.t('LEAVE_attachimage')}
              topTextStyle={styles.title2}
              bottomTextStyle={styles.attach2}
              imageSize={40}
            />
          </TouchableOpacity>
          <IconInfoItem
            style={{ marginHorizontal: 10, marginVertical: 10 }}
            icon_mark={Images.leave_location}
            label={translang.t('LEAVE_address2')}
            value_txt="---"
            topTextStyle={styles.title2}
            bottomTextStyle={styles.value2}
            imageSize={40}
          />
        </ScrollView>

        <GradientButton
          label={translang.t('LEAVE_approved')}
          containerStyle={{ paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
          buttonStyle={{ borderRadius: 0 }}
          colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
          isVerticalGradient={false}
          _onPress={() => this.__next()} />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.checked}
          title=' '
          message={translang.t('LEAVE_success')}
          buttonColors={[Color.green_button_next_color1]}
          onClose={() => { this.setState({ showModal: false }) }}
        />

        <AlertWith2ButtonsModal
          isVisible={this.state.showConfirmModal}
          image={Images.alert_inbox}
          message={translang.t('LEAVE_msg_confirmcancel')}
          onClose={() => { this.setState({ showConfirmModal: false }) }}
          onConfirm={() => { }}
        />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000025',
  },
  dialogStyle: {
    width: 350,
    height: dimension.px150,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '80%',
  },
  container: {
    height: '100%',
    backgroundColor: Color.white,
  },
  dispcontainer: {
    marginBottom: 0,
  },
  itemIcon: {
    width: '25@ms',
    height: '25@ms',
  },
  uperCardChild: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 5,
    paddingVertical: 15,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  itemText: {
    marginLeft: '20@ms',
    color: '#000',
    fontSize: '14@ms',
    paddingRight: 100,
  },
  itemActions: {
    position: 'absolute',
    right: 1,
    alignItems: 'center',
  },
  options1Text: {
    color: 'blueviolet',
    fontSize: '18@ms0.3',
  },
  options1Row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: '38%',
  },
  home: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 16,
    fontWeight: 'bold'
  },
  value2: {
    fontFamily: 'THSarabunNew',
    fontSize: 16,
  },
  attach2: {
    width: 100,
    height: 100,
  },
  bottombuttonStyle: {
    width: '100%',
    height: 60,
    borderRadius: 5,
    backgroundColor: Color.green_button_next_color1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    position: 'absolute',
    bottom: 0,
  },
  confirmbutton: {
    color: Color.white,
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
  },
});
