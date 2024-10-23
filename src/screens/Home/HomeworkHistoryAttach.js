import React from 'react';
import { Image, View, BackHandler } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';

import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';

import translang from '../../utils/language.utils';

export default class HomeworkHistoryAttach extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [require("../../assets/images/sample_attach.png")],
      showModal: false,
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

  back = () => {
    this.props.navigation.goBack();
  };

  render() {
    const { files } = this.state;
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_homework')}
          onMenuTap={() => this.back()}
          is_download="1"
          onDownloadTap={() => this.setState({ showModal: true })}
        />
        <View style={styles.viewcontainer}>

              {files.map((file) => (
                <Image
                  key={file}
                  source={file}
                  style={styles.attachImage}
                  
                />
              ))}
        </View>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.checked}
          title=' '
          message={translang.t('HOMEWORK_completed')}
          buttonColors={[Color.green_button_next_color1]}
          onClose={() => { this.setState({ showModal: false }) }}
        />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  attachImage: {
    width: '100%',
    height: '100%',
    margin: 2,
    resizeMode: 'contain'
  },
  container: {
    height: '100%',
    backgroundColor: Color.lightBlack,
  },
  viewcontainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
});
