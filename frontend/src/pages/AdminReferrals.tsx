import React, { useEffect, useState } from 'react';
import api from '../lib/axios';

interface ReferralNode {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  role: string;
  isActive: boolean;
  referrals: ReferralNode[];
  flagged?: boolean;
}

const AdminReferrals: React.FC = () => {
  const [tree, setTree] = useState<ReferralNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ReferralNode | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [flagLoading, setFlagLoading] = useState(false);

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/referral-tree');
      setTree(response.data.tree);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (node: ReferralNode) => {
    setSelectedUser(node);
    setUserDetails(null);
    setDetailsLoading(true);
    try {
      const response = await api.get(`/api/admin/users/${node._id}/details`);
      setUserDetails(response.data);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleFlagToggle = async () => {
    if (!userDetails?.user) return;
    setFlagLoading(true);
    try {
      await api.post(`/api/admin/users/${userDetails.user._id}/flag`, { flagged: !userDetails.user.flagged });
      setUserDetails({ ...userDetails, user: { ...userDetails.user, flagged: !userDetails.user.flagged } });
    } finally {
      setFlagLoading(false);
    }
  };

  const renderNode = (node: ReferralNode) => (
    <div className="flex flex-col items-center">
      <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
        {node.avatar ? (
          <img src={node.avatar} alt={node.firstName} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
            {node.firstName[0]}
          </div>
        )}
        <div className="flex flex-col items-start">
          <button onClick={() => handleUserClick(node)} className="text-sm font-semibold text-blue-700 hover:underline">
            {node.firstName} {node.lastName}
          </button>
          <span className="text-xs text-gray-500">{node.email}</span>
        </div>
        {node.flagged && (
          <span title="Flagged for review" className="ml-1 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
          </span>
        )}
        <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">{node.referrals.length}</span>
      </div>
      {node.referrals.length > 0 && (
        <div className="flex mt-4 space-x-8">
          {node.referrals.map(child => (
            <div key={child._id} className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-gray-300 mb-1" />
              {renderNode(child)}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Referral Tree</h1>
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex flex-col items-center">
            {tree.length === 0 ? (
              <div className="text-gray-500">No referral data found.</div>
            ) : (
              tree.map(node => (
                <div key={node._id} className="mb-12">
                  {renderNode(node)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedUser(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            {detailsLoading ? (
              <div className="flex items-center justify-center min-h-[20vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : userDetails ? (
              <div className="flex flex-col items-center">
                {userDetails.user.avatar ? (
                  <img src={userDetails.user.avatar} alt={userDetails.user.firstName} className="w-16 h-16 rounded-full object-cover mb-2" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-500 font-bold mb-2">
                    {userDetails.user.firstName[0]}
                  </div>
                )}
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                  {userDetails.user.firstName} {userDetails.user.lastName}
                  {userDetails.user.flagged && (
                    <span title="Flagged for review" className="text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="inline h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                    </span>
                  )}
                </h2>
                <div className="text-gray-500 text-sm mb-2">{userDetails.user.email}</div>
                <div className="flex space-x-2 mb-2">
                  <span className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5">Role: {userDetails.user.role}</span>
                  <span className={`text-xs rounded px-2 py-0.5 ${userDetails.user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{userDetails.user.isActive ? 'Active' : 'Inactive'}</span>
                  <button
                    onClick={handleFlagToggle}
                    disabled={flagLoading}
                    className={`ml-2 px-2 py-0.5 text-xs rounded border ${userDetails.user.flagged ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200'} transition`}
                  >
                    {flagLoading ? '...' : userDetails.user.flagged ? 'Unflag' : 'Flag'}
                  </button>
                </div>
                <div className="text-xs text-gray-400 mb-2">Joined: {new Date(userDetails.user.createdAt).toLocaleString()}</div>
                <div className="text-xs text-gray-400 mb-2">Referral Code: {userDetails.user.referralCode}</div>
                <div className="text-xs text-gray-400 mb-2">Referred By: {userDetails.user.referredBy || '—'}</div>
                {/* Orders */}
                <div className="mt-4 w-full">
                  <div className="font-semibold mb-2">Order History</div>
                  {userDetails.orders.length === 0 ? (
                    <div className="text-gray-500 text-sm mb-2">No orders found.</div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userDetails.orders.map((order: any) => (
                        <div key={order._id} className="border border-gray-200 rounded p-2 flex flex-col">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Order #{order.orderNumber}</span>
                            <span className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center space-x-1">
                                {item.product && item.product.images && item.product.images[0] && (
                                  <img src={item.product.images[0]} alt={item.product.name} className="w-6 h-6 rounded object-cover" />
                                )}
                                <span className="text-xs">{item.product?.name} x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Total: ₹{order.total}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Logs */}
                <div className="mt-4 w-full">
                  <div className="font-semibold mb-2">User Logs</div>
                  {userDetails.logs.length === 0 ? (
                    <div className="text-gray-500 text-sm mb-2">No logs found.</div>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {userDetails.logs.map((log: any, idx: number) => (
                        <div key={idx} className="text-xs text-gray-700">
                          <span className="font-medium">[{log.type}]</span> {log.message} <span className="text-gray-400">({new Date(log.date).toLocaleString()})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No details found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReferrals; 