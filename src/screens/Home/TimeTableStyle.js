import {StyleSheet, Dimensions} from 'react-native';
import Color from '../../constants/color';

const {height, width} = Dimensions.get('window');
export default StyleSheet.create({
  constainer: {
    height,
    width,
    backgroundColor: Color.white,
    marginBottom: 40,
  },

  calendarContainer: {
    backgroundColor: Color.white,
    width: '100%',
    height: 140,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },


  bigContainer: {
    flex: 1,
    height: 70,
    marginVertical: 10,
    flexDirection: 'row',
    marginHorizontal: 5,
  },

  title2: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.black,
  },
  selectValueText: {
    width: '100%',
    height: 30,
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    backgroundColor: Color.white,
    borderColor: Color.n_default_gray,
    borderWidth: 1,
    borderRadius: 5,
    color: Color.n_default_gray,
    paddingHorizontal: 10,
    paddingTop: 3
  },





  daysContainer: {
    width,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,

    backgroundColor: Color.white,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  days: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  dateContainer: {
    height:35,
    width:35,
    borderRadius: 18,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',

  },

  activeDay: {
    height:35,
    width:35,
    borderRadius: 18,
    marginTop: 8,

    backgroundColor: 'rgb(254,188,126)',

    alignItems: 'center',
    justifyContent: 'center',
  },
  inActive:{
    height:35,
    width:35,
    borderRadius: 18,
    marginTop: 8,

    backgroundColor: Color.transparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLable: {
    fontFamily: 'THSarabunNew',
    fontSize: 25,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: Color.n_default_gray,

    marginTop: 10,
  },
  dayLable: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: Color.n_default_gray,
  },
  dateLabel: {
    fontFamily: 'THSarabunNew',
    fontSize: 28,
    fontWeight: 'bold',
  },
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor:'#fff',
    borderRadius:15,
    height: 'auto'
  },

  cardheader: {
    minHeight: 70,
    borderRadius: 15,
    backgroundColor: Color.n_default_brown,
    flexDirection: 'row',
    alignItems: 'center'
  },

  cardheaderitems: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  cardheaderitemstext: {
    fontFamily: 'THSarabunNew',
    fontSize: 20,
    color: Color.white
  },

  cardbody: {
    height: 142,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    flexDirection: 'column'
  },
  cardbodytextcontaienr: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  cardbodytext: {
    fontFamily: 'THSarabunNew',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },


  card_date: {
    fontSize: 25,
    marginVertical: 5,
    marginHorizontal: 10,
    color: Color.dark
  },
  readingtextStyle: {
    color: Color.white,
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'center',
  },
});
