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
  const [stock, setStock] = useState<Stock[]>([]);

  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
        await api.get(`/stock?id=${productId}`).then(async response => {
          let amount = response.data[0].amount;
          if(amount) {
            await api.get(`/products?id=${productId}`).then(response => {
              let newProduct = response.data[0];
              const alreadyInCart = cart.find(item => item.id === newProduct.id);

              if(alreadyInCart){
                updateProductAmount({productId, amount})
              }
              else {
                newProduct.amount = 1;
                setCart([...cart, newProduct]);
              }
              
            });
          }
          else {
            toast.error('Quantidade solicitada fora de estoque');
          }
        });
        console.log('cart', cart);
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // if(amount){
      //   const product = cart.find(item => item.id === productId);

      //   if(product?.amount){
      //     product?.amount = product?.amount + 1;
      //   }
      //   product?.amount++;  
      //   console.log('incrmenetar esse produto', product);
      // }
    } catch {
      return toast.error('Erro na alteração de quantidade do produto');
    }
  };

  useEffect(() => {
    console.log('salvo no localstore');
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
  }, [cart]);

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


