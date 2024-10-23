import React, { Component } from 'react';
import { StyleSheet, View, Text, Modal, Image } from 'react-native';
import Color from '../constants/color';
import GradientButton from './GradientButton';
import translang, { getCurrentLocale } from '../utils/language.utils';
import Images from '../themes/Images';
import IconInfoItem from './IconInfoItem';

class CheckOutOnTimeModal extends Component
{

  constructor(props) {
    super(props);

  }

  async componentDidMount() {

  }

  onCancel = () => {
    this.props.onCancel();
  };

  onOk = () => {
    this.props.onOk();
  };

  render() {
    const { isVisible } = this.props;
    const data = this.props.data ?? {};
    const title = this.props.title ?? translang.t('CHECK_IN_LATE');
    let profileImage = Images.man_user;
    if (data.picture) {
      profileImage = {uri: data.picture};
    }

    return (
      <Modal
        animationType='fade'
        transparent={true}
        key="modal"
        visible={isVisible}>
        <View style={styles.centeredView} >
          <View style={styles.containerView}>
            <Text style={styles.title}>
              {title}
            </Text>
            <Image
              source={profileImage}
              style={styles.profileImage}></Image>
              <View style={{marginTop: 20, marginBottom: 10, width: '100%', paddingHorizontal: 20}}>
                <Text style={styles.infotexttitle}>{translang.t('PROFILE_namesurname')}</Text>
                <Text style={styles.infotextcontent}>{(data.name ?? '') + ' ' + (data.lastname ?? '')}</Text>
              </View>
              <View style={{marginTop: 0, marginBottom: 20, width: '100%', paddingHorizontal: 20}}>
                <Text style={styles.infotexttitle}>{translang.t('CLASSROOM')}</Text>
                <Text style={styles.infotextcontent}>{data.classroom ?? '-'}</Text>
              </View>
            <View style={styles.buttonContainer}>
              <GradientButton
                    label={translang.t('COMMON_cancel') }
                    containerStyle={{flex: 1, margin: 20, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                    buttonStyle={{borderRadius: 0, height: 50, borderRadius: 25,}}
                    textStyle={{fontFamily: 'THSarabunNew', fontSize: 24, fontWeight: 'normal'}}
                    colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    isVerticalGradient={false}
                    _onPress={() => this.onCancel()} />
              <GradientButton
                  label={translang.t('COMMON_ok') }
                  containerStyle={{flex: 1, margin: 20, paddingHorizontal: 0, shadowColor: 'transparent', shadowOpacity: 0}}
                  buttonStyle={{borderRadius: 0, height: 50, borderRadius: 25,}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  textStyle={{fontFamily: 'THSarabunNew', fontSize: 24, fontWeight: 'normal'}}
                  isVerticalGradient={false}
                  _onPress={() => this.onOk()} />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000090',
  },
  containerView: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontFamily: 'THSarabunNew',
    fontSize: 30,
    marginVertical: 15,
    alignSelf: 'center',
    color: Color.n_default_gray
  },
  profileImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 75,
    alignSelf: 'center',
  },

  infotexttitle: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_gray
  },

  infotextcontent: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    color: Color.n_default_gray
  },

  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  infoItem: {
    marginHorizontal: 20,
    alignSelf: 'flex-start'
  },
  infoTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 28,
  },
});

export default CheckOutOnTimeModal;
