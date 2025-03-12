
import React from 'react';
import { CheckCircle, Clock, X, HelpCircle, User, Package } from 'lucide-react';

// Define the status types
export type ItemStatus = 'pending' | 'claimed' | 'resolved' | 'rejected' | 'lost' | 'found' | 'approved';

// Get appropriate icon for each status
export const getStatusIcon = (status: ItemStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'claimed':
      return <User className="h-4 w-4 text-blue-500" />;
    case 'resolved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <X className="h-4 w-4 text-destructive" />;
    case 'lost':
      return <HelpCircle className="h-4 w-4 text-destructive" />;
    case 'found':
      return <Package className="h-4 w-4 text-green-500" />;
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

// Get appropriate text for each status
export const getStatusText = (status: ItemStatus) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'claimed':
      return 'Claimed';
    case 'resolved':
      return 'Resolved';
    case 'rejected':
      return 'Rejected';
    case 'lost':
      return 'Lost';
    case 'found':
      return 'Found';
    case 'approved':
      return 'Approved';
    default:
      return 'Unknown';
  }
};

// Get appropriate color for each status badge
export const getStatusColor = (status: ItemStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-500 text-white';
    case 'claimed':
      return 'bg-blue-500 text-white';
    case 'resolved':
      return 'bg-green-500 text-white';
    case 'rejected':
      return 'bg-destructive text-destructive-foreground';
    case 'lost':
      return 'bg-destructive text-destructive-foreground';
    case 'found':
      return 'bg-green-500 text-white';
    case 'approved':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};
