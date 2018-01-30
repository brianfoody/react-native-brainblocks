
# react-native-brainblocks

## Getting started

`$ npm install react-native-brainblocks --save`

## Usage
```javascript
import RaiPayment from 'react-native-brainblocks';

<RaiPayment
	amount={1000}
	currency='rai'
	destination='xrb_123...'
	onFailure={this._onFailure}
	onSuccess={this._onSuccess}
/>
```

  

# TODO
1) Payments in currencies. Only Rai accepted so far