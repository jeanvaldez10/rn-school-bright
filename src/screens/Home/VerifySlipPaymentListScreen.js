import React from 'react';
import { View, BackHandler, TouchableOpacity, FlatList, } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import translang from '../../utils/language.utils';
import moment from 'moment';

export default class VerifySlipPaymentListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showModal: false,
      type: null,
      date: null,
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

      const type = this.props.navigation.getParam('type');
      const date = this.props.navigation.getParam('date');

      this.setState({ type, date })
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

    this.props.navigation.navigate('VerifySlip');
  };

  onSelectItem = (index) => {
    const params = {
      type: this.state.type,
      date: this.state.date,
    }
    this.props.navigation.navigate('VerifySlipUpload', params);
  }

  renderItem = (index) => {
    const date = this.state.date;

    return (
      <TouchableOpacity style={styles.listItem} onPress={() => this.onSelectItem(index)}>
        <View style={styles.itemLine}>
          <Text style={styles.itemText}>{translang.t('AMOUNT')}</Text>
          <Text style={styles.itemText}>{`2000 ${translang.t('COIN_CURRENCY')}`}</Text>
        </View>

        <View style={styles.itemLine}>
          <Text style={styles.itemText}>{translang.t('CREATED_DATE_QRCODE')}</Text>
          <Text style={styles.itemText}>{date ? moment(date).format('DD/MM/YYYY') : ''}</Text>
        </View>

        <View style={styles.itemLine}>
          <Text style={styles.itemText}>{translang.t('REFERENCE_NO')} {"12345678"}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { type, date } = this.state;

    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('PAYMENT_LIST')}
          onMenuTap={() => this.back()}
        />

        <View style={styles.container}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 10}}>
            <Text style={styles.infoText}>{translang.t('TYPE')} : {type?.title}</Text>
            <Text style={styles.infoText}>{translang.t('DATE')} : {date ? moment(date).format('DD/MM/YYYY') : ''}</Text>
          </View>

          <Text style={styles.title}>{translang.t('SELECT_ITEM')}</Text>

          <FlatList style={styles.list}
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => this.renderItem(index)}
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
  titleContainer: {
    width: '100%',
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.bluegray,
  },
  infoText: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    marginHorizontal: 20,
  },
  title: {
    fontFamily: 'THSarabunNew',
    fontSize: 28,
    fontWeight: 'bold',
    color: Color.n_default_orange,
    marginHorizontal: 20,
    textAlign: 'center',
    marginVertical: 8,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
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
    marginHorizontal: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  itemText: {
    fontSize: 20,
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
  },
});
