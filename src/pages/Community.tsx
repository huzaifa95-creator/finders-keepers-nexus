import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, ThumbsUp, Calendar, Filter, PlusCircle, MapPin, Clock, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Post {
  _id: string;
  title: string;
  content: string;
  user: {
    _id: string;
    name: string;
  };
  likes: string[];
  comments: {
    _id: string;
    text: string;
    user: {
      _id: string;
      name: string;
    };
    createdAt: string;
  }[];
  resolved: boolean;
  createdAt: string;
}

const Community = () => {
  const { toast } = useToast();
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: ""
  });
  const [activeTab, setActiveTab] = useState<string>("recent");

  const getPosts = async (filters: { search?: string, resolved?: boolean, userId?: string }) => {
    let url = 'http://localhost:5000/api/community?';
    
    if (filters.search) {
      url += `search=${encodeURIComponent(filters.search)}&`;
    }
    
    if (filters.resolved !== undefined) {
      url += `resolved=${filters.resolved}&`;
    }
    
    if (filters.userId) {
      url += `user=${filters.userId}&`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    return response.json();
  };

  const { data: allPosts = [], isLoading, refetch } = useQuery({
    queryKey: ['communityPosts', { search: searchTerm }],
    queryFn: () => getPosts({ search: searchTerm }),
  });

  const { data: userPosts = [] } = useQuery({
    queryKey: ['userPosts', user?.id],
    queryFn: () => getPosts({ userId: user?.id }),
    enabled: isAuthenticated && activeTab === "my-posts",
  });

  const { data: popularPosts = [] } = useQuery({
    queryKey: ['popularPosts'],
    queryFn: async () => {
      const posts = await getPosts({});
      return posts.sort((a: Post, b: Post) => b.likes.length - a.likes.length).slice(0, 10);
    },
    enabled: activeTab === "popular",
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: { title: string; content: string }) => {
      const response = await fetch('http://localhost:5000/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      toast({
        title: "Success!",
        description: "Your post has been created.",
      });
      setIsOpen(false);
      setNewPost({ title: "", content: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive"
      });
    }
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`http://localhost:5000/api/community/${postId}/like`, {
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
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['popularPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to like post",
        variant: "destructive"
      });
    }
  });

  const handleNewPost = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a post",
      });
      navigate('/login');
      return;
    }
    
    setIsOpen(true);
  };
  
  const handleSubmitPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content",
        variant: "destructive"
      });
      return;
    }
    
    createPostMutation.mutate(newPost);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    refetch();
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const displayPosts = () => {
    switch(activeTab) {
      case "popular":
        return popularPosts;
      case "my-posts":
        return userPosts;
      case "recent":
      default:
        return allPosts;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
              <p className="text-muted-foreground">
                Get help from the FAST-NUCES community to find your lost items
              </p>
            </div>
            
            <Button onClick={handleNewPost}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Search community posts..." 
                      className="flex-1"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button variant="ghost" size="icon" onClick={handleSearch}>
                      <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Filter className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Tabs defaultValue="recent" value={activeTab} onValueChange={handleTabChange}>
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="popular">Popular</TabsTrigger>
                    <TabsTrigger value="my-posts">My Posts</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="recent" className="space-y-4 mt-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : displayPosts().length > 0 ? (
                    displayPosts().map((post: Post) => (
                      <CommunityPost 
                        key={post._id} 
                        post={post} 
                        currentUser={user}
                        isAuthenticated={isAuthenticated}
                        onLike={() => likePostMutation.mutate(post._id)}
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No posts found</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="popular" className="space-y-4 mt-2">
                  {!isAuthenticated ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Login to view popular posts</p>
                    </div>
                  ) : isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : displayPosts().length > 0 ? (
                    displayPosts().map((post: Post) => (
                      <CommunityPost 
                        key={post._id} 
                        post={post} 
                        currentUser={user}
                        isAuthenticated={isAuthenticated}
                        onLike={() => likePostMutation.mutate(post._id)}
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No popular posts found</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="my-posts" className="space-y-4 mt-2">
                  {!isAuthenticated ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Login to view your posts</p>
                    </div>
                  ) : isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : displayPosts().length > 0 ? (
                    displayPosts().map((post: Post) => (
                      <CommunityPost 
                        key={post._id} 
                        post={post} 
                        currentUser={user}
                        isAuthenticated={isAuthenticated}
                        onLike={() => likePostMutation.mutate(post._id)}
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>You haven't created any posts yet</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Community Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Be Specific</h4>
                    <p className="text-sm text-muted-foreground">
                      Provide clear details about lost items including location, time, and description.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Protect Privacy</h4>
                    <p className="text-sm text-muted-foreground">
                      Don't share personal information publicly. Use the platform's messaging system.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Be Helpful</h4>
                    <p className="text-sm text-muted-foreground">
                      If you have information that might help, share it even if you don't have the item.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Lost Item Hotspots</CardTitle>
                  <CardDescription>Common places where items are lost at FAST-NUCES</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { location: "CS Labs (A-Block)", count: 45 },
                    { location: "Cafeteria", count: 38 },
                    { location: "Library", count: 32 },
                    { location: "Sports Complex", count: 24 },
                    { location: "Lecture Halls", count: 22 }
                  ].map((hotspot, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{hotspot.location}</span>
                      </div>
                      <Badge variant="outline">{hotspot.count}</Badge>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Based on reports from the past 30 days
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Share your question or information with the community
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                placeholder="Title of your post"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <Textarea
                id="content"
                placeholder="Share your question or information..."
                className="min-h-[150px]"
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitPost} disabled={createPostMutation.isPending}>
              {createPostMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

interface CommunityPostProps {
  post: Post;
  currentUser: { id: string; name: string } | null;
  isAuthenticated: boolean;
  onLike: () => void;
}

const CommunityPost = ({ post, currentUser, isAuthenticated, onLike }: CommunityPostProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [timeAgo, setTimeAgo] = useState("");
  
  useEffect(() => {
    const getTimeAgo = (date: string) => {
      const now = new Date();
      const postDate = new Date(date);
      const diffMs = now.getTime() - postDate.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffMins < 24 * 60) {
        const hours = Math.floor(diffMins / 60);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(diffMins / (60 * 24));
        return `${days} day${days !== 1 ? 's' : ''} ago`;
      }
    };
    
    setTimeAgo(getTimeAgo(post.createdAt));
  }, [post.createdAt]);
  
  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
      });
      return;
    }
    onLike();
  };
  
  const handleComment = () => {
    navigate(`/community/${post._id}`);
  };
  
  const handleViewDetails = () => {
    navigate(`/community/${post._id}`);
  };
  
  const isLikedByCurrentUser = currentUser ? post.likes.includes(currentUser.id) : false;
  
  return (
    <Card className="hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
              <AvatarImage src="" />
            </Avatar>
            <div>
              <div className="font-medium">{post.user.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {timeAgo}
              </div>
            </div>
          </div>
          
          <Badge variant={post.resolved ? "default" : "outline"}>
            {post.resolved ? "Resolved" : "Open"}
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-muted-foreground mb-4">
          {post.content.length > 200 
            ? `${post.content.substring(0, 200)}...` 
            : post.content}
        </p>
        
        <div className="flex justify-between items-center pt-4 border-t border-border/50">
          <Button 
            variant={isLikedByCurrentUser ? "default" : "ghost"} 
            size="sm" 
            onClick={handleLike}
            className={isLikedByCurrentUser ? "bg-primary/20 hover:bg-primary/30" : ""}
          >
            <ThumbsUp className="mr-1 h-4 w-4" />
            {post.likes.length}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleComment}>
            <MessageSquare className="mr-1 h-4 w-4" />
            {post.comments.length}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleViewDetails}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Community;
