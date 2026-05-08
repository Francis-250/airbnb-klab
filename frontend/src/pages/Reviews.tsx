import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  guest: {
    name: string;
    avatar?: string;
  };
}

interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
}

export default function Reviews() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const response = await api.get(`/reviews/listing/${id}`);
      return response.data as ReviewsResponse;
    },
    enabled: !!id,
  });

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: { listingId: string; rating: number; comment: string }) => {
      const response = await api.post("/reviews", reviewData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setNewReview({ rating: 5, comment: "" });
      setShowReviewForm(false);
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
    },
    onError: () => {
      toast.error("Failed to submit review");
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newReview.comment.trim()) return;

    createReviewMutation.mutate({
      listingId: id,
      rating: newReview.rating,
      comment: newReview.comment,
    });
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <div className="p-6">Loading reviews...</div>;
  }

  const averageRating = reviewsData?.ratingDistribution.reduce(
    (sum, item) => sum + item.rating * item.count,
    0
  ) / reviewsData?.ratingDistribution.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Reviews</h1>
        
        <div className="bg-white p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <div>
              {renderStars(Math.round(averageRating))}
              <p className="text-gray-600">{reviewsData?.pagination.total} reviews</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviewsData?.ratingDistribution.find(r => r.rating === rating)?.count || 0;
              const percentage = reviewsData?.pagination.total > 0 
                ? (count / reviewsData.pagination.total) * 100 
                : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-3">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 h-2">
                    <div 
                      className="bg-yellow-400 h-2" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {user && user.role === 'guest' && (
          <div className="mb-6">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-blue-500 text-white px-4 py-2"
            >
              {showReviewForm ? "Cancel" : "Write a Review"}
            </button>
            
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="bg-white p-6 mt-4">
                <h3 className="text-lg font-semibold mb-4">Your Review</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  {renderStars(newReview.rating, true, (rating) => 
                    setNewReview({ ...newReview, rating })
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full p-3 border min-h-32"
                    placeholder="Share your experience..."
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2"
                  disabled={createReviewMutation.isPending}
                >
                  {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {reviewsData?.reviews.map((review) => (
          <div key={review.id} className="bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {review.guest.avatar ? (
                  <img src={review.guest.avatar} alt={review.guest.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold">
                    {review.guest.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{review.guest.name}</h4>
                    <p className="text-sm text-gray-600">{formatDate(review.createdAt)}</p>
                  </div>
                  {renderStars(review.rating)}
                </div>
                
                <p className="text-gray-800">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
        
        {reviewsData?.reviews.length === 0 && (
          <div className="bg-white p-6 text-center text-gray-500">
            No reviews yet. Be the first to review!
          </div>
        )}
      </div>
    </div>
  );
}
