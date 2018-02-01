import React, { Component } from 'react'
import {
  ActivityIndicator,
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

// 1 Rai = 0.000001 XRB
class NanoPayment extends Component {

  constructor(props) {
    super(props)

    this.state = {
      bbPaymentDetails: {},
      computingAmount: true,
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

    this._calcXRB()
  }

  _calcXRB = async () => {
    const {
      amount,
      autostart,
      currency,
    } = this.props

    const cryptoValue = await BrainBlocksAPI.convertToRai(amount, currency)

    this.setState({
      computingAmount: false,
      amountInRai: cryptoValue.rai,
      amountInXRB: cryptoValue.xrb,
    })

    if (autostart) {
      this._initPayment(cryptoValue.rai, cryptoValue.xrb)
    }
  }

  _tapPaymentInit = () => {
    const {
      amountInRai,
      amountInXRB,
    } = this.state

    this._initPayment(amountInRai, amountInXRB)
  }

  _initPayment = async (amountInRai, amountInXRB) => {
    const {
      destination,
    } = this.props

    const {
      paymentInProgress,
    } = this.state

    if (paymentInProgress) {
      Clipboard.setString(amountInXRB + '')

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

    this._animatePaymentOpen()

    try {
      let bbPaymentDetails = await BrainBlocksAPI.startPaymentAsync(amountInRai, destination)

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
      this._onFailure()
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
    } = this.state

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

  render() {
    const {
      amountInRai,
      amountInXRB,
      bbPaymentDetails,
      computingAmount,
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
              onPress={this._tapPaymentInit}
              style={styles.brainBlocksHeader}>
              <View style={styles.paymentTextView}>
                {
                  computingAmount
                    ?
                    <View style={styles.paymentCalcView}>

                      <Text style={styles.paymentCalcText}>
                        Finding price in XRB
                      </Text>
                      <ActivityIndicator
                        size='small'
                        color='#6ccef5'
                      />
                    </View>
                    :
                    <Text style={styles.paymentText}>
                      Pay <Text style={styles.strongText}> {amountInXRB} XRB</Text>
                    </Text>
                }
              </View>

              <View style={styles.paymentImageView}>
                <Image
                  source={require('../img/logo.png')}
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


NanoPayment.propTypes = {
  amount: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
  onFailure: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  autostart: PropTypes.bool,
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
  paymentCalcView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',//flex-end',
    justifyContent: 'center',
  },
  paymentCalcText: {
    fontSize: 12,
    paddingRight: 5,
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

export default NanoPayment
