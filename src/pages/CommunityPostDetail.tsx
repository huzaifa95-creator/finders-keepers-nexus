
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Clock, ThumbsUp, MessageSquare, Loader2, CheckCircle, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  user: {
    _id: string;
    name: string;
  };
  likes: string[];
  comments: Comment[];
  resolved: boolean;
  createdAt: string;
}

const CommunityPostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  
  // Fetch post details
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/community/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      
      return response.json();
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`http://localhost:5000/api/community/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to like post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to like post",
        variant: "destructive"
      });
    }
  });

  // Unlike post mutation
  const unlikePostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`http://localhost:5000/api/community/${id}/like`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unlike post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unlike post",
        variant: "destructive"
      });
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch(`http://localhost:5000/api/community/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      setNewComment('');
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive"
      });
    }
  });

  // Mark as resolved mutation
  const resolvePostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`http://localhost:5000/api/community/${id}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark as resolved');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      toast({
        title: "Success",
        description: "Post marked as resolved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark as resolved",
        variant: "destructive"
      });
    }
  });

  const handleBack = () => {
    navigate('/community');
  };

  const handleLikeToggle = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
      });
      navigate('/login');
      return;
    }
    
    const isLiked = post?.likes.includes(user.id);
    
    if (isLiked) {
      unlikePostMutation.mutate();
    } else {
      likePostMutation.mutate();
    }
  };

  const handleAddComment = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment",
      });
      navigate('/login');
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please enter a comment",
        variant: "destructive"
      });
      return;
    }
    
    addCommentMutation.mutate(newComment);
  };

  const handleMarkResolved = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to mark as resolved",
      });
      navigate('/login');
      return;
    }
    
    resolvePostMutation.mutate();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow py-8 container mx-auto px-4">
          <div className="flex justify-center items-center py-32">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow py-8 container mx-auto px-4">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Community
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isPostOwner = user && post.user._id === user.id;
  const isLikedByCurrentUser = user ? post.likes.includes(user.id) : false;
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Community
            </Button>
            
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                      <AvatarImage src="" />
                    </Avatar>
                    <div>
                      <div className="font-medium">{post.user.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDate(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={post.resolved ? "default" : "outline"}>
                      {post.resolved ? "Resolved" : "Open"}
                    </Badge>
                    
                    {isPostOwner && !post.resolved && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleMarkResolved}
                        disabled={resolvePostMutation.isPending}
                        className="ml-2"
                      >
                        {resolvePostMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Mark as Resolved
                      </Button>
                    )}
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
                
                <div className="prose max-w-none mb-6">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </div>
                
                <div className="flex justify-between items-center py-4 border-t border-b border-border">
                  <Button 
                    variant={isLikedByCurrentUser ? "default" : "ghost"} 
                    size="sm" 
                    onClick={handleLikeToggle}
                    disabled={likePostMutation.isPending || unlikePostMutation.isPending}
                    className={isLikedByCurrentUser ? "bg-primary/20 hover:bg-primary/30" : ""}
                  >
                    {(likePostMutation.isPending || unlikePostMutation.isPending) ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <ThumbsUp className="mr-1 h-4 w-4" />
                    )}
                    {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                  </Button>
                  
                  <div className="flex items-center">
                    <MessageSquare className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                    </span>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <Flag className="mr-1 h-4 w-4" />
                    Report
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Comments ({post.comments.length})</h2>
              
              {isAuthenticated ? (
                <div className="mb-6">
                  <Textarea 
                    placeholder="Add a comment..." 
                    className="mb-3 min-h-[100px]"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAddComment}
                      disabled={addCommentMutation.isPending}
                    >
                      {addCommentMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Post Comment
                    </Button>
                  </div>
                </div>
              ) : (
                <Card className="mb-6 bg-muted/40">
                  <CardContent className="p-4 text-center">
                    <p className="mb-2">Please log in to comment on this post</p>
                    <Button onClick={() => navigate('/login')} variant="outline" size="sm">
                      Login
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {post.comments.length > 0 ? (
                <div className="space-y-4">
                  {post.comments.map((comment) => (
                    <Card key={comment._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="mt-1">
                            <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                            <AvatarImage src="" />
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium">{comment.user.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(comment.createdAt)}
                              </div>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="mx-auto h-8 w-8 opacity-20 mb-2" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CommunityPostDetail;
