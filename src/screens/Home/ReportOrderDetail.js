import React from 'react';
import { Image, View, BackHandler, TouchableOpacity} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import translang from '../../utils/language.utils';
import Storage from '../../managers/StorageManager';
import BackNavigationBar from '../../components/BackNavigationBar';
import NumberFormat from 'react-number-format';


const PlanItem = ({ noTxt, leftTxt, rightTxt }) => {
  return (
    <View style={styles.uperCardChild}>
      <View style={{ flexDirection:'row' }}>
        <Text style={styles.listTextLeft}>{leftTxt}</Text>
        <NumberFormat
          value={noTxt}
          displayType={'text'}
          thousandSeparator={true}
          renderText={value => (<Text style={[styles.listTextNo, {width: 50}]}>{value}</Text>)}/>
        
      </View>
      <TouchableOpacity style={styles.itemActions}>
        <NumberFormat
          value={rightTxt}
          displayType={'text'}
          thousandSeparator={true}
          renderText={value => (<Text style={styles.listTextRight}>{value}</Text>)}/>
      </TouchableOpacity>
    </View>
  );
};

export default class ReportOrderDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buyItem: {},
      userInfo: {},
    };
  }

  handleBackButton = () => {
    this.back();
    return true;
  };

  async componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      if(this.backhandler){
        this.backhandler.remove();
      }
      this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

      const userInfo = this.props.navigation.getParam('userInfo');
      const buyItem = this.props.navigation.getParam('buyItem');
      this.setState({ userInfo: userInfo, buyItem: buyItem }, () => {
        
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
    if(this.focusListener){
      this.backhandler.remove();
    }

    this.props.navigation.navigate('ReportOrderList');
  };
  
  render() {
    console.log(buyItem);
    const buyItem = this.state.buyItem;
    const date = moment(buyItem.PAYMENTTIME).format('DD MMM YYYY HH:mm:ss');
    let total = buyItem.TOTALMONEY ?? 0;
    const items = buyItem.PRODUCTS ?? [];
    console.log(items);
    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar 
          title={translang.t('ORDER_LIST')}
          onMenuTap={this.back}
        />

        <Text style={styles.caption}>{translang.t('SHOP_payment')}</Text>
        <View style={styles.detailContainer}>
          <ScrollView indicatorStyle={'black'}>
          <Text style={{...styles.detailDate, fontSize: 28, fontWeight: 'bold'}}>{translang.t('DETAIL')}</Text>
          <View style={{height: 1, width: '100%', backgroundColor: Color.n_default_brown }}/>
          <Text style={{...styles.detailDate, marginTop: 10}}>{date}</Text>            
          { items.map(item => (
            <PlanItem
              noTxt={"X "+item.AMOUNT ?? "0"}
              leftTxt={item.PRODUCTNAME ?? "0"}
              rightTxt={item.PRICE ? item.PRICE.toFixed(1): "0"}
            />))}
          </ScrollView>
         
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>{translang.t('TOTAL')}</Text>
          <NumberFormat
              value={total}
              displayType={'text'}
              thousandSeparator={true}
              renderText={value => (<Text style={styles.totalText}>{value}</Text>)}/>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: Color.n_background_white,
    flexDirection: 'column',
    height: '100%',
  },

  caption: {
    fontFamily: 'THSarabunNew',
    fontSize: 30, 
    fontWeight: 'bold',
    textAlign: 'center', 
    color: Color.n_button_gradient_green_start,

    marginTop: 10,
  },

  downCardChild: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  itemText: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    marginTop: 15,
    color: Color.n_default_gray,
    textAlign: 'center',
  },
  
  itemIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  detailContainer: {
    flex: 1,
    marginHorizontal: 15,
    marginTop: 20,
    padding: 25,
    borderRadius: 25,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },

  detailDate: {
    fontFamily: 'THSarabunNew',
    fontSize: 14,
    color: "#000"
  },

  uperCardChild: {
    flexDirection: 'row',
    paddingVertical: 5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 5,
  },
  listTextNo: {
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.n_button_gradient_green_start,
    marginLeft: 10,
  },

  listTextLeft: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    color: "#000",
  },

  listTextRight: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: "#000",
  },

  totalContainer: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 50,
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 40,
    backgroundColor: Color.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,

  },

  totalText: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    color: Color.n_button_gradient_green_start
  },






















  
  date: {
    width: '100%',
    textAlign: 'right',
    fontSize: 20,
    fontFamily: 'THSarabunNew',
  },
  shopName: {
    fontSize: 28,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
  },
  itemName: {
    fontSize: 26,
    fontFamily: 'THSarabunNew',
    fontWeight: 'bold',
  },

  
  
});
