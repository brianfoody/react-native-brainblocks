import React, { Component } from 'react'
import {
  StyleSheet,
  View,
} from 'react-native'

// 1000 Rai = 0.001 XRB
import RaiPayment from './src/RaiPayment'

export default class Demo extends Component {

  state = {
    destination: 'xrb_3uwehdksj643ngheidkpq5gyz9khutfse8ihbjey7yub5fatkqciukrmwz63',
    amount: 1000,
    currency: 'rai',
  }

  _onSuccess = (details) => {
    let sampleUrl = 'https://brainblocks.io/api/session/${token}/verify'
    window.alert(`
      I should now verify serverside with this token ${details.token}.
      i.e. ${sampleUrl}
    `)
  }

  _onFailure = (message) => {
    window.alert(`Payment failed: ${message}`)
  }

  render() {
    return (
      <View style={styles.container}>
        <RaiPayment
          amount={this.state.amount}
          autoplay={true}
          currency={this.state.currency}
          destination={this.state.destination}
          onFailure={this._onFailure}
          onSuccess={this._onSuccess}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
})
