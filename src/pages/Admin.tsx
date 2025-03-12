import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ListChecks, 
  ShieldAlert, 
  Users, 
  Package, 
  AlertTriangle, 
  BarChart3, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import UserManagement from '@/components/admin/UserManagement';

// Mock data for claims
const mockClaims = [
  {
    id: "claim1",
    itemId: "1",
    itemName: "MacBook Pro 16-inch",
    claimantName: "Ali Hassan",
    claimantEmail: "k224567@nu.edu.pk",
    dateSubmitted: "Oct 30, 2023",
    status: "pending",
    description: "I can identify the MacBook by the crack on the bottom right corner and the Star Wars sticker on the lid. Lost it in the library on Oct 12."
  },
  {
    id: "claim2",
    itemId: "2",
    itemName: "Silver iPhone 13",
    claimantName: "Fatima Khan",
    claimantEmail: "k225678@nu.edu.pk",
    dateSubmitted: "Oct 29, 2023",
    status: "approved",
    description: "My phone has a photo of me and my family as wallpaper and has a small crack in the top right corner of the case."
  },
  {
    id: "claim3",
    itemId: "3",
    itemName: "Student ID Card",
    claimantName: "Usman Ali",
    claimantEmail: "k226789@nu.edu.pk",
    dateSubmitted: "Oct 28, 2023",
    status: "rejected",
    description: "The ID card has my photo and ID number K226789 on it."
  }
];

// Mock data for items that need attention
const highValueItems = [
  {
    id: "1",
    title: "MacBook Pro 16-inch",
    location: "University Library, 2nd Floor",
    date: "Oct 12, 2023",
    status: "lost",
    isHighValue: true
  },
  {
    id: "4",
    title: "Black Leather Wallet",
    location: "Campus Shuttle Bus",
    date: "Oct 20, 2023",
    status: "lost",
    isHighValue: true
  },
  {
    id: "6",
    title: "Apple AirPods Pro",
    location: "Gymnasium, Locker Room",
    date: "Oct 22, 2023",
    status: "lost",
    isHighValue: true
  }
];

// Mock stats data
const statsData = {
  totalItems: 24,
  lostItems: 14,
  foundItems: 10,
  resolvedItems: 8,
  highValueItems: 5,
  claimsPending: 3,
  claimsResolved: 5
};

