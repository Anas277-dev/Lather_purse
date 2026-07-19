import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { MessageSquare } from 'lucide-react';
import { complaintAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

const statusColors = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
};

export default function AdminComplaints() {
  const [replyText, setReplyText] = useState('');
  const [activeComplaint, setActiveComplaint] = useState(null);
  const queryClient = useQueryClient();

  const { data: complaints, isLoading } = useQuery('allComplaints', complaintAPI.getAll, {
    select: (res) => res.data,
  });

  const updateMutation = useMutation(
    ({ id, data }) => complaintAPI.updateStatus(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allComplaints');
        setReplyText('');
        setActiveComplaint(null);
        toast.success('Complaint updated');
      },
    }
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-stone-900">Customer Complaints</h2>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : complaints && complaints.length > 0 ? (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-lg border border-stone-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-stone-500">Order: {complaint.tracking_id}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[complaint.status]}`}>
                      {complaint.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="font-medium text-lg">{complaint.subject}</h4>
                  <p className="text-sm text-stone-500">From: {complaint.first_name} {complaint.last_name} ({complaint.email})</p>
                </div>
              </div>

              <p className="text-stone-600 mb-4">{complaint.description}</p>

              {complaint.admin_reply && (
                <div className="bg-leather-50 rounded-lg p-4 mb-4">
                  <p className="text-xs font-medium text-leather-700 mb-1">Admin Reply:</p>
                  <p className="text-sm text-stone-600">{complaint.admin_reply}</p>
                </div>
              )}

              {activeComplaint === complaint.id ? (
                <div className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="input-field"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => updateMutation.mutate({ id: complaint.id, data: { status: 'in_progress', adminReply: replyText } })} className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">Mark In Progress</button>
                    <button onClick={() => updateMutation.mutate({ id: complaint.id, data: { status: 'resolved', adminReply: replyText } })} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">Mark Resolved</button>
                    <button onClick={() => setActiveComplaint(null)} className="px-4 py-2 text-stone-500 text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setActiveComplaint(complaint.id)} className="flex items-center gap-2 text-leather-700 text-sm font-medium hover:underline">
                  <MessageSquare size={16} /> Reply
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
          <MessageSquare size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500">No complaints found</p>
        </div>
      )}
    </div>
  );
}
