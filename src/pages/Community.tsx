
import React, { useState } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, MessageSquare, ThumbsUp, Calendar, Filter, PlusCircle, MapPin, Clock, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Community = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState(communityPosts);
  const [activeTab, setActiveTab] = useState("recent");
  
  // New post form state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Comment state
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredPosts(communityPosts);
      return;
    }
    
    const filtered = communityPosts.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredPosts(filtered);
    
    if (filtered.length === 0) {
      toast({
        title: "No Results Found",
        description: "Try different search terms or filters.",
      });
    } else {
      toast({
        title: `${filtered.length} Results Found`,
        description: "Displaying search results.",
      });
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === "my-posts" && !user) {
      toast({
        title: "Login Required",
        description: "Please login to see your posts.",
        variant: "destructive"
      });
    }
    
    // In a real app, you would filter posts based on the tab
    if (value === "popular") {
      const sortedPosts = [...communityPosts].sort((a, b) => b.likes - a.likes);
      setFilteredPosts(sortedPosts);
    } else if (value === "recent") {
      setFilteredPosts(communityPosts);
    } else if (value === "my-posts" && user) {
      const userPosts = communityPosts.filter(post => post.author.name === user.name);
      setFilteredPosts(userPosts);
    }
  };
  
  const handleNewPost = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to create a post.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    setIsPostDialogOpen(true);
  };
  
  const submitNewPost = () => {
    if (!postTitle.trim() || !postContent.trim() || !postCategory || !postLocation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would submit to a backend
    const newPost = {
      id: communityPosts.length + 1,
      title: postTitle,
      content: postContent,
      author: {
        name: isAnonymous ? "Anonymous" : (user?.name || "Anonymous"),
        avatar: ""
      },
      category: postCategory,
      location: postLocation,
      timestamp: "Just now",
      comments: 0,
      likes: 0,
      isResolved: false
    };
    
    communityPosts.unshift(newPost);
    setFilteredPosts([...communityPosts]);
    
    toast({
      title: "Post Created",
      description: "Your post has been successfully published.",
    });
    
    // Reset form
    setPostTitle('');
    setPostContent('');
    setPostCategory('');
    setPostLocation('');
    setIsAnonymous(false);
    setIsPostDialogOpen(false);
  };
  
  const handleLike = (postId: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to like posts.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedPosts = communityPosts.map(post => {
      if (post.id === postId) {
        return { ...post, likes: post.likes + 1 };
      }
      return post;
    });
    
    communityPosts.length = 0;
    communityPosts.push(...updatedPosts);
    setFilteredPosts([...communityPosts]);
    
    toast({
      title: "Post Liked",
      description: "You've liked this post.",
    });
  };
  
  const toggleCommentSection = (postId: number) => {
    setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
    setCommentText('');
  };
  
  const submitComment = (postId: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to comment.",
        variant: "destructive"
      });
      return;
    }
    
    if (!commentText.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please enter a comment.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedPosts = communityPosts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: post.comments + 1 };
      }
      return post;
    });
    
    communityPosts.length = 0;
    communityPosts.push(...updatedPosts);
    setFilteredPosts([...communityPosts]);
    
    toast({
      title: "Comment Added",
      description: "Your comment has been posted.",
    });
    
    setCommentText('');
    setActiveCommentPostId(null);
  };
  
  const markAsResolved = (postId: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to update posts.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedPosts = communityPosts.map(post => {
      if (post.id === postId) {
        return { ...post, isResolved: true };
      }
      return post;
    });
    
    communityPosts.length = 0;
    communityPosts.push(...updatedPosts);
    setFilteredPosts([...communityPosts]);
    
    toast({
      title: "Post Updated",
      description: "Post has been marked as resolved.",
    });
  };
  
  const viewPostDetails = (postId: number) => {
    // In a real app, this would navigate to a detailed post view
    toast({
      title: "Viewing Post Details",
      description: "Full post details would be displayed here.",
    });
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <CommunityPost 
                        key={post.id} 
                        post={post} 
                        onLike={handleLike}
                        onComment={toggleCommentSection}
                        onSubmitComment={submitComment}
                        onViewDetails={viewPostDetails}
                        onMarkResolved={markAsResolved}
                        isCommentActive={activeCommentPostId === post.id}
                        commentText={activeCommentPostId === post.id ? commentText : ''}
                        setCommentText={setCommentText}
                        isCurrentUserAuthor={user?.name === post.author.name}
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No posts found. Try different search terms or create a new post.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="popular" className="space-y-4 mt-2">
                  {user ? (
                    filteredPosts.length > 0 ? (
                      filteredPosts.map((post) => (
                        <CommunityPost 
                          key={post.id} 
                          post={post} 
                          onLike={handleLike}
                          onComment={toggleCommentSection}
                          onSubmitComment={submitComment}
                          onViewDetails={viewPostDetails}
                          onMarkResolved={markAsResolved}
                          isCommentActive={activeCommentPostId === post.id}
                          commentText={activeCommentPostId === post.id ? commentText : ''}
                          setCommentText={setCommentText}
                          isCurrentUserAuthor={user?.name === post.author.name}
                        />
                      ))
                    ) : (
                      <div className="p-12 text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No popular posts found.</p>
                      </div>
                    )
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Login to view popular posts</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="my-posts" className="space-y-4 mt-2">
                  {user ? (
                    filteredPosts.length > 0 ? (
                      filteredPosts.map((post) => (
                        <CommunityPost 
                          key={post.id} 
                          post={post} 
                          onLike={handleLike}
                          onComment={toggleCommentSection}
                          onSubmitComment={submitComment}
                          onViewDetails={viewPostDetails}
                          onMarkResolved={markAsResolved}
                          isCommentActive={activeCommentPostId === post.id}
                          commentText={activeCommentPostId === post.id ? commentText : ''}
                          setCommentText={setCommentText}
                          isCurrentUserAuthor={true}
                        />
                      ))
                    ) : (
                      <div className="p-12 text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>You haven't created any posts yet.</p>
                      </div>
                    )
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Login to view your posts</p>
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
      
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Share details about your lost or found item to get help from the community.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Post Title</Label>
              <Input
                id="title"
                placeholder="e.g., Lost my calculator in CS-5 Lab"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Description</Label>
              <Textarea
                id="content"
                placeholder="Provide detailed information about the item..."
                rows={4}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={postCategory} onValueChange={setPostCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Books/Notes">Books/Notes</SelectItem>
                    <SelectItem value="Documents">Documents</SelectItem>
                    <SelectItem value="Bags">Bags</SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Select value={postLocation} onValueChange={setPostLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A-Block, CS Labs">A-Block, CS Labs</SelectItem>
                    <SelectItem value="B-Block">B-Block</SelectItem>
                    <SelectItem value="Cafeteria">Cafeteria</SelectItem>
                    <SelectItem value="Library">Library</SelectItem>
                    <SelectItem value="Sports Complex">Sports Complex</SelectItem>
                    <SelectItem value="Lecture Halls">Lecture Halls</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <Label htmlFor="anonymous">Post Anonymously</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitNewPost}>
              Create Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

interface CommunityPostProps {
  post: {
    id: number;
    title: string;
    content: string;
    author: {
      name: string;
      avatar: string;
    };
    category: string;
    location: string;
    timestamp: string;
    comments: number;
    likes: number;
    isResolved: boolean;
  };
  onLike: (id: number) => void;
  onComment: (id: number) => void;
  onSubmitComment: (id: number) => void;
  onViewDetails: (id: number) => void;
  onMarkResolved: (id: number) => void;
  isCommentActive: boolean;
  commentText: string;
  setCommentText: React.Dispatch<React.SetStateAction<string>>;
  isCurrentUserAuthor: boolean;
}

const CommunityPost = ({ 
  post, 
  onLike, 
  onComment, 
  onSubmitComment, 
  onViewDetails, 
  onMarkResolved,
  isCommentActive,
  commentText,
  setCommentText,
  isCurrentUserAuthor
}: CommunityPostProps) => {
  
  return (
    <Card className="hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              <AvatarImage src={post.author.avatar} />
            </Avatar>
            <div>
              <div className="font-medium">{post.author.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {post.timestamp}
              </div>
            </div>
          </div>
          
          <Badge variant={post.isResolved ? "default" : "outline"}>
            {post.isResolved ? "Resolved" : "Open"}
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-muted-foreground mb-4">{post.content}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{post.category}</Badge>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <MapPin className="h-3 w-3" />
            {post.location}
          </div>
        </div>
        
        {isCommentActive && (
          <div className="mt-4 mb-4 space-y-2 p-3 bg-muted/40 rounded-md">
            <div className="flex space-x-2">
              <Textarea 
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 min-h-[80px]"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" size="sm" onClick={() => onComment(post.id)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => onSubmitComment(post.id)}>
                Post Comment
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t border-border/50">
          <Button variant="ghost" size="sm" onClick={() => onLike(post.id)}>
            <ThumbsUp className="mr-1 h-4 w-4" />
            {post.likes}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => onComment(post.id)}>
            <MessageSquare className="mr-1 h-4 w-4" />
            {post.comments}
          </Button>
          
          <div className="flex space-x-2">
            {isCurrentUserAuthor && !post.isResolved && (
              <Button variant="outline" size="sm" onClick={() => onMarkResolved(post.id)}>
                Mark Resolved
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onViewDetails(post.id)}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mock community posts
const communityPosts = [
  {
    id: 1,
    title: "Lost my Casio FX-991ES calculator in CS-5 Lab",
    content: "I was in the CS-5 Lab in A-Block yesterday between 1-3 PM for my Programming Fundamentals lab. I think I left my Casio scientific calculator there. It has my name (Usman) written on the back. If anyone found it, please let me know!",
    author: {
      name: "Usman Ali",
      avatar: ""
    },
    category: "Electronics",
    location: "A-Block, CS-5 Lab",
    timestamp: "Yesterday at 6:45 PM",
    comments: 3,
    likes: 5,
    isResolved: false
  },
  {
    id: 2,
    title: "Found a black backpack in the cafeteria",
    content: "I found a black Adidas backpack in the cafeteria near the drink counter around 1:30 PM today. It has some books and a pencil case inside. I've handed it to the cafeteria staff. The owner can collect it from there.",
    author: {
      name: "Sara Khan",
      avatar: ""
    },
    category: "Bags",
    location: "Cafeteria",
    timestamp: "Today at 2:15 PM",
    comments: 1,
    likes: 8,
    isResolved: true
  },
  {
    id: 3,
    title: "Lost my student ID card near library",
    content: "I lost my FAST-NUCES student ID card (FA-21-BCS-123) somewhere near the library entrance. I need it urgently for tomorrow's exam. Please contact me if you find it!",
    author: {
      name: "Ahmed Raza",
      avatar: ""
    },
    category: "Documents",
    location: "Library",
    timestamp: "Today at 11:20 AM",
    comments: 5,
    likes: 12,
    isResolved: false
  },
  {
    id: 4,
    title: "Left my notes in the B-Block",
    content: "I left my Database Systems notes (green spiral notebook) in Room B-4 after the lecture today. If anyone found it, please let me know. I need it for the upcoming quiz!",
    author: {
      name: "Zainab Fatima",
      avatar: ""
    },
    category: "Books/Notes",
    location: "B-Block, Room B-4",
    timestamp: "Yesterday at 3:30 PM",
    comments: 0,
    likes: 2,
    isResolved: false
  }
];

export default Community;
