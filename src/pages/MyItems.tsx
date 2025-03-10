
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, ShieldAlert, CheckCircle, MailQuestion, Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  status: "lost" | "found";
  image: string;
  claimStatus?: "pending" | "approved" | "denied";
  isHighValue?: boolean;
}

const MyItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("my-lost-items");
  const [viewingItem, setViewingItem] = useState<Item | null>(null);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  
  // If no user is logged in, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const myLostItems: Item[] = [
    {
      id: "L123",
      title: "Blue Moleskine Notebook",
      description: "Contains notes for Data Structures and Algorithms. Has my name (Ahsan) on the first page.",
      category: "Books/Notes",
      location: "CS Building, Room 204",
      date: "2023-05-15",
      status: "lost",
      image: "/placeholder.svg",
      claimStatus: "pending"
    },
    {
      id: "L456",
      title: "Samsung Galaxy Buds",
      description: "White wireless earbuds in a charging case. Left them in the library study area.",
      category: "Electronics",
      location: "Main Library, 2nd Floor",
      date: "2023-05-12",
      status: "lost",
      image: "/placeholder.svg",
      isHighValue: true
    }
  ];
  
  const myFoundItems: Item[] = [
    {
      id: "F789",
      title: "Water Bottle (Hydroflask)",
      description: "Blue Hydroflask water bottle with stickers. Found near the basketball court.",
      category: "Personal Items",
      location: "Sports Complex",
      date: "2023-05-20",
      status: "found",
      image: "/placeholder.svg"
    }
  ];
  
  const myClaims: Item[] = [
    {
      id: "C101",
      title: "Calculator",
      description: "Scientific calculator, Casio fx-991ES PLUS. Found in Physics Lab.",
      category: "Electronics",
      location: "Science Building, Room 103",
      date: "2023-05-10",
      status: "found",
      image: "/placeholder.svg",
      claimStatus: "approved"
    },
    {
      id: "C102",
      title: "Student ID Card",
      description: "FAST-NUCES Student ID Card under the name Muhammad Ali.",
      category: "Documents",
      location: "Cafeteria",
      date: "2023-05-08",
      status: "found",
      image: "/placeholder.svg",
      claimStatus: "denied"
    }
  ];
  
  const handleClaim = (item: Item) => {
    toast({
      title: "Claim Submitted",
      description: "Your claim for this item has been submitted and is under review."
    });
    setClaimDialogOpen(false);
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "denied":
        return <ShieldAlert className="h-5 w-5 text-destructive" />;
      default:
        return <MailQuestion className="h-5 w-5 text-primary" />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "approved":
        return "Claim Approved";
      case "denied":
        return "Claim Denied";
      default:
        return "Not Claimed";
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow py-10">
        <div className="container max-w-6xl">
          <h1 className="text-3xl font-bold mb-2">My Items</h1>
          <p className="text-muted-foreground mb-6">
            Manage your lost and found items and track claim status
          </p>
          
          <Tabs defaultValue="my-lost-items" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="my-lost-items">
                My Lost Items
              </TabsTrigger>
              <TabsTrigger value="my-found-items">
                My Found Items
              </TabsTrigger>
              <TabsTrigger value="my-claims">
                My Claims
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-lost-items">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myLostItems.length > 0 ? (
                  myLostItems.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onView={() => setViewingItem(item)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium mb-2">No Lost Items Reported</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't reported any lost items yet.
                    </p>
                    <Button asChild>
                      <Link to="/report">Report a Lost Item</Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="my-found-items">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myFoundItems.length > 0 ? (
                  myFoundItems.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onView={() => setViewingItem(item)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium mb-2">No Found Items Reported</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't reported any found items yet.
                    </p>
                    <Button asChild>
                      <Link to="/report">Report a Found Item</Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="my-claims">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myClaims.length > 0 ? (
                  myClaims.map((item) => (
                    <ClaimCard 
                      key={item.id} 
                      item={item} 
                      onView={() => setViewingItem(item)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium mb-2">No Claims Submitted</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't submitted any claims for found items yet.
                    </p>
                    <Button asChild>
                      <Link to="/found-items">Browse Found Items</Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {viewingItem && (
        <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setViewingItem(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{viewingItem.title}</DialogTitle>
              <DialogDescription>
                {viewingItem.status === "lost" ? "Lost on " : "Found on "} 
                {new Date(viewingItem.date).toLocaleDateString()} at {viewingItem.location}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-md">
                <img 
                  src={viewingItem.image} 
                  alt={viewingItem.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Badge>{viewingItem.category}</Badge>
                  <Badge 
                    variant={viewingItem.status === "lost" ? "destructive" : "default"}
                    className="uppercase"
                  >
                    {viewingItem.status}
                  </Badge>
                </div>
                
                {viewingItem.claimStatus && (
                  <div className="flex items-center gap-2 text-sm">
                    {getStatusIcon(viewingItem.claimStatus)}
                    <span>{getStatusText(viewingItem.claimStatus)}</span>
                  </div>
                )}
                
                <p className="text-sm">{viewingItem.description}</p>
              </div>
              
              <Separator />
              
              {viewingItem.status === "found" && !viewingItem.claimStatus && (
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setViewingItem(null);
                    setClaimDialogOpen(true);
                  }}
                >
                  Submit Claim
                </Button>
              )}
              
              {viewingItem.claimStatus === "approved" && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md text-sm">
                  <p className="font-medium text-green-600 dark:text-green-400">Your claim has been approved!</p>
                  <p className="mt-1">You can collect this item from the CS Academic Office during working hours (9 AM - 5 PM).</p>
                </div>
              )}
              
              {viewingItem.claimStatus === "denied" && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-sm">
                  <p className="font-medium text-red-600 dark:text-red-400">Your claim was not approved</p>
                  <p className="mt-1">The information provided wasn't sufficient to verify ownership. Please contact the CS Academic Office for more details.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Claim</DialogTitle>
            <DialogDescription>
              Provide details that can help verify you're the owner of this item.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm">
              To claim this item, please answer the following questions. Your answers will be reviewed by the administrators to verify your ownership.
            </p>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">1. When did you lose this item?</h4>
              <input 
                type="date" 
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">2. Where did you lose this item?</h4>
              <input 
                type="text"
                className="w-full p-2 border rounded-md" 
                placeholder="Be as specific as possible"
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">3. Provide specific details about the item that only the owner would know:</h4>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[80px]"
                placeholder="E.g., scratches, marks, contents, etc."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleClaim(viewingItem!)}>
              Submit Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

interface ItemCardProps {
  item: Item;
  onView: () => void;
}

const ItemCard = ({ item, onView }: ItemCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          {item.isHighValue && (
            <Badge className="bg-amber-500 text-white">High Value</Badge>
          )}
        </div>
        <CardDescription>{item.category}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow">
        <p className="text-sm line-clamp-2 mb-2">{item.description}</p>
        <div className="text-sm text-muted-foreground">
          {item.status === "lost" ? "Lost on " : "Found on "} 
          {new Date(item.date).toLocaleDateString()}
        </div>
        <div className="text-sm text-muted-foreground">
          {item.location}
        </div>
        
        {item.claimStatus && (
          <div className="flex items-center gap-2 mt-2 text-sm">
            {getStatusIcon(item.claimStatus)}
            <span>{getStatusText(item.claimStatus)}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onView}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

const ClaimCard = ({ item, onView }: ItemCardProps) => {
  const getClaimStatusClass = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-50 border-amber-200";
      case "approved": return "bg-green-50 border-green-200";
      case "denied": return "bg-red-50 border-red-200";
      default: return "";
    }
  };
  
  return (
    <Card className={`overflow-hidden h-full flex flex-col ${item.claimStatus ? getClaimStatusClass(item.claimStatus) : ""}`}>
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <Badge 
            variant="outline"
            className={item.claimStatus === "approved" ? "border-green-200 text-green-700" : 
                       item.claimStatus === "denied" ? "border-red-200 text-red-700" : 
                       "border-amber-200 text-amber-700"}
          >
            {getStatusText(item.claimStatus || "")}
          </Badge>
        </div>
        <CardDescription>{item.category}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow">
        <p className="text-sm line-clamp-2 mb-2">{item.description}</p>
        <div className="text-sm text-muted-foreground">
          Found on {new Date(item.date).toLocaleDateString()}
        </div>
        <div className="text-sm text-muted-foreground">
          {item.location}
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          {getStatusIcon(item.claimStatus || "")}
          <span className="text-sm font-medium">
            {item.claimStatus === "approved" ? "Ready for pickup" : 
             item.claimStatus === "denied" ? "Claim rejected" : 
             "Under review"}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onView}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MyItems;
