import React, {Component,} from 'react';
import {StyleSheet, View, TextInput, Platform, TouchableOpacity, Image, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Color from '../constants/color';
import Images from '../themes/Images';

export default class CustomSwitcher extends Component {

  renderSwitchItem = ()=>{
    const {dataList, selectedIndex, textSize, showUnreadCnt, onChangedSwitch, radius} = this.props;
    var res = []
    for(let i = 0; i < dataList.length; i++){
      let item = dataList[i];
      let isSelected = false;
      if(i == selectedIndex){
        isSelected = true
      }
      let endStatus = 2;
      if(i == 0){
        endStatus = 0
      }else if(i == dataList.length - 1){
        endStatus = 1
      }

      res.push(
        <TouchableOpacity
          style={{...styles.itemContainer, backgroundColor: isSelected?Color.n_default_brown:Color.white, borderTopLeftRadius: endStatus==0?radius??0:0, borderBottomLeftRadius: endStatus==0?radius??0:0, borderTopRightRadius: endStatus==1?radius??0:0, borderBottomRightRadius: endStatus==1?radius??0:0}}
          key={i}
          onPress={() => {onChangedSwitch(i)}}>
            <View style={{flexDirection: 'row', paddingHorizontal: 5, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontSize: textSize?textSize:25, color: isSelected?Color.white:Color.n_default_orange, fontWeight: 'bold', textAlign: 'center'}}>{item.title}</Text>
              {showUnreadCnt && item.unreadCnt>0 &&
              <View
                style={{marginLeft: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: Color.n_default_orange, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}
                >
                <Text style={{fontSize: 14, color: Color.white, fontWeight: 'bold'}}>{item.unreadCnt}</Text>
              </View>}
            </View>
        </TouchableOpacity>
      );
    }
    return res;
  }

  render() {
    const {containerStyle, radius} = this.props;
    return (
      <View style={[styles.container, containerStyle, {borderRadius: radius??0}]}>
        {this.renderSwitchItem()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    backgroundColor: Color.white,
  },
  itemContainer: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
