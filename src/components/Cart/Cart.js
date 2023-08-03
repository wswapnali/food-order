import Modal from "../UI/Modal";
import classes from "./Cart.module.css";
import CartContext from "../../store/cart-context";
import CartItem from "./CartItem";
import { Fragment, useContext, useState } from "react";
import Checkout from "./Checkout";
const Cart = (props) => {
  const cartCtx = useContext(CartContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);
  const [isCheckOut, setIsCheckOut] = useState();
  const [errorMessage, setErrorMessage] = useState("");

  const cartItemRemoveHandler = (id) => {
    cartCtx.removeItem(id);
  };

  const cartItemAddHandler = (item) => {
    cartCtx.addItem({ ...item, amount: 1 });
  };

  const orderHandler = () => {
    setIsCheckOut(true);
  };

  const onCancelHandler = () => {
    setIsCheckOut(false);
  };

  const submitOrderHandler = async (userData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        "https://food-app-apis-default-rtdb.asia-southeast1.firebasedatabase.app/orders.json",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: userData,
            orderedItems: cartCtx.items,
          }),
        }
      );

      setIsSubmitting(false);
      setDidSubmit(true);

      if (!response.ok) {
        throw new Error("Something went wrong!");
      }
      cartCtx.clearCart();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const cartItems = (
    <ul className={classes["cart-items"]}>
      {cartCtx.items.map((item) => (
        <CartItem
          key={item.id}
          name={item.name}
          amount={item.amount}
          price={item.price}
          onRemove={cartItemRemoveHandler.bind(null, item.id)}
          onAdd={cartItemAddHandler.bind(null, item)}
        />
      ))}
    </ul>
  );

  const totalAmount = `$${cartCtx.totalAmount.toFixed(2)}`;

  const hasItems = cartCtx.items.length > 0;

  const modalActions = (
    <div className={classes.actions}>
      <button className={classes["button--alt"]} onClick={props.onClose}>
        Close
      </button>
      {hasItems && (
        <button className={classes.button} onClick={orderHandler}>
          Order
        </button>
      )}
    </div>
  );

  const cartModalContent = (
    <Fragment>
      {cartItems}
      <div className={classes.total}>
        <span>Total Amount</span>
        <span>{totalAmount}</span>
      </div>
      {isCheckOut && (
        <Checkout
          onCancel={onCancelHandler}
          onSubmitOrder={submitOrderHandler}
        />
      )}

      {!isCheckOut && modalActions}
    </Fragment>
  );

  const isSubmittingContent = (
    <Fragment>
      <p>Sending order data...</p>
    </Fragment>
  );

  const didSubmittingContent = (
    <Fragment>
      <p>Successfully sent the order!</p>
      <div className={classes.actions}>
        <button className={classes["button--alt"]} onClick={props.onClose}>
          Close
        </button>
      </div>
    </Fragment>
  );

  return (
    <Modal onClose={props.onClose}>
      {!errorMessage && !didSubmit && !isSubmitting && cartModalContent}
      {!errorMessage && !didSubmit && isSubmitting && isSubmittingContent}
      {!errorMessage && didSubmit && didSubmittingContent}
      {errorMessage && errorMessage}
    </Modal>
  );
};

export default Cart;
