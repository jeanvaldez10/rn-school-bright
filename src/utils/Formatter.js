class Formatter {
  secondsToMinutes(time) {
    if (time === 0) {
      return 'now';
    } else if (time === 1) {
      return time + ' second';
    } else if (time <= 60) {
      return time + ' seconds';
    } else {
      const min = Math.floor(time / 60);
      const sec = Math.floor(time % 60);
      const minString = min === 1 ? 'minute' : 'minutes';
      const secString = sec === 1 ? 'second' : 'seconds';
      if (sec === 0) {
        return `${min} ${minString}`;
      } else {
        return `${min} ${minString} ${sec} ${secString}`;
      }
    }
  }
}

export const formatter = new Formatter();
