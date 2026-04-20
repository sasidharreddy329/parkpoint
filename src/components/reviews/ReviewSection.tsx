import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

interface Props {
  locationId: string;
}

const Stars = ({ value, size = "sm" }: { value: number; size?: "sm" | "md" | "lg" }) => {
  const px = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${px} ${n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
};

const ReviewSection = ({ locationId }: Props) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: revs } = await supabase
      .from("reviews")
      .select("id, user_id, rating, comment, created_at, updated_at")
      .eq("location_id", locationId)
      .order("created_at", { ascending: false });

    const list = (revs || []) as Review[];

    // Fetch author names from profiles in one go
    const userIds = Array.from(new Set(list.map((r) => r.user_id)));
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      const nameMap = new Map((profs || []).map((p: any) => [p.user_id, p.full_name]));
      list.forEach((r) => (r.author_name = nameMap.get(r.user_id) || "Anonymous"));
    }
    setReviews(list);

    if (user) {
      const mine = list.find((r) => r.user_id === user.id) || null;
      setMyReview(mine);
      if (mine) {
        setRating(mine.rating);
        setComment(mine.comment || "");
      }
      // Check booking eligibility
      const { count } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("location_id", locationId);
      setCanReview((count || 0) > 0);
    } else {
      setCanReview(false);
      setMyReview(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, user?.id]);

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const submit = async () => {
    if (!user) return;
    if (rating < 1 || rating > 5) return;
    setSubmitting(true);
    const payload = {
      user_id: user.id,
      location_id: locationId,
      rating,
      comment: comment.trim() || null,
    };
    const { error } = await supabase
      .from("reviews")
      .upsert(payload, { onConflict: "user_id,location_id" });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(myReview ? "Review updated" : "Review submitted");
      load();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Ratings & Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={Math.round(avg)} size="md" />
            <span className="text-sm font-semibold text-foreground">{avg.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Submission form */}
      {user && canReview && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-4 space-y-3"
        >
          <p className="text-sm font-medium text-foreground">
            {myReview ? "Update your review" : "Share your experience"}
          </p>
          <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHover(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                className="transition-transform hover:scale-110"
                aria-label={`Rate ${n} stars`}
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    n <= (hover || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others what you thought…"
            rows={3}
            maxLength={500}
            className="text-sm"
          />
          <div className="flex justify-end">
            <Button onClick={submit} disabled={submitting} size="sm" className="rounded-lg">
              {submitting ? "Saving…" : myReview ? "Update Review" : "Post Review"}
            </Button>
          </div>
        </motion.div>
      )}

      {user && !canReview && !loading && (
        <div className="bg-muted/40 border border-dashed border-border rounded-xl p-4 text-xs text-muted-foreground">
          Only users who have booked this location can leave a review.
        </div>
      )}

      {!user && (
        <div className="bg-muted/40 border border-dashed border-border rounded-xl p-4 text-xs text-muted-foreground">
          Log in to leave a review after your booking.
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet — be the first to share!</p>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence>
            {reviews.map((r) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      {(r.author_name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {r.author_name || "Anonymous"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Stars value={r.rating} />
                </div>
                {r.comment && (
                  <p className="text-sm text-foreground/90 mt-2 whitespace-pre-wrap">
                    {r.comment}
                  </p>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default ReviewSection;
