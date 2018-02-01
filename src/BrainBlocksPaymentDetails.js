import React, { Component } from 'react';
import {
  Alert,
  Animated,
  ActivityIndicator,
  Clipboard,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import PropTypes from 'prop-types';

import QRCode from 'react-native-qrcode';

const windowSize = Dimensions.get('window');

class BrainBlocksPaymentDetails extends Component {
  state = {
    timeNow: new Date(),
  };

  componentDidMount() {
    setInterval(() => {
      this.setState({
        timeNow: new Date(),
      });
    }, 1000);
  }

  _copyAddress = () => {
    const { bbDestination } = this.props;

    Clipboard.setString(bbDestination);

    Alert.alert('', 'Payment address copied to clipboard', [{ text: 'OK' }], {
      cancelable: false,
    });
  };

  _timeLeft = () => {
    const { paymentStart } = this.props;

    const { timeNow } = this.state;

    const diffInTime = timeNow.getTime() - paymentStart.getTime();
    const diffInSeconds = Math.round(diffInTime / 1000);
    const timeLeft = 120 - diffInSeconds;
    return Math.max(0, timeLeft);
  };

  render() {
    const {
      bbDestination,
      indicatorStyle,
      paymentInProgress,
      success,
    } = this.props;

    if (success) {
      return (
        <View style={styles.centeredPaymentDetailsView}>
          <Image
            source={require('../img/success.png')}
            style={styles.successImage}
          />
          <Text>Payment successful!</Text>
        </View>
      );
    } else if (paymentInProgress) {
      const timeLeft = this._timeLeft();
      return (
        <TouchableOpacity
          onPress={this._copyAddress}
          style={styles.paymentDetailsView}
        >
          <View style={styles.qrCodeView}>
            <QRCode
              value={bbDestination}
              size={100}
              bgColor="black"
              fgColor="#eeeeee"
            />
          </View>

          <View style={styles.paymentAddressView}>
            <Text style={styles.paymentAddressText}>{bbDestination}</Text>
          </View>

          <View style={styles.progressIndicatorView}>
            <Animated.View style={[styles.progressIndicator, indicatorStyle]} />
          </View>

          <Text style={styles.countdownText}>{`${timeLeft}s remaining`}</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={styles.centeredPaymentDetailsView}>
          <ActivityIndicator size="large" color="#6ccef5" />
        </View>
      );
    }
  }
}

BrainBlocksPaymentDetails.propTypes = {
  bbDestination: PropTypes.string,
  paymentInProgress: PropTypes.bool,
  success: PropTypes.bool,
  indicatorStyle: PropTypes.any,
};

const styles = StyleSheet.create({
  centeredPaymentDetailsView: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentDetailsView: {
    marginVertical: 10,
    height: 200,
    alignItems: 'center',
  },
  qrCodeView: {},
  paymentAddressView: {
    paddingHorizontal: 15,
    padding: 10,
    paddingBottom: 0,
  },
  paymentAddressText: {
    textAlign: 'center',
    fontSize: 13,
  },
  progressIndicatorView: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  progressIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    marginVertical: 5,
    height: 10,
    borderRadius: 3,
  },
  countdownText: {
    marginTop: 20,
    fontSize: 13,
  },
  successImage: {
    height: 100,
    width: 100,
  },
});

export default BrainBlocksPaymentDetails;
