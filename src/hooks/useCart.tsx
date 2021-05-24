import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const updateLocalStorage = (newCart: Product[]) => {
    localStorage.removeItem('@RocketShoes:cart');
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
  }

  const addProduct = async (productId: number) => {
    try {
      let tempCart = [...cart];
      const productStock = await api.get(`stock?id=${productId}`);
      const productAlreadyInCart = tempCart.findIndex(item => item.id === productId);
      const productAmount = productAlreadyInCart < 0 ? 1 : tempCart[productAlreadyInCart].amount + 1;
      if(productStock.data[0].amount >= productAmount) {
        if(productAlreadyInCart < 0) {
          const productDetails = await api.get(`products?id=${productId}`);
          productDetails.data[0].amount = 1;
          setCart([...tempCart, productDetails.data[0]])
        }
        else {
          const amount = 1;
          updateProductAmount({productId, amount});
        }
      }
      else {
        toast.error('Quantidade solicitada fora de estoque');
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productExists = cart.filter(item => item.id === productId);
      if(productExists.length){
        const newCart = cart.filter(item => item.id !== productId);
        setCart([...newCart]);
        updateLocalStorage(newCart);
      }
      else {
        toast.error('Erro na remoção do produto');
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const productStock = await api.get(`stock?id=${productId}`);
      if(!productStock.data.length) return;
      let tempCart = [...cart];
      const productAlreadyInCart = tempCart.findIndex(item => item.id === productId);
      const productIncrement = tempCart[productAlreadyInCart];
      productIncrement.amount += amount;
      tempCart = tempCart.filter(item => item.id !== productId);
      setCart([...tempCart, productIncrement]);
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
