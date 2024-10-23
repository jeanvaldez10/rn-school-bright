import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Modal,
  ScrollView,
  Text,
} from 'react-native';
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
import GradientButton from '../../components/GradientButton';
import NextButton from '../../components/NextButton';

import translang, { getCurrentLocale } from '../../utils/language.utils';


const OfferItem = ({ person, navigation, onCheckBoxPress }) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => navigation.navigate('BroadcastOutputAttach', { person })}>
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
export default class BroadcastOutput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      showModal: false,
      dataSource: [],
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


  ItemSeparatorView = () => {
    return (
      // Flat List Item Separator
      <View
        style={{
          height: 0.5,
          width: '100%',
          backgroundColor: '#C8C8C8',
        }}
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
    const { folders, renameValue } = this.state;
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_broadcast')}
          onMenuTap={() => this.back()}
        />

        <GradientButton
          label={translang.t('BROADCAST_employees')}
          containerStyle={{ marginTop: 0, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
          buttonStyle={{ borderRadius: 0 }}
          textStyle={{ color: '#000' }}
          colors={[Color.bluegray, Color.bluegray]}
          isVerticalGradient={false}
          _onPress={() => { }} />

        <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center' }} indicatorStyle={'black'} bounces={false}>
          {this.state.dataSource.length > 0 && <FlatList
            data={this.state.dataSource}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={this.ItemSeparatorView}
            renderItem={this._renderItem}
          />}
          {this.state.dataSource.length == 0 &&
            <Text style={styles.value2}>
              {translang.t('BROADCAST_nolist')}
            </Text>}
        </ScrollView>

        <NextButton
          label={translang.t('COMMON_next')}
          containerStyle={{ paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0 }}
          buttonStyle={{ borderRadius: 3 }}
          colors={[Color.green_button_next_color1, Color.green_button_next_color2]}
          isVerticalGradient={false}
          _onPress={() => this.__next()} />

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.checked}
          title=' '
          message={translang.t('COMMON_close')}
          buttonColors={[Color.green_button_next_color1]}
          onClose={() => { this.setState({ showModal: false }) }}
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
    marginVertical: 5,
    backgroundColor: 'green',
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
    textAlign: 'center',
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
