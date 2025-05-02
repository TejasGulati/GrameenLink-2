import React from 'react';
import {
  X, Loader, AlertCircle, Check, Star, Package, ShoppingCart,
  ClipboardList, Tag, TrendingUp, BarChart, AlertTriangle,
  TextCursorInput, ShieldCheck, CheckCircle, Clock, User,
  Truck, Calendar, CreditCard, FileText, ChevronDown, Sliders,
  Plus, ShoppingBag, Sparkles, ArrowUp, ArrowDown, LineChart,
  ChevronRight, ChevronLeft, Box, Percent, Package2, Tags,
  ClipboardCheck, ListChecks, StarHalf, FileEdit, FileSearch,
  FileClock, FileInput, FileOutput, FileArchive, FileBarChart2,
  FileSpreadsheet, FileKey, FileWarning, FileDiff, FilePlus,
  FileMinus, FileX, FileUp, FileDown, FileStack, FileDigit,
  FileHeart, FileJson, FileTerminal, FileImage, FileVideo,
  FileAudio, FileCode, FileSymlink, FileVolume2, FileScan
} from 'lucide-react';

import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { formatCurrency, statusBadge, formatDate, formatDateTime } from './MarketplaceUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MarketplaceModals = ({
  showModal, setShowModal, selectedItem, formData, setFormData,
  data, loading, errors, handleSubmit, handleDelete, aiResult, user,
  activeTab, handleAI
}) => {
  const renderProductForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            value={formData.name || ''}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            value={formData.category_id || ''}
            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
          >
            <option value="">Select Category</option>
            {data.categories?.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit*</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            value={formData.price_per_unit || ''}
            onChange={(e) => setFormData({...formData, price_per_unit: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit*</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            value={formData.cost_per_unit || ''}
            onChange={(e) => setFormData({...formData, cost_per_unit: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available Quantity*</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            value={formData.available_quantity || ''}
            onChange={(e) => setFormData({...formData, available_quantity: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit*</label>
          <select
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            value={formData.unit || 'kg'}
            onChange={(e) => setFormData({...formData, unit: e.target.value})}
            required
          >
            <option value="kg">Kilogram</option>
            <option value="g">Gram</option>
            <option value="l">Liter</option>
            <option value="ml">Milliliter</option>
            <option value="pc">Piece</option>
            <option value="box">Box</option>
            <option value="pack">Pack</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Quantity*</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            value={formData.min_order_quantity || 1}
            onChange={(e) => setFormData({...formData, min_order_quantity: e.target.value})}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          rows={4}
          value={formData.description || ''}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          value={formData.tags?.join(', ') || ''}
          onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(tag => tag.trim())})}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          checked={formData.is_active !== false}
          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Active Product
        </label>
      </div>

      {selectedItem && (
        <div className="pt-4 border-t">
          <button
            onClick={() => handleAI('description')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            <Sparkles size={16} />
            Generate AI Description
          </button>
        </div>
      )}
    </div>
  );

  const renderProductDetails = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center shadow-inner">
            {selectedItem.image ? (
              <img 
                src={selectedItem.image} 
                alt={selectedItem.name} 
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <Package className="text-gray-400" size={48} />
            )}
          </div>
        </div>
        
        <div className="w-full md:w-2/3 space-y-4">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {selectedItem.name}
            </h3>
            <p className="text-gray-600">{selectedItem.category?.name || 'Uncategorized'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: 'Price',
                value: formatCurrency(selectedItem.price_per_unit),
                icon: <Tag size={18} className="text-indigo-500" />,
                unit: `per ${selectedItem.unit}`
              },
              {
                label: 'Available Stock',
                value: selectedItem.available_quantity,
                icon: <Package2 size={18} className="text-emerald-500" />,
                unit: selectedItem.unit
              },
              {
                label: 'Min Order',
                value: selectedItem.min_order_quantity,
                icon: <ClipboardCheck size={18} className="text-amber-500" />,
                unit: selectedItem.unit
              },
              {
                label: 'Rating',
                value: selectedItem.rating?.toFixed(1) || 'N/A',
                icon: <StarHalf size={18} className="text-yellow-500 fill-yellow-500" />,
                unit: ''
              }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  {item.icon} {item.label}
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-semibold">{item.value}</p>
                  {item.unit && <span className="text-sm text-gray-500">{item.unit}</span>}
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Distributor</p>
            <p className="font-medium">{selectedItem.distributor?.company || selectedItem.distributor?.name}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Status</p>
            {statusBadge(selectedItem.is_active ? 'active' : 'inactive', 'product')}
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Description</h4>
        <div 
          className="prose max-w-none bg-gray-50 p-4 rounded-lg" 
          dangerouslySetInnerHTML={{ __html: selectedItem.description || 'No description provided' }}
        />
      </div>
      
      {selectedItem.tags?.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {selectedItem.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {data.priceHistory?.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Price History</h4>
          <div className="h-64">
            <Line
              data={{
                labels: data.priceHistory.map(item => formatDate(item.change_date)),
                datasets: [{
                  label: 'Price per Unit',
                  data: data.priceHistory.map(item => item.new_price),
                  borderColor: 'rgb(79, 70, 229)',
                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  tension: 0.1,
                  borderWidth: 2
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const data = data.priceHistory[context.dataIndex];
                        const change = ((data.new_price - data.old_price) / data.old_price * 100).toFixed(2);
                        return [
                          `Price: ${formatCurrency(context.raw)}`,
                          `Change: ${change}%`,
                          `Reason: ${data.reason || 'N/A'}`
                        ];
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  }
                }
              }}
            />
          </div>
          <div className="mt-4 space-y-2">
            {data.priceHistory.slice(0, 5).map((history, i) => (
              <div key={i} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="text-sm">{formatDate(history.change_date)}</p>
                  <p className="text-xs text-gray-500">{history.reason || 'No reason provided'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(history.new_price)}</p>
                  <p className={`text-xs flex items-center justify-end ${
                    history.new_price > history.old_price ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {history.new_price > history.old_price ? (
                      <ArrowUp size={14} className="inline" />
                    ) : (
                      <ArrowDown size={14} className="inline" />
                    )}
                    {Math.abs(((history.new_price - history.old_price) / history.old_price * 100).toFixed(2))}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.productReviews?.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Product Reviews</h4>
          <div className="space-y-4">
            {data.productReviews.map((review) => (
              <div key={review.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        by {review.retailer?.name}
                      </span>
                    </div>
                    {review.review && (
                      <p className="mt-2 text-sm">{review.review}</p>
                    )}
                  </div>
                  {review.is_approved ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Approved
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderOrderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={formData.status || 'pending'}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
          <select
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={formData.payment_status || 'pending'}
            onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
          >
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address*</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          rows={3}
          value={formData.delivery_address || ''}
          onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          rows={2}
          value={formData.delivery_notes || ''}
          onChange={(e) => setFormData({...formData, delivery_notes: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          rows={2}
          value={formData.notes || ''}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      {!selectedItem && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
          <div className="space-y-3">
            {formData.items?.map((item, index) => (
              <div key={index} className="border p-3 rounded-md bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{item.product?.name}</span>
                  <button 
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      items: prev.items.filter((_, i) => i !== index)
                    }))}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      min={item.product?.min_order_quantity || 1}
                      step="0.01"
                      className="w-full px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      value={item.quantity}
                      onChange={(e) => setFormData(prev => {
                        const newItems = [...prev.items];
                        newItems[index].quantity = e.target.value;
                        return {...prev, items: newItems};
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Price</label>
                    <div className="text-sm">
                      {formatCurrency(item.product?.price_per_unit || 0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowModal('addOrderItem')}
              className="w-full py-2 border border-dashed border-gray-300 rounded-md hover:bg-gray-50 text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrderDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <User size={16} /> Retailer Info
          </h4>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{selectedItem.retailer?.name}</p>
            <p className="text-gray-600">{selectedItem.retailer?.email}</p>
            <p className="text-gray-600">{selectedItem.retailer?.phone}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Truck size={16} /> Delivery Info
          </h4>
          <div className="space-y-1 text-sm">
            <p className="font-medium">Address</p>
            <p className="text-gray-600">{selectedItem.delivery_address}</p>
            {selectedItem.delivery_notes && (
              <>
                <p className="font-medium mt-2">Notes</p>
                <p className="text-gray-600">{selectedItem.delivery_notes}</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CreditCard size={16} /> Payment Info
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              {statusBadge(selectedItem.payment_status, 'payment')}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Method:</span>
              <span className="font-medium">{selectedItem.payment_method || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-medium">{selectedItem.transaction_id || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">{formatCurrency(selectedItem.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <FileText size={16} /> Order Items
        </h4>
        <div className="border rounded-md overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.orderItems?.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      {item.product?.image && (
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-8 h-8 mr-2 object-contain"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">{item.product?.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {item.quantity} {item.product?.unit}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {formatCurrency(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  Subtotal
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {formatCurrency(selectedItem.total_amount - (selectedItem.tax_amount || 0) - (selectedItem.discount_amount || 0))}
                </td>
              </tr>
              {selectedItem.tax_amount > 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Tax
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {formatCurrency(selectedItem.tax_amount)}
                  </td>
                </tr>
              )}
              {selectedItem.discount_amount > 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Discount
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">
                    -{formatCurrency(selectedItem.discount_amount)}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  Total
                </td>
                <td className="px-4 py-3 text-sm font-bold">
                  {formatCurrency(selectedItem.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Calendar size={16} /> Order Timeline
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium">
                {formatDateTime(selectedItem.order_date)}
              </span>
            </div>
            {selectedItem.delivery_date && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Date:</span>
                <span className="font-medium">
                  {formatDateTime(selectedItem.delivery_date)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              {statusBadge(selectedItem.status, 'order')}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileText size={16} /> Notes
          </h4>
          <p className="text-sm text-gray-600">
            {selectedItem.notes || 'No additional notes provided'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderAddOrderItem = () => (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Type to search products..."
          value={formData.productSearch || ''}
          onChange={(e) => setFormData({...formData, productSearch: e.target.value})}
        />
      </div>

      <div className="border rounded-md divide-y max-h-64 overflow-y-auto shadow-inner">
        {data.products
          ?.filter(product => 
            product.name.toLowerCase().includes(formData.productSearch?.toLowerCase() || '') &&
            product.is_active
          )
          .map(product => (
            <div 
              key={product.id} 
              className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  items: [...(prev.items || []), {
                    product,
                    quantity: product.min_order_quantity || 1
                  }],
                  productSearch: ''
                }));
                setShowModal('orderForm');
              }}
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(product.price_per_unit)} per {product.unit}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Stock: {product.available_quantity} {product.unit}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderDemandForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product*</label>
        <select
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          value={formData.product_id || ''}
          onChange={(e) => setFormData({...formData, product_id: e.target.value})}
          required
        >
          <option value="">Select Product</option>
          {data.products
            ?.filter(product => product.is_active)
            .map(product => (
              <option key={product.id} value={product.id}>
                {product.name} ({formatCurrency(product.price_per_unit)} per {product.unit})
              </option>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            value={formData.quantity || ''}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority*</label>
          <select
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            value={formData.priority || 'medium'}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          rows={3}
          value={formData.notes || ''}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>
    </div>
  );

  const renderDemandDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <User size={16} /> Retailer Info
          </h4>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{selectedItem.retailer?.name}</p>
            <p className="text-gray-600">{selectedItem.retailer?.email}</p>
            <p className="text-gray-600">{selectedItem.retailer?.phone}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Package size={16} /> Product Info
          </h4>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{selectedItem.product?.name}</p>
            <p className="text-gray-600">
              {formatCurrency(selectedItem.product?.price_per_unit)} per {selectedItem.product?.unit}
            </p>
            <p className="text-gray-600">
              Available: {selectedItem.product?.available_quantity} {selectedItem.product?.unit}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <ClipboardList size={16} /> Demand Info
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">
                {selectedItem.quantity} {selectedItem.product?.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Priority:</span>
              {statusBadge(selectedItem.priority, 'demand')}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              {statusBadge(selectedItem.fulfilled ? 'fulfilled' : 'pending', 'demand')}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Calendar size={16} /> Timeline
        </h4>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Recorded At:</span>
              <span className="font-medium">
                {formatDateTime(selectedItem.recorded_at)}
              </span>
            </div>
            {selectedItem.fulfilled && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fulfilled At:</span>
                  <span className="font-medium">
                    {formatDateTime(selectedItem.fulfilled_at)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fulfilled By:</span>
                  <span className="font-medium">
                    {selectedItem.fulfilled_by?.name || 'N/A'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedItem.notes && (
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <FileText size={16} /> Notes
          </h4>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">{selectedItem.notes}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderReviewForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({...formData, rating: star})}
            className="p-1"
          >
            <Star
              size={24}
              className={star <= formData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          rows={4}
          value={formData.review || ''}
          onChange={(e) => setFormData({...formData, review: e.target.value})}
          placeholder="Share your experience with this product..."
        />
      </div>

      {selectedItem && !selectedItem.is_approved && (
        <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          Your review is pending approval by the administrator.
        </div>
      )}
    </div>
  );

  const renderReviewDetails = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center shadow-inner">
            {selectedItem.product?.image ? (
              <img 
                src={selectedItem.product.image} 
                alt={selectedItem.product.name} 
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <Package className="text-gray-400" size={48} />
            )}
          </div>
        </div>
        
        <div className="w-full md:w-2/3 space-y-4">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {selectedItem.product?.name}
            </h3>
            <p className="text-gray-600">{selectedItem.product?.category?.name || 'Uncategorized'}</p>
          </div>
          
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={star <= selectedItem.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
              />
            ))}
            <span className="ml-2 text-gray-600 text-sm">
              {selectedItem.rating}.0
            </span>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Reviewed by</p>
            <p className="font-medium">{selectedItem.retailer?.name}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Status</p>
            {statusBadge(selectedItem.is_approved ? 'approved' : 'pending', 'review')}
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Review</h4>
        <div className="bg-gray-50 p-4 rounded-md shadow-inner">
          {selectedItem.review || 'No review text provided'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-2">Review Date</h4>
          <p className="text-sm">
            {formatDate(selectedItem.created_at)}
          </p>
        </div>
        {selectedItem.updated_at !== selectedItem.created_at && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Last Updated</h4>
            <p className="text-sm">
              {formatDate(selectedItem.updated_at)}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCategoryForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          value={formData.name || ''}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          rows={3}
          value={formData.description || ''}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
        <div className="mt-1 flex items-center">
          <input
            type="file"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100 transition-colors"
            onChange={(e) => {
              if (e.target.files[0]) {
                setFormData({...formData, image: e.target.files[0]});
              }
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderCategoryDetails = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center shadow-inner">
            {selectedItem.image ? (
              <img 
                src={selectedItem.image} 
                alt={selectedItem.name} 
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <Tag className="text-gray-400" size={48} />
            )}
          </div>
        </div>
        
        <div className="w-full md:w-2/3 space-y-4">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {selectedItem.name}
            </h3>
            <p className="text-gray-600">
              {selectedItem.product_count || 0} products in this category
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-gray-600">
              {selectedItem.description || 'No description provided'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-sm">
                {formatDate(selectedItem.created_at)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-sm">
                {formatDate(selectedItem.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {selectedItem.products?.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Top Products</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedItem.products.slice(0, 6).map(product => (
              <div 
                key={product.id} 
                className="border p-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-md w-12 h-12 flex items-center justify-center shadow-sm">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Package className="text-gray-400" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(product.price_per_unit)} per {product.unit}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAIResult = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        AI Generated Result
      </h3>
      {aiResult?.descriptions ? (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Concise Description</h4>
            <p className="bg-gray-50 p-3 rounded shadow-inner">{aiResult.descriptions.concise_description}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Detailed Description</h4>
            <p className="bg-gray-50 p-3 rounded shadow-inner">{aiResult.descriptions.detailed_description}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Marketing Description</h4>
            <p className="bg-gray-50 p-3 rounded shadow-inner">{aiResult.descriptions.marketing_description}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {aiResult.descriptions.keywords?.map((keyword, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Selling Points</h4>
            <ul className="list-disc pl-5 space-y-1">
              {aiResult.descriptions.selling_points?.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : aiResult?.recommendations ? (
        <div className="space-y-4">
          {aiResult.recommendations.map((rec, i) => (
            <div key={i} className="border-b pb-4 last:border-0">
              <h4 className="font-bold">{rec.product_name}</h4>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-500">Current Price</p>
                  <p>{formatCurrency(rec.current_price)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recommended Price</p>
                  <p className="font-bold">
                    {formatCurrency(rec.recommended_price)} ({rec.change_percentage})
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Reason</p>
                <p>{rec.reason}</p>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Expected Impact</p>
                <p>{rec.expected_impact}</p>
              </div>
            </div>
          ))}
          {aiResult.market_analysis && (
            <div className="mt-4">
              <h4 className="font-medium">Market Analysis</h4>
              <p className="mt-1">{aiResult.market_analysis}</p>
            </div>
          )}
          {aiResult.risk_assessment && (
            <div className="mt-4">
              <h4 className="font-medium">Risk Assessment</h4>
              <p className="mt-1">{aiResult.risk_assessment}</p>
            </div>
          )}
        </div>
      ) : aiResult?.predictions ? (
        <div className="space-y-4">
          <div className="mb-4">
            <h4 className="font-medium mb-2">Methodology</h4>
            <p className="text-sm text-gray-600">{aiResult.methodology}</p>
          </div>
          
          <div className="h-64 mb-4">
            <Bar
              data={{
                labels: aiResult.predictions.map(p => p.product_name),
                datasets: [{
                  label: 'Current Demand',
                  data: aiResult.predictions.map(p => p.current_demand),
                  backgroundColor: 'rgba(79, 70, 229, 0.6)',
                  borderColor: 'rgba(79, 70, 229, 1)',
                  borderWidth: 1
                }, {
                  label: 'Predicted Demand',
                  data: aiResult.predictions.map(p => p.predicted_demand),
                  backgroundColor: 'rgba(16, 185, 129, 0.6)',
                  borderColor: 'rgba(16, 185, 129, 1)',
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  }
                }
              }}
            />
          </div>
          
          {aiResult.predictions.map((pred, i) => (
            <div key={i} className="border-b pb-4 last:border-0">
              <h4 className="font-bold">{pred.product_name}</h4>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-500">Current Demand</p>
                  <p>{pred.current_demand} {pred.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Predicted Demand</p>
                  <p className="font-bold">
                    {pred.predicted_demand} {pred.unit} ({pred.change_percentage})
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Confidence</p>
                <p className={`font-medium ${
                  pred.confidence === 'high' ? 'text-green-600' :
                  pred.confidence === 'medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {pred.confidence}
                </p>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Recommended Actions</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {pred.recommended_actions?.map((action, i) => (
                    <li key={i} className="text-sm">
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          
          {aiResult.risk_factors && (
            <div className="mt-4">
              <h4 className="font-medium">Risk Factors</h4>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {aiResult.risk_factors?.map((factor, i) => (
                  <li key={i} className="text-sm">
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p>No AI result available</p>
      )}
    </div>
  );

  const renderDeleteConfirmation = () => (
    <div className="space-y-4">
      <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
        <AlertTriangle size={18} />
        <p>Are you sure you want to delete this {activeTab.slice(0, -1)}? This action cannot be undone.</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md shadow-inner">
        <h4 className="font-medium mb-2">{selectedItem?.name || selectedItem?.product?.name || 'Item'}</h4>
        {selectedItem?.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {selectedItem.description}
          </p>
        )}
      </div>
    </div>
  );

  const getModalContent = () => {
    if (!showModal) return null;
    
    const commonActions = [
      {
        label: 'Cancel',
        onClick: () => setShowModal(null),
        color: 'text-gray-700 hover:bg-gray-100'
      }
    ];

    switch(showModal) {
      case 'productForm':
        return {
          title: selectedItem ? 'Edit Product' : 'Add New Product',
          content: renderProductForm(),
          actions: [
            ...commonActions,
            {
              label: selectedItem ? 'Update' : 'Create',
              onClick: () => handleSubmit('product'),
              color: 'bg-indigo-600 text-white hover:bg-indigo-700',
              loading: loading.product
            }
          ]
        };
      case 'productDetails':
        return {
          title: 'Product Details',
          content: renderProductDetails(),
          actions: commonActions
        };
      case 'deleteProduct':
        return {
          title: 'Confirm Deletion',
          content: renderDeleteConfirmation(),
          actions: [
            ...commonActions,
            {
              label: 'Delete',
              onClick: () => handleDelete('product', selectedItem.id),
              color: 'bg-red-600 text-white hover:bg-red-700',
              loading: loading.product
            }
          ]
        };
      case 'orderForm':
        return {
          title: selectedItem ? 'Edit Order' : 'Create New Order',
          content: renderOrderForm(),
          actions: [
            ...commonActions,
            {
              label: selectedItem ? 'Update' : 'Create',
              onClick: () => handleSubmit('order'),
              color: 'bg-indigo-600 text-white hover:bg-indigo-700',
              loading: loading.order
            }
          ]
        };
      case 'orderDetails':
        return {
          title: `Order #${selectedItem.id}`,
          content: renderOrderDetails(),
          actions: commonActions
        };
      case 'addOrderItem':
        return {
          title: 'Add Product to Order',
          content: renderAddOrderItem(),
          actions: commonActions
        };
      case 'cancelOrder':
        return {
          title: 'Confirm Order Cancellation',
          content: (
            <div className="space-y-4">
              <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md flex items-center gap-2">
                <AlertTriangle size={18} />
                <p>Are you sure you want to cancel this order?</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md shadow-inner">
                <h4 className="font-medium">Order #{selectedItem.id}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {formatCurrency(selectedItem.total_amount)}
                </p>
              </div>
            </div>
          ),
          actions: [
            ...commonActions,
            {
              label: 'Cancel Order',
              onClick: () => handleSubmit('cancelOrder'),
              color: 'bg-red-600 text-white hover:bg-red-700',
              loading: loading.order
            }
          ]
        };
      case 'demandForm':
        return {
          title: selectedItem ? 'Edit Demand' : 'Create New Demand',
          content: renderDemandForm(),
          actions: [
            ...commonActions,
            {
              label: selectedItem ? 'Update' : 'Create',
              onClick: () => handleSubmit('demand'),
              color: 'bg-indigo-600 text-white hover:bg-indigo-700',
              loading: loading.demand
            }
          ]
        };
      case 'demandDetails':
        return {
          title: 'Demand Details',
          content: renderDemandDetails(),
          actions: commonActions
        };
      case 'deleteDemand':
        return {
          title: 'Confirm Deletion',
          content: renderDeleteConfirmation(),
          actions: [
            ...commonActions,
            {
              label: 'Delete',
              onClick: () => handleDelete('demand', selectedItem.id),
              color: 'bg-red-600 text-white hover:bg-red-700',
              loading: loading.demand
            }
          ]
        };
      case 'fulfillDemand':
        return {
          title: 'Fulfill Demand',
          content: (
            <div className="space-y-4">
              <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center gap-2">
                <CheckCircle size={18} />
                <p>Confirm fulfillment of this demand?</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md shadow-inner">
                <h4 className="font-medium">{selectedItem.product?.name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedItem.quantity} {selectedItem.product?.unit} requested by {selectedItem.retailer?.name}
                </p>
              </div>
            </div>
          ),
          actions: [
            ...commonActions,
            {
              label: 'Fulfill Demand',
              onClick: () => handleSubmit('fulfillDemand'),
              color: 'bg-green-600 text-white hover:bg-green-700',
              loading: loading.demand
            }
          ]
        };
      case 'reviewForm':
        return {
          title: selectedItem ? 'Edit Review' : 'Add New Review',
          content: renderReviewForm(),
          actions: [
            ...commonActions,
            {
              label: selectedItem ? 'Update' : 'Submit',
              onClick: () => handleSubmit('review'),
              color: 'bg-indigo-600 text-white hover:bg-indigo-700',
              loading: loading.review
            }
          ]
        };
      case 'reviewDetails':
        return {
          title: 'Review Details',
          content: renderReviewDetails(),
          actions: commonActions
        };
      case 'deleteReview':
        return {
          title: 'Confirm Deletion',
          content: renderDeleteConfirmation(),
          actions: [
            ...commonActions,
            {
              label: 'Delete',
              onClick: () => handleDelete('review', selectedItem.id),
              color: 'bg-red-600 text-white hover:bg-red-700',
              loading: loading.review
            }
          ]
        };
      case 'approveReview':
        return {
          title: 'Approve Review',
          content: (
            <div className="space-y-4">
              <div className="bg-blue-50 text-blue-700 p-3 rounded-md flex items-center gap-2">
                <ShieldCheck size={18} />
                <p>Approve this review to make it publicly visible?</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md shadow-inner">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= selectedItem.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  {selectedItem.review || 'No review text provided'}
                </p>
              </div>
            </div>
          ),
          actions: [
            ...commonActions,
            {
              label: 'Approve Review',
              onClick: () => handleSubmit('approveReview'),
              color: 'bg-green-600 text-white hover:bg-green-700',
              loading: loading.review
            }
          ]
        };
      case 'categoryForm':
        return {
          title: selectedItem ? 'Edit Category' : 'Add New Category',
          content: renderCategoryForm(),
          actions: [
            ...commonActions,
            {
              label: selectedItem ? 'Update' : 'Create',
              onClick: () => handleSubmit('category'),
              color: 'bg-indigo-600 text-white hover:bg-indigo-700',
              loading: loading.category
            }
          ]
        };
      case 'categoryDetails':
        return {
          title: 'Category Details',
          content: renderCategoryDetails(),
          actions: commonActions
        };
      case 'deleteCategory':
        return {
          title: 'Confirm Deletion',
          content: renderDeleteConfirmation(),
          actions: [
            ...commonActions,
            {
              label: 'Delete',
              onClick: () => handleDelete('category', selectedItem.id),
              color: 'bg-red-600 text-white hover:bg-red-700',
              loading: loading.category
            }
          ]
        };
      case 'aiResult':
        return {
          title: 'AI Analysis Result',
          content: renderAIResult(),
          actions: commonActions
        };
      default:
        return null;
    }
  };

  const modalContent = getModalContent();

  if (!modalContent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 p-6 pb-0">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {modalContent.title}
            </h2>
            <button 
              onClick={() => setShowModal(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {errors[activeTab] && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2 mb-4">
              <AlertCircle size={18} /> {errors[activeTab]}
            </div>
          )}
        </div>
        
        <div className="p-6 pt-0">
          <div className="space-y-4">
            {modalContent.content}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            {modalContent.actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                disabled={action.loading}
                className={`px-4 py-2 rounded-md text-sm font-medium ${action.color} flex items-center gap-2 transition-colors`}
              >
                {action.loading && <Loader className="animate-spin" size={16} />}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceModals;