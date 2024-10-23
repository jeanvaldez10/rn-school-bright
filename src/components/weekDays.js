import React,{useState} from 'react';
import {Text, View,TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../screens/Home/TimeTableStyle';
import Color from '../constants/color';
import translang, { getCurrentLocale } from '../utils/language.utils';
//styles

const SelectedDays = (props) => {
  var days = [
    translang.t('Sunday_One'),
    translang.t('Monday_One'),
    translang.t('Tuesday_One'),
    translang.t('Wednesday_One'),
    translang.t('Thursday_One'),
    translang.t('Friday_One'),
    translang.t('Saturday_One'),
  ];

  const [selectedDate,setSelectedDate] = useState(null);

  if (selectedDate === null && props.selectedDate !== null) {
    setSelectedDate(props.selectedDate);
  }

  let onSelectDate = (date, index) => {
    if (props.onSelectDate !== undefined && props.onSelectDate !== null) {
      props.onSelectDate(date, index);
    }
    setSelectedDate(date);
  };

  const sat = props.currentDate;
  const diff = 6 - props.currentDate.getDay();
  sat.setDate(props.currentDate.getDate() + diff);

  const oneDay = 1000 * 60 * 60 * 24;
  const sun = new Date(sat.getTime() - 6 * oneDay);
  const mon = new Date(sat.getTime() - 5 * oneDay);
  const tue = new Date(sat.getTime() - 4 * oneDay);
  const wed = new Date(sat.getTime() - 3 * oneDay);
  const thu = new Date(sat.getTime() - 2 * oneDay);
  const fri = new Date(sat.getTime() - oneDay);
  
  const activeBackColor = [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end];
  const inactiveBackColor = [Color.transparent, Color.transparent];
  
  return (
    <View style={styles.daysContainer}>
      <View style={styles.days}>
        <TouchableOpacity onPress={()=>onSelectDate(sun, 6)}>
          <LinearGradient style={styles.dateContainer} colors={selectedDate?.getDate() === sun.getDate() ? activeBackColor : inactiveBackColor} >        
            <Text style={[styles.dateLabel, selectedDate?.getDate() === sun.getDate() ? {color:'#fff'} : {color: Color.n_default_gray,}]}>{days[sun.getDay()]}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.days}>
        <TouchableOpacity onPress={()=>onSelectDate(mon, 0)}>
          <LinearGradient style={styles.dateContainer} colors={selectedDate?.getDate() === mon.getDate() ? activeBackColor : inactiveBackColor} >
            <Text style={[styles.dateLabel, selectedDate?.getDate() === mon.getDate() ? {color:'#fff'} : {color: Color.n_default_gray,}]}>{days[mon.getDay()]}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.days}>
        <TouchableOpacity onPress={()=>onSelectDate(tue, 1)}>
          <LinearGradient style={styles.dateContainer} colors={selectedDate?.getDate() === tue.getDate() ? activeBackColor : inactiveBackColor} >
            <Text style={[styles.dateLabel, selectedDate?.getDate() === tue.getDate() ? {color:'#fff'} : {color: Color.n_default_gray,}]}>{days[tue.getDay()]}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.days}>
        <TouchableOpacity onPress={()=>onSelectDate(wed, 2)}>
          <LinearGradient style={styles.dateContainer} colors={selectedDate?.getDate() === wed.getDate() ? activeBackColor : inactiveBackColor} >
            <Text style={[styles.dateLabel, selectedDate?.getDate() === wed.getDate() ? {color:'#fff'} : {color: Color.n_default_gray,}]}>{days[wed.getDay()]}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.days}>
        <TouchableOpacity onPress={()=>onSelectDate(thu, 3)}>
          <LinearGradient style={styles.dateContainer} colors={selectedDate?.getDate() === thu.getDate() ? activeBackColor : inactiveBackColor} >
            <Text style={[styles.dateLabel, selectedDate?.getDate() === thu.getDate() ? {color:'#fff'} : {color: Color.n_default_gray,}]}>{days[thu.getDay()]}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.days}>
        <LinearGradient style={styles.dateContainer} colors={selectedDate?.getDate() === fri.getDate() ? activeBackColor : inactiveBackColor} >
          <TouchableOpacity onPress={()=>onSelectDate(fri, 4)}>
            <Text style={[styles.dateLabel, selectedDate?.getDate() === fri.getDate() ? {color:'#fff'} : {color: Color.n_default_gray,}]}>{days[fri.getDay()]}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
      <View style={styles.days}>
        <TouchableOpacity onPress={()=>onSelectDate(sat, 5)}>
          <LinearGradient style={styles.dateContainer} colors={selectedDate?.getDate() === sat.getDate() ? activeBackColor : inactiveBackColor} >
            <Text style={[styles.dateLabel, selectedDate?.getDate() === sat.getDate() ? {color:'#fff'} : {color: Color.n_default_gray,}]}>{days[sat.getDay()]}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SelectedDays
