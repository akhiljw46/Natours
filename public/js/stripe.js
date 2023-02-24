/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51MeiYhSJqvcQSv0Fnc7Q76mch3psYj8agEuGnOdVq5957TvobEt4TgXoWGYE3EYIcTkEl1PHJ6Ljj9Br2xwPxh3w00epAzCTj0'
    );
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + change credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
