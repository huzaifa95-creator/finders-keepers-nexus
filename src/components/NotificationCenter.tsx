
import React, { useState } from 'react';
import { Bell, X, AlertCircle, Check, Clock, User, MessageSquare, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

// Types
export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'claim' | 'comment' | 'alert' | 'system';
  link?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Claim Approved',
    description: 'Your claim for "MacBook Pro" has been approved. Please visit CS Academic Office to collect it.',
    timestamp: '10 minutes ago',
    read: false,
    type: 'claim',
    link: '/items/1'
  },
  {
    id: '2',
    title: 'New Comment',
    description: 'Someone commented on your lost item "Blue Backpack": "I think I saw it in the cafeteria yesterday"',
    timestamp: '1 hour ago',
    read: false,
    type: 'comment',
    link: '/items/2'
  },
  {
    id: '3',
    title: 'Possible Match Found',
    description: 'A found item matches your lost "Student ID Card". Check it out!',
    timestamp: '3 hours ago',
    read: true,
    type: 'alert',
    link: '/items/3'
  },
  {
    id: '4',
    title: 'Claim Request',
    description: 'Someone has claimed the "Wireless Earbuds" you reported found.',
    timestamp: '1 day ago',
    read: true,
    type: 'claim',
    link: '/items/4'
  },
  {
    id: '5',
    title: 'System Notification',
    description: 'Your lost item report will expire in 2 days. Update it to keep it active.',
    timestamp: '2 days ago',
    read: true,
    type: 'system',
    link: '/my-items'
  }
];

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const { toast } = useToast();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    toast({
      title: "All notifications marked as read",
      description: `${unreadCount} notification${unreadCount !== 1 ? 's' : ''} marked as read.`
    });
  };
  
  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
  };
  
  const clearAll = () => {
    setNotifications([]);
    setOpen(false);
    toast({
      title: "Notifications cleared",
      description: "All notifications have been removed."
    });
  };
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'claim':
        return <Package className="h-5 w-5 text-violet-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'system':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Notifications</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="h-8 text-xs"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Mark all as read
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAll}
                  className="h-8 text-xs text-destructive hover:text-destructive"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear all
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <Link 
                    key={notification.id}
                    to={notification.link || '#'}
                    onClick={() => {
                      markAsRead(notification.id);
                      setOpen(false);
                    }}
                    className="block"
                  >
                    <div 
                      className={`flex gap-3 p-3 transition-colors rounded-lg hover:bg-accent/50 ${
                        !notification.read ? 'bg-accent/20' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <Badge variant="secondary" className="h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-1" />
                  </Link>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationCenter;
