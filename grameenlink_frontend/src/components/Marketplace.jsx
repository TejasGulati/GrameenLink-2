import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Marketplace = () => {
  const { user, fetchProducts, createOrder } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadProducts();
    }
  }, [user, fetchProducts]);

  const handleOrder = async (productId) => {
    try {
      await createOrder({
        product: productId,
        quantity: 1, // Default quantity
        retailer: user.id
      });
      alert('Order placed successfully!');
    } catch (err) {
      console.error('Order failed:', err);
      alert('Failed to place order');
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Marketplace</h2>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-lg mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold">₹{product.price_per_unit}/{product.unit}</span>
                {user.user_type === 'retailer' && (
                  <button 
                    onClick={() => handleOrder(product.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;