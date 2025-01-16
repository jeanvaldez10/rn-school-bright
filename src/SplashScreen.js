import {Component} from 'react';
import {
    LogBox,
} from 'react-native';

LogBox.ignoreAllLogs(true); //Ignore all log notifications

class SplashScreen extends Component {
    isMounted = false;

    componentDidMount() {
        this.props.navigation.navigate('AuthLoading');
    }

    componentWillUnmount() {
    }

    render() {
        return null;
    }
}

export default SplashScreen;