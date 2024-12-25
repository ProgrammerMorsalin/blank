import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51P2GkSSEzW86D25YTF33BP83Rf4ffGJORl0gfTr3YBvpr5dejYm8bfO6hH3DYBu9saWy9TEDCUELfJNOW1S80rkG00SEhjrTCo', {
  apiVersion: '2022-11-15',
});

export default stripe;