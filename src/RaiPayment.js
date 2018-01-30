import React, { Component } from 'react'
import {
  Alert,
  Animated,
  Clipboard,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import PropTypes from 'prop-types'

import BrainBlocksAPI from './BrainBlocksAPI'
import BrainBlocksPaymentDetails from './BrainBlocksPaymentDetails'

const windowSize = Dimensions.get('window')

// 1000 Rai = 0.001 XRB
class RaiPayment extends Component {

  constructor(props) {
    super(props)

    this.state = {
      bbPaymentDetails: {},
      indicatorAnimator: new Animated.Value(0),
      paymentAnimator: new Animated.Value(0),
      paymentInProgress: false,
      success: false,
    }

    this.state.paymentStyle = {
      height: this.state.paymentAnimator.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 250],
        extrapolate: 'clamp'
      })
    }

    this.state.indicatorStyle = {
      width: this.state.indicatorAnimator.interpolate({
        inputRange: [0, 1],
        outputRange: [0, windowSize.width - 40],
        extrapolate: 'clamp'
      }),
      backgroundColor: this.state.indicatorAnimator.interpolate({
        inputRange: [0, 0.4, 0.9, 1],
        outputRange: ['#4caf50', '#4caf50', '#ff9800', '#ff5252'],
        extrapolate: 'clamp'
      }),
    }
  }

  _initPayment = async () => {
    const {
      amount,
      destination,
    } = this.props

    const {
      paymentInProgress,
    } = this.state

    if (paymentInProgress) {
      Clipboard.setString(this._raiToXRB() + '')

      Alert.alert(
        '',
        'Payment amount copied to clipboard',
        [
          { text: 'OK' },
        ],
        { cancelable: false }
      )

      return
    }


    this.setState({
      success: false,
    })

    this._animatePaymentOpen()

    try {
      let bbPaymentDetails = await BrainBlocksAPI.startPaymentAsync(amount, destination)

      this.setState({
        bbPaymentDetails: bbPaymentDetails,
        paymentInProgress: true,
        paymentStart: new Date(),
      })

      this._verifyAsync(bbPaymentDetails.token)
    } catch (err) {
      this._onFailure(err.message)
    }
  }

  _verifyAsync = async (token) => {
    try {
      let verification = await BrainBlocksAPI.waitOnTransfer(token)
      this._onSuccess()
    } catch (err) {
      this._onFailure(err.message)
    }
  }

  _onFailure = (message) => {
    const {
      onFailure,
    } = this.props

    this._animatePaymentClosed()

    this.setState({
      paymentInProgress: false,
      success: false,
    })

    onFailure && onFailure(message)
  }

  _onSuccess = () => {
    const {
      onSuccess,
    } = this.props

    const {
      bbPaymentDetails,
    } = this.props

    this.setState({
      paymentInProgress: false,
      success: true,
    })

    onSuccess && onSuccess(bbPaymentDetails)
  }

  _animatePaymentClosed = () => {
    Animated.timing(this.state.indicatorAnimator, {
      toValue: 0,
      duration: 0
    }).start()

    Animated.spring(this.state.paymentAnimator, {
      toValue: 0,
      friction: 9
    }).start()
  }

  _animatePaymentOpen = () => {
    Animated.timing(this.state.indicatorAnimator, {
      toValue: 1,
      duration: 120 * 1000
    }).start()

    Animated.spring(this.state.paymentAnimator, {
      toValue: 1,
      friction: 9
    }).start()
  }

  _raiToXRB = () => {
    const {
      amount,
    } = this.props

    return ((amount || 0) / 1000000)
  }

  render() {

    const {
      bbPaymentDetails,
      indicatorStyle,
      paymentInProgress,
      paymentStart,
      paymentStyle,
      success,
    } = this.state

    const bbDestination = bbPaymentDetails.account

    return (
      <View style={styles.container}>

        <View>

          <Animated.View style={[styles.brainBlocksView, paymentStyle]}>
            <TouchableOpacity
              onPress={this._initPayment}
              style={styles.brainBlocksHeader}>
              <View style={styles.paymentTextView}>
                <Text style={styles.paymentText}>
                  Pay <Text style={styles.strongText}> {this._raiToXRB()} XRB</Text>
                </Text>
              </View>

              <View style={styles.paymentImageView}>
                <Image
                  source={require('../img/raiBlocks.png')}
                  style={styles.paymentImage}
                />
              </View>
            </TouchableOpacity>

            <BrainBlocksPaymentDetails
              bbDestination={bbDestination}
              indicatorStyle={indicatorStyle}
              paymentInProgress={paymentInProgress}
              paymentStart={paymentStart}
              success={success}
            />

          </Animated.View>

        </View>

      </View>
    )
  }
}


RaiPayment.propTypes = {
  amount: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
  onFailure: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  brainBlocksView: {
    borderRadius: 10,
    backgroundColor: '#eeeeee',
    overflow: 'hidden',
    width: windowSize.width - 40,
  },
  brainBlocksHeader: {
    minHeight: 50,
    height: 50,
    padding: 10,
    flexDirection: 'row',
  },
  paymentTextView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#cccccc',
  },
  strongText: {
    fontWeight: 'bold',
  },
  paymentImageView: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  paymentImage: {
    height: 30,
    width: 110,
    resizeMode: 'contain',
  },
})

export default RaiPayment
