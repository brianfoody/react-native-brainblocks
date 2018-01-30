const BrainBlocksAPI = {}

const _convertRaiToXRB = (rai) => {
  return rai / 1000000
}

/**
 * 
 * @param {double} amount 
 * @param {string} destination 
 */
BrainBlocksAPI.startPaymentAsync = async (amountInRai, destination) => {
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
  let responseJson = await response.json()

  if (responseJson.status === 'error') {
    throw new Error(responseJson.message || 'Payment failed.')
  }
  return responseJson
}

/**
 * 
 * @param {string} token 
 */
BrainBlocksAPI.verifyPayment = async (token) => {
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

/**
 * 
 * @param {double} currency 
 * @param {string} amount 
 */
BrainBlocksAPI.convertToRai = async (amount, currency) => {
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

/**
 * 
 * @param {string} token 
 */
BrainBlocksAPI.waitOnTransfer = async (token) => {
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