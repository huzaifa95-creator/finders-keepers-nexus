
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Clock, 
  Tag, 
  User, 
  MessageCircle, 
  ChevronLeft,
  Share2,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Edit,
  Calendar,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Item {
  _id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  location: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  type: 'lost' | 'found';
  status: string;
  isHighValue: boolean;
  contactMethod?: string;
  user?: {
    name: string;
    _id: string;
    email: string;
  };
  claimedBy?: {
    name: string;
    _id: string;
  };
  additionalDetails?: string;
}

interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  user?: {
    name: string;
    _id: string;
  };
}

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: new Date(),
    additionalDetails: "",
    isHighValue: false
  });
  
  // Fetch item data
  const fetchItemDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/items/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch item details');
      }
      
      const data = await response.json();
      setItem(data);
      
      // Initialize update form with current data
      if (data) {
        setUpdateFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          location: data.location || "",
          date: data.date ? new Date(data.date) : new Date(),
          additionalDetails: data.additionalDetails || "",
          isHighValue: data.isHighValue || false
        });
      }
      
      // Fetch comments for this item
      const commentsResponse = await fetch(`http://localhost:5000/api/items/${id}/comments`);
      
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError('Failed to load item details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchItemDetail();
  }, [id]);
  
  const handleClaimSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.currentTarget);
    const claimData = {
      description: formData.get('description'),
      contactInfo: formData.get('contactInfo'),
      proofDetails: formData.get('proofDetails'),
      userId: user?.id
    };
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/items/${id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(claimData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit claim');
      }
      
      toast({
        title: "Claim Submitted",
        description: "Your claim has been submitted. You will be notified when it's reviewed.",
      });
      setIsClaimDialogOpen(false);
      // Refresh item details to show updated status
      fetchItemDetail();
    } catch (err) {
      console.error('Error submitting claim:', err);
      toast({
        title: "Error",
        description: "Failed to submit claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleItemUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Add all form fields
      formData.append('title', updateFormData.title);
      formData.append('description', updateFormData.description);
      formData.append('category', updateFormData.category);
      formData.append('location', updateFormData.location);
      formData.append('date', updateFormData.date.toISOString());
      formData.append('additionalDetails', updateFormData.additionalDetails || '');
      formData.append('isHighValue', updateFormData.isHighValue ? 'true' : 'false');
      
      // Get image file if selected
      const imageInput = document.getElementById('itemImage') as HTMLInputElement;
      if (imageInput && imageInput.files && imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
      }
      
      const response = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      
      toast({
        title: "Item Updated",
        description: "Your item has been successfully updated.",
      });
      
      setIsUpdateDialogOpen(false);
      // Refresh item details
      fetchItemDetail();
    } catch (err) {
      console.error('Error updating item:', err);
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleComment = async () => {
    if (!commentText.trim() || !id) return;
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/items/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          text: commentText,
          userId: user?.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
      
      const newComment = await response.json();
      setComments([...comments, newComment]);
      setCommentText("");
      
      toast({
        title: "Comment Posted",
        description: "Your comment has been posted successfully.",
      });
    } catch (err) {
      console.error('Error posting comment:', err);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Time ago format
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  // Check if user is the owner of the item or an admin
  const canEdit = isAuthenticated && item && (
    (item.user && user?.id === item.user._id) || isAdmin
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold">Loading item details...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-3xl font-bold mb-4">Item Not Found</h1>
          <p className="text-muted-foreground mb-8">
            {error || "The item you're looking for doesn't exist or has been removed."}
          </p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="flex items-center gap-1 px-2">
            <Link to={item.type === 'lost' ? '/lost-items' : '/found-items'}>
              <ChevronLeft className="h-4 w-4" />
              Back to {item.type === 'lost' ? 'Lost' : 'Found'} Items
            </Link>
          </Button>
        </div>
        
        {/* Item Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Column */}
          <div className="lg:col-span-1">
            <div className="rounded-lg overflow-hidden border border-border bg-card h-[300px] sm:h-[400px] mb-4">
              <img 
                src={item.imageUrl ? `http://localhost:5000${item.imageUrl}` : '/placeholder.svg'} 
                alt={item.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
            
            <div className="flex justify-between gap-2 mb-6">
              {canEdit && (
                <Button variant="outline" onClick={() => setIsUpdateDialogOpen(true)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Update
                </Button>
              )}
              <Button variant="outline" onClick={() => toast({
                title: "Share",
                description: "Sharing functionality coming soon!",
              })} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={() => toast({
                title: "Report",
                description: "Report functionality coming soon!",
              })} className="flex-1">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
            
            {/* Status Card */}
            <div className="p-4 rounded-lg border border-border bg-card mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Item Status</h3>
                <Badge 
                  className={`${item.status === 'pending' && item.type === 'lost' ? 'bg-destructive text-destructive-foreground' 
                    : item.status === 'pending' && item.type === 'found' ? 'bg-green-500 text-white'
                    : item.status === 'claimed' ? 'bg-amber-500 text-white'
                    : item.status === 'resolved' ? 'bg-blue-500 text-white'
                    : 'bg-gray-500 text-white'} uppercase`}
                >
                  {item.status}
                </Badge>
              </div>
              
              {item.type === 'lost' ? (
                <p className="text-sm text-muted-foreground">
                  This item has been reported as lost and is currently being looked for. If you've found it, please claim below.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This item has been found and is waiting to be claimed. If it's yours, please claim below.
                </p>
              )}
              
              {item.updatedAt && item.updatedAt !== item.createdAt && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Last updated: {formatDate(item.updatedAt)}
                  </p>
                </div>
              )}
            </div>
            
            {/* Contact Information */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Reported By</p>
                    <p className="text-muted-foreground text-sm">
                      {item.user?.name || "Anonymous"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Contact Method</p>
                    <p className="text-muted-foreground text-sm">
                      {item.contactMethod || (item.user?.email ? `Email: ${item.user.email}` : "Through platform only")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Details Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {item.isHighValue && (
                  <Badge className="bg-amber-500 text-white uppercase">
                    High Value
                  </Badge>
                )}
                <Badge variant="outline">{item.category}</Badge>
                <Badge variant={item.type === 'lost' ? 'destructive' : 'default'}>
                  {item.type.toUpperCase()}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1 text-primary/70" />
                  <span>{item.location}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1 text-primary/70" />
                  <span>{formatDate(item.date || item.createdAt)}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Tag className="h-4 w-4 mr-1 text-primary/70" />
                  <span>{item.category}</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground mb-6">
                {item.description}
              </p>
              
              {item.additionalDetails && (
                <>
                  <h3 className="font-semibold mb-2">Additional Details</h3>
                  <p className="text-muted-foreground">
                    {item.additionalDetails}
                  </p>
                </>
              )}
            </div>
            
            {/* Claim Button */}
            <div>
              {item.status === 'pending' && isAuthenticated && (
                <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full py-6" size="lg">
                      {item.type === 'lost' ? (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          I've Found This Item
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          This Item Belongs to Me
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {item.type === 'lost' ? "Report Found Item" : "Claim This Item"}
                      </DialogTitle>
                      <DialogDescription>
                        {item.type === 'lost' 
                          ? "Please provide details about how you found this item." 
                          : "Please provide proof that this item belongs to you."}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleClaimSubmit}>
                      <div className="space-y-4 py-4">
                        {item.type === 'found' && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Describe a unique feature of this item that only the owner would know
                            </label>
                            <Textarea 
                              name="proofDetails"
                              placeholder="E.g., serial number, distinctive marks, contents..." 
                              className="min-h-[100px]"
                              required
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {item.type === 'lost' 
                              ? "Where and when did you find it?" 
                              : "When and where did you lose it?"}
                          </label>
                          <Textarea 
                            name="description"
                            placeholder="Please be as specific as possible..." 
                            className="min-h-[100px]"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Your Contact Information</label>
                          <Input 
                            name="contactInfo"
                            placeholder="Email or phone number" 
                            required
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsClaimDialogOpen(false)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Submit
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
              
              {/* Update Item Dialog */}
              <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Update Item Details</DialogTitle>
                    <DialogDescription>
                      Make changes to your {item.type} item report to add more details or corrections.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleItemUpdate}>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Title</label>
                          <Input 
                            value={updateFormData.title}
                            onChange={(e) => setUpdateFormData({...updateFormData, title: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Category</label>
                          <Input 
                            value={updateFormData.category}
                            onChange={(e) => setUpdateFormData({...updateFormData, category: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                          value={updateFormData.description}
                          onChange={(e) => setUpdateFormData({...updateFormData, description: e.target.value})}
                          className="min-h-[100px]"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Location</label>
                          <Input 
                            value={updateFormData.location}
                            onChange={(e) => setUpdateFormData({...updateFormData, location: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Date</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <Calendar className="mr-2 h-4 w-4" />
                                {updateFormData.date ? format(updateFormData.date, "PPP") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={updateFormData.date}
                                onSelect={(date) => date && setUpdateFormData({...updateFormData, date})}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Additional Details</label>
                        <Textarea 
                          value={updateFormData.additionalDetails || ""}
                          onChange={(e) => setUpdateFormData({...updateFormData, additionalDetails: e.target.value})}
                          placeholder="Any other details that might help identify the item..."
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Image</label>
                        <Input 
                          id="itemImage"
                          type="file"
                          accept="image/*"
                        />
                        <p className="text-xs text-muted-foreground">
                          Upload a new image only if you want to replace the existing one.
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isHighValue"
                          checked={updateFormData.isHighValue}
                          onChange={(e) => setUpdateFormData({...updateFormData, isHighValue: e.target.checked})}
                          className="form-checkbox h-4 w-4"
                        />
                        <label htmlFor="isHighValue" className="text-sm font-medium">
                          This is a high value item
                        </label>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsUpdateDialogOpen(false)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Comments */}
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Comments</h2>
              
              <div className="space-y-4 mb-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{comment.user?.name || 'Anonymous'}</p>
                          <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-muted-foreground">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold">Add a Comment</h3>
                <Textarea 
                  placeholder="Write your comment here..." 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleComment} 
                    disabled={!commentText.trim() || submitting || !isAuthenticated}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
                {!isAuthenticated && (
                  <p className="text-xs text-center text-muted-foreground">
                    You need to <Link to="/login" className="text-primary">log in</Link> to post comments.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ItemDetail;
