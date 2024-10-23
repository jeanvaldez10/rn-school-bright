import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');
let max;
if (width < height) {
  max = height;
} else {
  max = width;
}
const multiplier = max / 400;

export default {
  px5: 5 * multiplier,
  px8: 8 * multiplier,
  px20: 20 * multiplier,
  px40: 40 * multiplier,
  px140: 140 * multiplier,
  px150: 150 * multiplier,
  px180: 180 * multiplier,
};
