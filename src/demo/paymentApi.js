import { wait } from './utils'

// Real Razorpay/Stripe handshake happens once the backend's
// PaymentGatewayService exists (see the project plan, Phase 7). In demo
// mode, checkout already marks orders "Paid" immediately for non-COD
// methods (see demo/ordersApi.js), so these just simulate success.
const paymentApi = {
  async createOrder(orderId, gateway) {
    await wait(300)
    return { orderId, gateway, gatewayOrderId: `demo_pay_${orderId}`, status: 'created' }
  },

  async verify() {
    await wait(300)
    return { success: true, status: 'PAID' }
  },
}

export default paymentApi
