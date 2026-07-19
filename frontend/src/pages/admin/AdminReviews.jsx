import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Check, Trash2, Star } from 'lucide-react';
import { reviewAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const queryClient = useQueryClient();

  const { data: pendingReviews, isLoading } = useQuery('pendingReviews', reviewAPI.getPending, {
    select: (res) => res.data,
  });

  const approveMutation = useMutation(reviewAPI.approve, {
    onSuccess: () => {
      queryClient.invalidateQueries('pendingReviews');
      toast.success('Review approved');
    },
  });

  const deleteMutation = useMutation(reviewAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('pendingReviews');
      toast.success('Review deleted');
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-stone-900">Review Moderation</h2>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : pendingReviews && pendingReviews.length > 0 ? (
        <div className="space-y-4">
          {pendingReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border border-stone-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={14} className={s <= review.rating ? 'text-gold-400 fill-gold-400' : 'text-stone-300'} />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{review.product_title}</span>
                    <span className="text-xs text-stone-400">by {review.first_name} {review.last_name}</span>
                  </div>
                  <p className="text-stone-600">{review.comment}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => approveMutation.mutate(review.id)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Approve"><Check size={16} /></button>
                  <button onClick={() => deleteMutation.mutate(review.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
          <Star size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500">No pending reviews to moderate</p>
        </div>
      )}
    </div>
  );
}
