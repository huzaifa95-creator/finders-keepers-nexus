
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { User, ShieldCheck, Lock, Bell, Bookmark, Loader2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  const { user, token, updateUserInfo } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // User details state
  const [name, setName] = useState(user?.name || '');
  const [isAdmin, setIsAdmin] = useState(user?.role === 'admin');
  
  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [claimNotifications, setClaimNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [matchedItemNotifications, setMatchedItemNotifications] = useState(true);

  // Set initial values when user data loads
  useEffect(() => {
    if (user) {
      setName(user.name);
      setIsAdmin(user.role === 'admin');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      
      // Update the user info in context
      updateUserInfo(updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated."
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation password must match.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }
      
      // Reset the form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated."
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to update notification preferences
    toast({
      title: "Notification Preferences Updated",
      description: "Your notification preferences have been saved."
    });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container max-w-6xl py-10">
      <div className="flex flex-col space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and notification preferences.
          </p>
        </div>
        <Separator />

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-3 md:grid-cols-none h-auto">
            <TabsTrigger value="account" className="data-[state=active]:bg-primary/10 py-2">
              <User className="mr-2 h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary/10 py-2">
              <Lock className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/10 py-2">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your account details and preferences.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdateProfile}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={user.email} 
                        placeholder="Your email"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Email address cannot be changed. Contact an administrator if you need to update it.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <div className="flex items-center space-x-2 rounded-md border p-2">
                        <ShieldCheck className={`h-5 w-5 ${isAdmin ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-medium">{user.role === 'admin' ? 'Administrator' : user.role === 'staff' ? 'Staff' : 'Student'}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isUpdatingProfile}>
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Update your password and security preferences.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdatePassword}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        type="password" 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                    >
                      {isUpdatingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Customize when and how you receive notifications.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdateNotifications}>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          checked={emailNotifications}
                          onChange={() => setEmailNotifications(!emailNotifications)}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="claimNotifications">Item Claim Status</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications when your claim status changes
                        </p>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="claimNotifications"
                          checked={claimNotifications}
                          onChange={() => setClaimNotifications(!claimNotifications)}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="commentNotifications">Community Comments</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications when someone comments on your posts
                        </p>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="commentNotifications"
                          checked={commentNotifications}
                          onChange={() => setCommentNotifications(!commentNotifications)}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="matchedItemNotifications">Item Match Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Alerts when an item matching your description is found
                        </p>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="matchedItemNotifications"
                          checked={matchedItemNotifications}
                          onChange={() => setMatchedItemNotifications(!matchedItemNotifications)}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit">Save Preferences</Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
