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
// refatorar o add product e o update product... eles devem estar estorando os testes...
  const addProduct = async (productId: number) => {
    try {
      await api.get(`/stock?id=${productId}`).then(async response => {
        const {amount} = response.data[0];
        if(amount <= 0) return toast.error('Quantidade solicitada fora de estoque');
        const alreadyInCart = cart.find(item => item.id === productId);
        if (alreadyInCart) return updateProductAmount({productId, amount});
        await api.get(`/products?id=${productId}`).then(response => {
          console.log('produto', response.data);
          let newProduct = response.data[0];
          newProduct.amount = 1;
          setCart([...cart, newProduct]);
        });
      });
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
      if(amount <= 0) return toast.error('Quantidade solicitada fora de estoque');

      const newCart = cart.filter(item => item.id !== productId);
      const productToUpdate = cart.filter(item => item.id === productId);
      productToUpdate[0].amount += 1 ;
      setCart([...newCart, ...productToUpdate]);
    } catch {
      return toast.error('Erro na alteração de quantidade do produto');
    }
  };

  useEffect(() => {
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