const Admin = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingClaimId, setProcessingClaimId] = useState<string | null>(null);

  // If not authenticated or not an admin, redirect to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin dashboard.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);

  const handleViewItem = (itemId: string) => {
    navigate(`/items/${itemId}`);
  };

  const handleProcessClaim = (claimId: string, action: 'approve' | 'reject') => {
    setProcessingClaimId(claimId);
    
    // Simulate processing
    setTimeout(() => {
      toast({
        title: action === 'approve' ? "Claim Approved" : "Claim Rejected",
        description: `The claim has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
      setProcessingClaimId(null);
    }, 1500);
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Redirecting...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage lost and found items at FAST-NUCES Islamabad Campus
          </p>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <h3 className="text-3xl font-bold">{statsData.totalItems}</h3>
              </div>
              <Package className="h-10 w-10 text-primary/70" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Claims</p>
                <h3 className="text-3xl font-bold">{statsData.claimsPending}</h3>
              </div>
              <Clock className="h-10 w-10 text-amber-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Value Items</p>
                <h3 className="text-3xl font-bold">{statsData.highValueItems}</h3>
              </div>
              <AlertTriangle className="h-10 w-10 text-amber-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved Items</p>
                <h3 className="text-3xl font-bold">{statsData.resolvedItems}</h3>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="claims">
          <TabsList className="w-full flex-wrap mb-6">
            <TabsTrigger value="claims" className="flex items-center">
              <ListChecks className="h-4 w-4 mr-2" />
              Pending Claims
            </TabsTrigger>
            <TabsTrigger value="high-value" className="flex items-center">
              <ShieldAlert className="h-4 w-4 mr-2" />
              High Value Items
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
          </TabsList>
          
          {/* Claims Tab */}
          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle>Pending Claims</CardTitle>
                <CardDescription>
                  Review and process claims for lost and found items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockClaims.map((claim) => (
                    <div 
                      key={claim.id}
                      className="p-4 border border-border rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-medium">{claim.itemName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Claimed by: {claim.claimantName} ({claim.claimantEmail})
                          </p>
                        </div>
                        <div className="md:text-right mt-2 md:mt-0">
                          <p className="text-sm text-muted-foreground">
                            Submitted: {claim.dateSubmitted}
                          </p>
                          <Badge 
                            className={`
                              ${claim.status === 'pending' ? 'bg-amber-500 text-white' : ''}
                              ${claim.status === 'approved' ? 'bg-green-500 text-white' : ''}
                              ${claim.status === 'rejected' ? 'bg-destructive text-destructive-foreground' : ''}
                              uppercase
                            `}
                          >
                            {claim.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        <strong>Claim Details:</strong> {claim.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewItem(claim.itemId)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Item
                        </Button>
                        
                        {claim.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="bg-green-500 hover:bg-green-600 text-white"
                              disabled={processingClaimId === claim.id}
                              onClick={() => handleProcessClaim(claim.id, 'approve')}
                            >
                              {processingClaimId === claim.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Approve
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="destructive"
                              disabled={processingClaimId === claim.id}
                              onClick={() => handleProcessClaim(claim.id, 'reject')}
                            >
                              {processingClaimId === claim.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                              )}
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* High Value Items Tab */}
          <TabsContent value="high-value">
            <Card>
              <CardHeader>
                <CardTitle>High Value Items</CardTitle>
                <CardDescription>
                  Monitor high-value items that require special attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {highValueItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 border border-border rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <div className="flex justify-between mb-2">
                        <h3 className="text-lg font-medium">{item.title}</h3>
                        <Badge 
                          className={`${item.status === 'lost' ? 'bg-destructive text-destructive-foreground' : 'bg-green-500 text-white'} uppercase`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Location:</span> {item.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Date:</span> {item.date}
                        </p>
                      </div>
                      
                      <Button size="sm" onClick={() => handleViewItem(item.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  View statistics and trends for the FAST-NUCES Lost and Found system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Items Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium">Lost Items</p>
                            <p className="text-sm font-medium">{statsData.lostItems} / {statsData.totalItems}</p>
                          </div>
                          <Progress value={(statsData.lostItems / statsData.totalItems) * 100} className="h-2 bg-primary/20" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium">Found Items</p>
                            <p className="text-sm font-medium">{statsData.foundItems} / {statsData.totalItems}</p>
                          </div>
                          <Progress value={(statsData.foundItems / statsData.totalItems) * 100} className="h-2 bg-primary/20" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium">Resolved Items</p>
                            <p className="text-sm font-medium">{statsData.resolvedItems} / {statsData.totalItems}</p>
                          </div>
                          <Progress value={(statsData.resolvedItems / statsData.totalItems) * 100} className="h-2 bg-primary/20" />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 border border-border rounded-lg bg-card/50">
                          <h4 className="text-sm font-medium mb-2">Claim Resolution Rate</h4>
                          <p className="text-3xl font-bold">
                            {Math.round((statsData.claimsResolved / (statsData.claimsResolved + statsData.claimsPending)) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {statsData.claimsResolved} out of {statsData.claimsResolved + statsData.claimsPending} claims resolved
                          </p>
                        </div>
                        
                        <div className="p-4 border border-border rounded-lg bg-card/50">
                          <h4 className="text-sm font-medium mb-2">Item Recovery Rate</h4>
                          <p className="text-3xl font-bold">
                            {Math.round((statsData.resolvedItems / statsData.totalItems) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {statsData.resolvedItems} out of {statsData.totalItems} items recovered
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Button size="sm">
                      Generate Detailed Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* User Management Tab */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
