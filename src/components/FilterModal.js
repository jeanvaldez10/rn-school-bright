import React, {useState, useEffect} from 'react';
import { StyleSheet, View, Text, Image, Modal, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import dimension from '../constants/dimension';
import Images from '../themes/Images';
import Color from '../constants/color';
import GradientButton from './GradientButton';
import LinearGradient from 'react-native-linear-gradient';
import CalendarModal from './CalendarModal';
import moment from 'moment';
import translang, { getCurrentLocale } from '../utils/language.utils';

const statusDropDownItems = [
    {
      label: translang.t('ALL'),
      value: '-1',
    },
    {
      label: translang.t('ON_TIME'),
      value: '0',
    },
    {
      label: translang.t('LATE'),
      value: '1',
    },
    {
      label: translang.t('ABSENCE'),
      value: '3',
    },
    {
      label: translang.t('HOLIDAY'),
      value: '8',
    },
    {
      label: translang.t('PERSONAL_LEAVE'),
      value: '10',
    },
    {
      label: translang.t('SICK_LEAVE'),
      value: '11',
    },
    {
      label: translang.t('EVENT'),
      value: '12',
    }
  ]

export default function FilterModal({
  isVisible,
  onClose,
  onOK,
  yearTermData,
}) {
  const [isStartDateModalShown, showStartDateModal] = useState(false);
  const [isEndDateModalShown, showEndDateModal] = useState(false);
  const [yearList, setYearList] = useState([]);
  const [termList, setTermList] = useState([]);
  const [year, setYear] = useState('');
  const [term, setTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('-1');

  useEffect(() => {
    let years = [];
    yearTermData.forEach(item => {
      if (!years.includes(item.YearNumber)) {
        years.push(item.YearNumber);
      }
    });

    setYearList(years);
    if (years.length > 0) {
      setYear(years[0]);
      onSelectYear(years[0]);
    }
  }, [yearTermData]);

  onSelectYear = (_year, index) => {
    let terms = [];
    let yearTermList = yearTermData.filter(item => item.YearNumber == _year);
    
    yearTermList.forEach(item => {
      if (!terms.includes(item.TermName)) {
        terms.push(item.TermName);
      }
    });

    setYear(_year);
    setTermList(terms);
    if (terms.length > 0) {
      setTerm(terms[0]);
      onSelectTerm(_year, terms[0], -1);
    }
  }

  onSelectTerm = (year, term, index) => {
    let yearTerm = [];

    if (index === -1) {
      yearTerm = yearTermData.filter(item => item.YearNumber == year);
    } else {
      yearTerm = yearTermData.filter(item => item.YearNumber == year && item.TermName == term);
    }
    
    setTerm(term);

    if (yearTerm.length > 0) {
      const startDate = yearTerm[0].dStart;
      const endDate = yearTerm[yearTerm.length - 1].dEnd;
      setStartDate(moment(startDate).format('YYYY-MM-DD'));
      setEndDate(moment(endDate).format('YYYY-MM-DD'));
    }
  }

  onSelectStatus = (status, index) => {
    const value = status.value;
    setStatus(parseInt(value));
  }

  onSelectStartDate = (date) => {
    if (date) {
      setStartDate(moment(date).format('YYYY-MM-DD'));
    }
    showStartDateModal(false);
  }

  onSelectEndDate = (date) => {
    if (date) {
      setEndDate(moment(date).format('YYYY-MM-DD'));
    }
    showEndDateModal(false);
  }

  _onOK = () => {
    onOK(startDate, endDate, status);
  }

  const yearDropDownItems = yearList.map((year,index) => { return {label: year.toString(), value: index.toString()} })
  let termDropDownItems = termList.map((term,index) => { return {label: term.toString(), value: index.toString()} })

  if (termDropDownItems.length > 1) {
    termDropDownItems = [{label: translang.t('ALL'), value: '-1'}].concat(termDropDownItems);
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      key="modal"
      visible={isVisible}>
      <View style={styles.centeredView}>
        <View style={styles.dialogStyle}>

          <TouchableOpacity style={{ width: '100%', padding: 5, alignItems: 'flex-end', justifyContent: 'flex-end' }} onPress={onClose} >
            <Image source={Images.close} style={styles.close_icon} />
          </TouchableOpacity>

          <DropDownPicker
            zIndex={5000}
            items={yearDropDownItems}
            defaultValue={'0'}
            containerStyle={styles.dropdownPickerContainer}
            style={styles.dropdownPicker}
            itemStyle={{ justifyContent: 'center' }}
            labelStyle={styles.dropdownPickerLabel}
            dropDownStyle={styles.dropDown}
            onChangeItem={item => {
              onSelectYear(item.label, parseInt(item.value));
            }}
          />

          <DropDownPicker
            zIndex={4000}
            items={termDropDownItems}
            defaultValue={'0'}
            containerStyle={styles.dropdownPickerContainer}
            style={styles.dropdownPicker}
            itemStyle={{ justifyContent: 'center' }}
            labelStyle={styles.dropdownPickerLabel}
            dropDownStyle={styles.dropDown}
            onChangeItem={item => {
              onSelectTerm(year, item.label, parseInt(item.value));
            }}
          />

          <TouchableOpacity
            style={[{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }, styles.rowContainer]}
            onPress={() =>{
              showStartDateModal(true);
            }}>
            <Text style={styles.dropdownPickerLabel}>
              {moment(startDate).format('DD/MM/YYYY')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }, styles.rowContainer]}
            onPress={() => {
              showEndDateModal(true);
            }}>
            <Text style={styles.dropdownPickerLabel}>
              {moment(endDate).format('DD/MM/YYYY')}
            </Text>
          </TouchableOpacity>

          <DropDownPicker
            zIndex={3000}
            items={statusDropDownItems}
            defaultValue={'0'}
            containerStyle={[styles.dropdownPickerContainer]}
            style={styles.dropdownPicker}
            itemStyle={{ justifyContent: 'center' }}
            labelStyle={styles.dropdownPickerLabel}
            dropDownStyle={styles.dropDown}
            onChangeItem={item => {
              onSelectStatus(item);
            }}
          />

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 10,}}>

            <TouchableOpacity
              onPress={() => _onOK()}
              style={styles.gradientBtn}>
              <LinearGradient
                style={[{
                  width: '100%',
                  height: 50,
                  borderWidth: 2,
                  borderRadius: 100,
                  borderColor: Color.transparent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={[Color.green_button_next_color1, Color.green_button_next_color2]}>
                <Text style={[styles.gradientBtnLabel,]}>{translang.t('COMMON_ok')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <CalendarModal
              isVisible={isStartDateModalShown}
              selectedDate={null}
              type={'single'}
              onDateSelect={result => {
                onSelectStartDate(result);
              }} />
            <CalendarModal
              isVisible={isEndDateModalShown}
              selectedDate={null}
              type={'single'}
              onDateSelect={result => {
                onSelectEndDate(result);
            }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000025',
  },
  dialogStyle: {
    width: '95%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 10,
  },
  close_icon: {
    width: 30,
    height: 30,
    marginBottom: 10,
  },
  dropdownPickerContainer: {
    width: '100%',
    height: 50,
    marginVertical: 5,
  },
  dropdownPicker: {
    backgroundColor: 'transparent',

    borderWidth: 2,
    borderColor: Color.green_button_next_color1,
    borderTopLeftRadius: 25, borderTopRightRadius: 25,
    borderBottomLeftRadius: 25, borderBottomRightRadius: 25,
    borderRadius: 25,

  },
  dropDown: {
    backgroundColor: Color.backgroundColor,
    borderBottomLeftRadius: 25, borderBottomRightRadius: 25

  },
  dropdownPickerLabel: {
    fontSize: 25,
    fontFamily: 'THSarabunNew',
    textAlign: 'center',
    color: Color.green_button_next_color1,
    fontWeight: 'bold',
  },
  rowContainer: {
    marginVertical: 5,
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderRadius: 100,
    borderColor: Color.green_button_next_color1
  },
  gradientBtn: {
    width: '100%',
    height: 50,
  },
  gradientBtnLabel: {
    fontSize: 25,
    fontWeight: 'bold',
    letterSpacing: 0,
    color: Color.white,
  },
});
