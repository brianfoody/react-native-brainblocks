const BrainBlocksAPI = {}

/**
 * 
 * @param {*} paymentDetails 
 */
BrainBlocksAPI.startPaymentAsync = async (amount, destination) => {
  const details = {
    amount: amount,
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
 * @param {*} token 
 */
BrainBlocksAPI.verifyPayment = async (token) => {
  let response = await fetch(`https://brainblocks.io/api/session/${token}/verify`, options)
  let responseJson = await response.json()
  return responseJson
}

BrainBlocksAPI.waitOnTransfer = async (token) => {
  const options = {
    method: 'post',
  }

  let response = await fetch(`https://brainblocks.io/api/session/${token}/transfer`, options)
  let responseJson = await response.json()

  return responseJson
}

export default BrainBlocksAPI