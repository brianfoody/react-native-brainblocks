// @flow

const BrainBlocksAPI = {}

const _convertRaiToXRB = (rai: number): number => {
  return rai / 1000000
}

type SessionSuccessType = {|
  status: 'success',
  token: string,
  account: string,
|};

type SessionErrorType = {|
  status: 'error',
  message: string,
  uuid: string,
|};

export type SessionResultsType = SessionSuccessType | SessionErrorType;

/**
 * 
 * @param {double} amount 
 * @param {string} destination 
 */
BrainBlocksAPI.startPaymentAsync = async (amountInRai: number, destination: string): Promise<SessionSuccessType> => {
  const details = {
    amount: amountInRai,
    destination: destination,
  }

  const headers = new Headers()
  headers.set("Content-Type", "application/x-www-form-urlencoded")

  let formBody = []
  for (var property in details) {
    var encodedKey = encodeURIComponent(property)
    var encodedValue = encodeURIComponent(details[property])
    formBody.push(encodedKey + "=" + encodedValue)
  }
  formBody = formBody.join("&")

  const options = {
    method: 'post',
    headers: headers,
    body: formBody
  }

  let response = await fetch('https://brainblocks.io/api/session', options)
  let responseJson: SessionResultsType = await response.json()

  if (responseJson.status === 'error') {
    throw new Error(responseJson.message || 'Payment failed.')
  }
  return responseJson
}

type VerifyPaymentSuccessType = any;

/**
 * 
 * @param {string} token 
 */
BrainBlocksAPI.verifyPayment = async (token: string): Promise<VerifyPaymentSuccessType> => {
  const options = {
    method: 'get',
  }

  let response = await fetch(`https://brainblocks.io/api/session/${token}/verify`, options)
  let responseJson = await response.json()

  if (responseJson.status === 'error') {
    throw new Error(responseJson.message || 'Payment failed.')
  }

  return responseJson
}

type ExchangeSuccessType = {|
  status?: 'success',
  rai: number,
  xrb: number,
|}

/**
 * 
 * @param {double} currency 
 * @param {string} amount 
 */
BrainBlocksAPI.convertToRai = async (amount: number, currency: string): Promise<ExchangeSuccessType> => {
  const options = {
    method: 'get',
  }

  if (currency === 'rai') {
    return {
      rai: amount,
      xrb: _convertRaiToXRB(amount)
    }
  }

  let response = await fetch(`https://brainblocks.io/api/exchange/${currency}/${amount}/rai`, options)
  let responseJson = await response.json()

  if (responseJson.status === 'error') {
    throw new Error(responseJson.message || 'Payment failed.')
  }

  return {
    rai: responseJson.rai,
    xrb: _convertRaiToXRB(responseJson.rai),
  }
}

type TransferSuccessType = any;

/**
 * 
 * @param {string} token 
 */
BrainBlocksAPI.waitOnTransfer = async (token: string): Promise<TransferSuccessType> => {
  const options = {
    method: 'post',
  }

  let response = await fetch(`https://brainblocks.io/api/session/${token}/transfer`, options)
  let responseJson = await response.json()

  if (responseJson.status === 'error') {
    throw new Error(responseJson.message || 'Payment failed.')
  }

  return responseJson
}

export default BrainBlocksAPI
