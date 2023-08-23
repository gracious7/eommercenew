import { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  deleteItemFromCartAsync,
  selectCartLoaded,
  selectCartStatus,
  selectItems,
  updateCartAsync,
  deleteAllItemsFromCartAsync,
} from './cartSlice';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { Grid } from 'react-loader-spinner';
import Modal from '../common/Modal';
import { Toaster, toast } from 'react-hot-toast';

export default function Cart() {
  const dispatch = useDispatch();

  const items = useSelector(selectItems);
  const status = useSelector(selectCartStatus);
  const cartLoaded = useSelector(selectCartLoaded)
  const [openModal, setOpenModal] = useState(null);

  // const totalAmount = items.reduce(
    
  //   (amount, item) => Math.round(item.product.price*(1-item.product.discountPercentage/100)) * item.quantity + amount,
  //   0
  // );

  const handleDeleteAllItems = () => { 
    dispatch(deleteAllItemsFromCartAsync()); // Dispatch the action to delete all items 
  };


  //checking tax
  const calculateTaxRate = (item) => {
    if (item.product.type === "product") {
      if (item.product.price > 1000 && item.product.price <= 5000) {
        return 0.12; // PA
      } else if (item.product.price > 5000) {
        return 0.18; // PB
      }
      else{
        return 0.35;
      }
    } else if (item.product.type === "service") {
      if (item.product.price > 1000 && item.product.price <= 8000) {
        return 0.1; // SA
      } else if (item.product.price > 8000) {
        return 0.15; // SB
      }
      else{
        return 0.35;
      }
    }
    return 0; // Default tax rate
  };

  const totalAmountbeforetax = items.reduce(
    (amount, item) => 
      item.product ? 
      Math.round(item.product.price * (1 - item.product.discountPercentage / 100)) * item.quantity + amount : 
      amount,
    0
  );
  
    //calculating total amount after tax
  const totalAmount = items.reduce(
    (amount, item) => {
      const taxRate = calculateTaxRate(item);
      const priceAfterDiscount = Math.round(item.product.price * (1 - item.product.discountPercentage / 100));
      const itemTotal = priceAfterDiscount * item.quantity * (1 + taxRate);
      return (itemTotal + amount);
    },
    0
  );
  
  //tax price
  const taxprice = items.reduce(
    (amount, item) => {
      const taxRate = calculateTaxRate(item);
      const priceAfterDiscount = Math.round(item.product.price * (1 - item.product.discountPercentage / 100));
      const itemTotal = priceAfterDiscount * item.quantity * ( taxRate);
      return itemTotal;
    },
    0
  );

  
  const totalItems = items.reduce((total, item) => item.quantity + total, 0);

  const handleQuantity = (e, item) => {
    dispatch(updateCartAsync({id:item.id, quantity: +e.target.value }));
  };

  const handleRemove = (e, id) => {
    dispatch(deleteItemFromCartAsync(id));
  };

  return (
    <>
    <Toaster/>
      {!items.length && cartLoaded && <Navigate to="/" replace={true}></Navigate>}

      <div>
        <div className="mx-auto mt-12 bg-white max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
            <h1 className="text-4xl my-5 font-bold tracking-tight text-gray-900">
              Cart
            </h1>
            <div className="flow-root">
              {status === 'loading' ? (
                <Grid
                  height="80"
                  width="80"
                  color="rgb(79, 70, 229) "
                  ariaLabel="grid-loading"
                  radius="12.5"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              ) : null}
              <ul className="-my-6 divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="flex py-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        // src={item.product.thumbnail}
                        src={item.product?.thumbnail}

                        alt={item.product?.title}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>
                            <a href={item.product?.id}>{item.product.title}</a>
                          </h3>
                           
                          <p className="ml-4">Rs.{Math.round(item.product.price*(1-item.product.discountPercentage/100))}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.product.brand}
                        </p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="text-gray-500">
                          <label
                            htmlFor="quantity"
                            className="inline mr-5 text-sm font-medium leading-6 text-gray-900"
                          >
                            Qty
                          </label>
                          <select
                            onChange={(e) => handleQuantity(e, item)}
                            value={item.quantity}
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                        </div>

                        <div className="flex">
                          <Modal
                            title={`Delete ${item.product.title}`}
                            message="Are you sure you want to delete this Cart item ?"
                            dangerOption="Delete"
                            cancelOption="Cancel"
                            dangerAction={(e) => handleRemove(e, item.id)}
                            cancelAction={()=>setOpenModal(null)}
                            showModal={openModal === item.id}
                          ></Modal>
                          <button
                            onClick={e=>{setOpenModal(item.id)}}
                            type="button"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
            <div className="flex justify-between my-2 text-base font-medium text-gray-900">
              <p>Subtotal</p>
              <p>Rs. {totalAmountbeforetax} </p>
              
            </div>
            <div className="flex justify-between my-2 text-base font-medium text-gray-900">
              <p>Total Tax</p>
              <p>Rs. {taxprice} </p>
              
            </div>
            <div className="flex justify-between my-2 text-base font-medium text-gray-900">
              <p>Total Amount After Tax</p>
              <p>Rs. {totalAmount}</p>
              
            </div>
            <div className="flex justify-between my-2 text-base font-medium text-gray-900">
              <p>Total Items in Cart</p>
              <p>{totalItems} items</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="mt-6">
              <Link
                to="/checkout"
                className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Checkout
              </Link>
            </div>
            <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
              <p>
                or
                <Link to="/">
                  <button
                    type="button"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Continue Shopping
                    <span aria-hidden="true"> &rarr;</span>
                  </button>
                </Link>
              <div className="mt-6 flex justify-center text-center text-sm text-gray-500"> 
                <p> 
                  <button 
                    type="button" 
                    className="font-medium text-red-600 hover:text-red-500" 
                    onClick={handleDeleteAllItems} // Add the click handler 
                  > 
                    Delete Entire Cart 
                  </button> 
                </p> 
              </div>
              </p>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}