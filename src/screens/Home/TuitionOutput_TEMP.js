import React, { Component, createRef } from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  Modal,
} from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import Images from '../../themes/Images';
import Color from '../../constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import CustomRadioButton from '../../components/CustomRadioButton';
import translang, { getCurrentLocale } from '../../utils/language.utils';
import ApiManager from '../../managers/ApiManager';
import ProgressHud from '../../components/ProgressHud';
import moment from 'moment';
import NumberFormat from 'react-number-format';
import GradientButton from '../../components/GradientButton';
import CustomCheckButton from '../../components/CustomCheckButton';
import ViewShot, { captureRef } from "react-native-view-shot";
import _ from 'lodash';
import RNFS from "react-native-fs";
import RNFetchBlob from 'rn-fetch-blob';
import CameraRoll from "@react-native-community/cameraroll";


const PaidItem = ({ left1Txt, centerTxt, right1Txt, clickDownload }) => {
  return (
    <View>
      <View style={[styles.uperCardChild, { justifyContent: 'space-between' }]}>
        <Text style={styles.itemText} multiline={true}>{left1Txt}</Text>
        <NumberFormat
          value={centerTxt}
          displayType={'text'}
          thousandSeparator={true}
          renderText={value => (<Text style={styles.itemText}>{value}</Text>)}/>
          
        <TouchableOpacity
          onPress={() => clickDownload()}>
          <Text style={{...styles.itemText, textAlign: 'right'}}>{right1Txt}</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
};

const PlanItem = ({ leftTxt, rightTxt, custextStyle, cusleftTextStyle, cusrightTextStyle}) => {
  return (
    <View>
      <View style={[styles.uperCardChild, { justifyContent: 'space-between'}]}>
        <View style={{marginRight: 10, flex: 1}}>
          <Text style={[custextStyle, cusleftTextStyle, {textAlign: 'left'}]} multiline={true}>{leftTxt}</Text>
        </View>
        <View style={styles.itemActions}>
          <NumberFormat
            value={rightTxt}
            displayType={'text'}
            thousandSeparator={true}
            renderText={value => (<Text style={[custextStyle, cusrightTextStyle]}>{value}</Text>)}/>
        </View>
      </View>
    </View>
  );
};

export default class TuitionOutput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      userInfo: {},
      invoiceId: "",
      isLoading: false,
      flag_paid: false,
      feeData: {},
      changePayment: 0,
      showDownloadModal: false,
      selInvoiceItem: {},

    };
  }

  viewreceipt = React.createRef();

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

      RNFetchBlob.fs.mkdir(`${RNFetchBlob.fs.dirs.PictureDir}/SchoolBright`).then(() => {console.log("Created Folder")}).catch((err) => {"Exist Folder", err});

      const userInfo = this.props.navigation.getParam('userInfo');
      const invoiceId = this.props.navigation.getParam('invoiceId');
      const flag = this.props.navigation.getParam('paystatus');
      this.setState({userInfo: userInfo, invoiceId: invoiceId, flag_paid: flag, changePayment: 0}, ()=>{
        this.getFeeInfo();
      })

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

  getFeeInfo = () => {
    this.setState({isLoading: true});
    ApiManager.getPaymentFee(this.state.userInfo.ID, this.state.userInfo.SchoolID, this.state.invoiceId).then(data => {
      this.setState({feeData: data, isLoading: false});
    }).catch(error => {
      console.log(error);
      this.setState({ isLoading: false });
    });
  }

  renderListProduct() {
    var res = []
    const {feeData} = this.state;
    const products = feeData.product;
    if(products != undefined && products.length > 0){
      for(let i = 0; i < products.length; i++){
        let item = products[i];
        res.push(
          <PlanItem
            key={i}
            leftTxt={item.product_name}
            rightTxt={item.price}
            custextStyle={styles.itemText}
          />
        );
      }
    }
    return res;
  }
  renderInvoices(isShowDownload) {
    var res = []
    const {feeData} = this.state;
    const invoices = feeData.invoicesPayments;
    if(invoices != undefined && invoices.length > 0){
      for(let i = 0; i < invoices.length; i++){
        let item = invoices[i];
        res.push(
          <PaidItem
            key={i}
            left1Txt={moment(item.paymentDate).format('DD/MM/YYYY')}
            centerTxt={item.amount}
            right1Txt={isShowDownload? "Download" : ""}
            clickDownload={()=>{this.setState({showDownloadModal: true, selInvoiceItem: item})}}/>
        );
      }
    }
    return res;
  }


  back = () => {
    if(this.backhandler){
      this.backhandler.remove();
    }

    this.props.navigation.navigate('Tuition');
  };

  onPapyment = () => {
    const param = {
      userInfo: this.state.userInfo,
      type: this.state.changePayment,
      balance: this.state.feeData.totalprice,
      invoiceid: this.state.invoiceId,
    }
    this.props.navigation.navigate('TuitionPayment', param);
  };

  onDownloadReceipt = async ()=> {
    this.setState({isLoading: true});
    this.viewreceipt.current.capture().then(uri => {
      let uriArray = uri.split("/");
      let nameToChange = uriArray[uriArray.length - 1];
      // let renamedURI = uri.replace(
      //   nameToChange, `${"SB_TUITION"}_${moment().format("MM_DD_YYYY")}.jpg`
      // );
      const renamedURI = `${RNFetchBlob.fs.dirs.PictureDir}/SchoolBright/${moment().format("MM_DD_YYYY")}.jpg`
      RNFS.copyFile(uri, renamedURI)
        .then(() => {
          this.setState({showDownloadModal: false});


          // CameraRoll.save(renamedURI)
          //   .then(() =>{
          //     this.setState({showDownloadModal: false});
          //   })
          //   .then()
          //   .catch(err => console.log('CameraRoll:', err))
          
        })
        .catch(err => {
          console.log("CopyFile", err.message);
        });
    });
  }
  
  render() {
    const {flag_paid, feeData} = this.state
    const feeDataProducts = feeData.product;
    let isProductable = false;
    if(feeDataProducts != undefined && feeDataProducts.length > 0){
      isProductable = true
    }

    const invoiceData = feeData.invoicesPayments;
    let invoices = false;
    let invoiceBalance = 0;
    if(invoiceData != undefined && invoiceData.length > 0){
      invoices = true;
      invoiceData.forEach(item=>{
        invoiceBalance = invoiceBalance + item.amount;
      })

    }

    let schoolLogo = Images.n_applogo_logo;
    if(feeData.school_pic != null && feeData.school_pic != ""){
      schoolLogo = { uri: feeData.school_pic };
    }

    const dueDate = moment(feeData.dueDate).format('DD/MM/YYYY');

    const classlevel = feeData.level_name ?? "";
    const room = feeData.class_name ?? "";

    const moreActions = [
      translang.t('DOWNLOAD_RECEIPT'), 
    ];


    const radio_props = [
      { text: translang.t('TUITION_promptpay'), key: 0 },
      { text: translang.t('TUITION_creditcard'), key: 1 },
      // { text: translang.t('QR_CODE'), key: 2 },
    ];

    let strPaymentDateDownload = "";
    if(this.state.selInvoiceItem.paymentDate){
      strPaymentDateDownload = moment(this.state.selInvoiceItem.paymentDate).format('DD/MM/YYYY');
    }


    return (
      <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
        <BackNavigationBar
          title={translang.t('DRAWER_tuition')}
          onMenuTap={() => this.back()}
          // is_more='1'
          // actions={moreActions}
          // onMoreTap={(value, index) => {
          //   if (index === 0)
          //     this.setState({showDownloadModal: true});
          // }}
        />

        <ScrollView >
          <View style={styles.dispcontainer}>
            <Image source={schoolLogo} style={styles.applogo}/>
            <Text style={{...styles.textStyle1, color: Color.n_default_gray, textAlign: 'center', marginTop: 10}}>{feeData.school_name ?? ""}</Text>
            <Text style={{...styles.textStyle2, color: Color.n_default_gray, textAlign: 'center'}}>{feeData.school_nameEN ?? ""}</Text>

            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={styles.userInfoTitle}>{translang.t('ACADEMIC_year2')}</Text>
              </View>
              <View style={{flex: 1, flexDirection: 'row'}}>
              <Text style={{...styles.userInfoContent}}>{feeData.yesr ?? ""}</Text>
                <Text style={{...styles.userInfoTitle, flex: 0}}>{translang.t('ACADEMIC_semester2')}</Text>
                <Text style={{...styles.userInfoContent}}>{feeData.trem ?? ""}</Text>
              </View>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text style={styles.userInfoTitle}>{translang.t('ACADEMIC_name')}</Text>
              <Text style={styles.userInfoContent}>{feeData.student_name??''}</Text>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text style={styles.userInfoTitle}>{translang.t('ACADEMIC_studentid')}</Text>
              <Text style={styles.userInfoContent}>{feeData.student_id??''}</Text>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text style={styles.userInfoTitle}>{translang.t('ACADEMIC_class')}</Text>
              <Text style={{...styles.userInfoContent}}>{classlevel + "/" + room}</Text>
            </View>
            {isProductable && <>
              <View style={{ height: 1, width: '100%', backgroundColor: Color.n_default_gray, marginTop: 10, }} />

              <Text style={{...styles.textStyle1, textAlign: 'center', color: Color.n_default_gray, marginVertical: 5,}}>
                {translang.t('TUITION_list')}
              </Text>
              {this.renderListProduct()}
            </>}
            <PlanItem
              leftTxt={translang.t('SHOP_amount')}
              rightTxt={feeData.totalprice}
              cusleftTextStyle={{...styles.textStyle1, color: Color.n_default_gray, textAlign: 'center', marginTop: 10}}
              cusrightTextStyle={{...styles.textStyle1, color: Color.n_button_gradient_green_start, textAlign: 'center', marginTop: 10}}
              custextStyle={styles.bigitemText}
            />

            {invoices && 
            <View>
              <View style={{ height: 1, width: '100%', backgroundColor: Color.n_default_gray, marginVertical: 3, }} />

              <Text style={{...styles.textStyle1, textAlign: 'center', color: Color.n_default_gray, marginVertical: 5,}}>
                {translang.t('TUITION_partialpaid')}
              </Text>

              {this.renderInvoices(true)}
              
              <View style={{ height: 1, width: '100%', backgroundColor: Color.n_default_gray, marginVertical: 3, }} />
              <PlanItem
                leftTxt={translang.t('TUITION_balance')}
                rightTxt={'0'}
                custextStyle={styles.bigitemText}
                cusleftTextStyle={{...styles.textStyle1, color: Color.n_default_gray, textAlign: 'center', marginTop: 10}}
                cusrightTextStyle={{...styles.textStyle1, color: Color.n_button_gradient_green_start, textAlign: 'center', marginTop: 10}}
              />
            </View>
            }
            <Text style={styles.paidText}>
              {`${translang.t('PAYMENT_DUEDATE')} ${dueDate}`}
            </Text>
          </View>

          {!flag_paid && 
          <View style={styles.dispcontainer}>
            <Text style={{...styles.textStyle1, textAlign: 'center', marginVertical: 15, color: Color.n_default_gray}}>
              {translang.t('TUITION_paytuitionfee')}
            </Text>

            <CustomRadioButton 
              PROP={radio_props} 
              isVertically={true}
              onPress={(value) => { this.setState({ changePayment: value }) }} />

            <TouchableOpacity style={styles.buttonStyle} activeOpacity={0.9}
              onPress={() => this.onPapyment()}>
              <Text style={styles.backbutton}>{translang.t('TUITION_payment')}</Text>
            </TouchableOpacity>
          </View>}

          
        </ScrollView>

        {this.state.showDownloadModal &&
        <Modal
          animationType='fade'
          transparent={true}
          key="modal">
          <View style={styles.centeredView} >
            <ScrollView style={{flex: 1, width: '100%'}} contentContainerStyle={{flexGrow: 1}}>
              <ViewShot ref={this.viewreceipt} style={{...styles.dialogStyle, width: "90%"}} options={{ format: "jpg", quality: 1 }}>
                <View style={styles.modalDispcontainer}>
                  <Image source={schoolLogo} style={styles.applogo}/>
                  <Text style={{...styles.textStyle1, color: Color.n_default_gray, textAlign: 'center', marginTop: 10}}>{feeData.school_name ?? ""}</Text>
                  <Text style={{...styles.textStyle2, color: Color.n_default_gray, textAlign: 'center'}}>{feeData.school_nameEN ?? ""}</Text>

                  <Text style={{...styles.textStyle2, color: Color.n_default_gray, textAlign: 'center'}}>{`${translang.t('TAX_ID')}: 099-4000172036 `}</Text>
                  <Text style={{...styles.textStyle2, color: Color.n_default_gray, textAlign: 'center'}}>{`+66 2338 0777`}</Text>

                  <Text style={{...styles.textStyle1, color: Color.n_default_gray, textAlign: 'center', marginVertical: 15}}>{translang.t('Receipt')}</Text>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1, flexDirection: 'row'}}/>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                      <Text style={{...styles.userInfoTitle, flex: 0}}>{translang.t('RECEIPT_NO')}</Text>
                      <Text style={{...styles.userInfoContent, textAlign: 'right'}}>{this.state.invoiceId}</Text>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1, flexDirection: 'row'}}/>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                      <Text style={{...styles.userInfoTitle, flex: 0}}>{translang.t('REPORT_date')}</Text>
                      <Text style={{...styles.userInfoContent, textAlign: 'right'}}>{strPaymentDateDownload}</Text>
                    </View>
                  </View>
                  <View style={{ height: 1, width: '100%', backgroundColor: Color.n_default_gray, marginVertical: 10, }} />

                  <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                      <Text style={styles.userInfoTitle}>{translang.t('ACADEMIC_year2')}</Text>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                    <Text style={{...styles.userInfoContent}}>{feeData.yesr ?? ""}</Text>
                      <Text style={{...styles.userInfoTitle, flex: 0}}>{translang.t('ACADEMIC_semester2')}</Text>
                      <Text style={{...styles.userInfoContent}}>{feeData.trem ?? ""}</Text>
                    </View>
                  </View>

                  <View style={{flexDirection: 'row'}}>
                    <Text style={styles.userInfoTitle}>{translang.t('ACADEMIC_name')}</Text>
                    <Text style={styles.userInfoContent}>{feeData.student_name??''}</Text>
                  </View>

                  <View style={{flexDirection: 'row'}}>
                    <Text style={styles.userInfoTitle}>{translang.t('ACADEMIC_studentid')}</Text>
                    <Text style={styles.userInfoContent}>{feeData.student_id??''}</Text>
                  </View>

                  <View style={{flexDirection: 'row'}}>
                    <Text style={styles.userInfoTitle}>{translang.t('ACADEMIC_class')}</Text>
                    <Text style={{...styles.userInfoContent}}>{classlevel + "/" + room}</Text>
                  </View>
                  {isProductable && <>
                    <View style={{ height: 1, width: '100%', backgroundColor: Color.n_default_gray, marginTop: 10, }} />

                    <Text style={{...styles.textStyle1, textAlign: 'center', color: Color.n_default_gray, marginVertical: 5,}}>
                      {translang.t('TUITION_list')}
                    </Text>
                    {this.renderListProduct()}
                  </>}
                  <View style={{ height: 1, width: '100%', backgroundColor: Color.n_default_gray, marginTop: 10, }} />
                  <PlanItem
                    leftTxt={translang.t('SHOP_amount')}
                    rightTxt={feeData.totalprice}
                    cusleftTextStyle={{...styles.textStyle1, color: Color.n_default_gray, textAlign: 'center', marginTop: 10}}
                    cusrightTextStyle={{...styles.textStyle1, color: Color.n_button_gradient_green_start, textAlign: 'center', marginTop: 10}}
                    custextStyle={styles.bigitemText}
                  />
                  {invoices && 
                  <View>
                    <Text style={{...styles.textStyle1, textAlign: 'center', color: Color.n_default_gray, marginVertical: 5,}}>
                      {translang.t('TUITION_partialpaid')}
                    </Text>

                    {this.renderInvoices(false)}
                    
                    <View style={{ height: 1, width: '100%', backgroundColor: Color.n_default_gray, marginVertical: 3, }} />
                    <PlanItem
                      leftTxt={translang.t('TUITION_balance')}
                      rightTxt={'0'}
                      custextStyle={styles.bigitemText}
                      cusleftTextStyle={{...styles.textStyle1, color: Color.n_default_gray, textAlign: 'center', marginTop: 10}}
                      cusrightTextStyle={{...styles.textStyle1, color: Color.n_button_gradient_green_start, textAlign: 'center', marginTop: 10}}
                    />
                  </View>
                  }
                  <Text style={styles.paidText}>
                    {`${translang.t('PAYMENT_DUEDATE')} ${dueDate}`}
                  </Text>
                </View>
              </ViewShot>

              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <GradientButton 
                  label={translang.t('COMMON_cancel') } 
                  containerStyle={{...styles.buttonContainer, width: 100}}
                  buttonStyle={{borderRadius: 0}}
                  colors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                  textStyle={{fontSize: 24, fontWeight: 'bold'}}
                  isVerticalGradient={false}
                  _onPress={() => { this.setState({showDownloadModal: false})}} />  
                <GradientButton 
                  label={translang.t('DOWNLOAD') } 
                  containerStyle={{...styles.buttonContainer, width: 180}}
                  buttonStyle={{borderRadius: 0}}
                  colors={[Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]}
                  textStyle={{fontSize: 24, fontWeight: 'bold'}}
                  isVerticalGradient={false}
                  _onPress={() => { this.onDownloadReceipt()}} />
              </View>
              


            </ScrollView>
          </View>
        </Modal>
        }
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.n_background_white,

  },
  dispcontainer: {
    marginHorizontal: 15,
    marginVertical: 15,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,

    paddingHorizontal: 15,
  },

  modalDispcontainer: {
    paddingHorizontal: 15,
  },

  applogo:{
    width: 93,
    height: 55,
    marginTop: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    resizeMode: 'contain',
  },

  textStyle1: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold'
  },

  textStyle2: {
    fontFamily: 'THSarabunNew',
    fontSize: 18,
  },


  userInfoTitle:{
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.n_default_gray
  },

  userInfoContent:{
    flex: 1,
    fontFamily: 'THSarabunNew',
    fontSize: 18,
    color: Color.n_default_gray,
    marginLeft: 5,
  },

  itemText: {
    color: Color.n_default_gray,
    fontFamily: 'THSarabunNew',
    fontSize: 18,
  },

  bigitemText: {
    color: '#000',
    fontSize: '16@ms',
  },

  paidText: {
    fontFamily: 'THSarabunNew',
    width: '100%', 
    fontSize: 18, 
    color: Color.n_default_gray,
    textAlign: 'center', 
    marginVertical: 10,
  },
  overdueText: {
    fontFamily: 'THSarabunNew',
    width: '100%', 
    fontSize: 18, 
    color: Color.n_default_gray,
    textAlign: 'center', 
    marginVertical: 10,
  },

  buttonStyle: {
    width: '90%',
    height: 75,
    borderRadius: 38,
    backgroundColor: Color.n_button_gradient_green_start,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  itemIcon: {
    width: '25@ms',
    height: '25@ms',
  },
  uperCardChild: {
    flexDirection: 'row',
    marginHorizontal: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  
  itemActions: {
    width: 70,
    alignItems: 'flex-end',  
  },
  backbutton: {
    fontFamily: 'THSarabunNew',
    color: Color.white,
    textAlign: 'center',
    fontSize: 30,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000070',
  },
  dialogStyle: {
    width: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.25,
    elevation: 5,
    overflow: 'hidden',
    backgroundColor: 'white',
    
    marginTop: 70,
    marginBottom: 30,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  
  title:{
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Color.n_default_gray,
    
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'THSarabunNew',
    color: Color.n_default_gray,
    marginBottom: 20,
  },

  buttonContainer: {
    height: 60,    
    marginHorizontal: 10,
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
});
