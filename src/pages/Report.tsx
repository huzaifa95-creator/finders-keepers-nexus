
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, MapPin, Calendar, Info, FileCheck } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";

const Report = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('type') === 'found' ? 'found' : 'lost';
  const { toast } = useToast();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Report an Item</h1>
            <p className="text-muted-foreground">
              Report a lost or found item at FAST-NUCES Islamabad campus
            </p>
          </div>
          
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="lost">I Lost an Item</TabsTrigger>
              <TabsTrigger value="found">I Found an Item</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lost">
              <ReportLostItemForm />
            </TabsContent>
            
            <TabsContent value="found">
              <ReportFoundItemForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

const ReportLostItemForm = () => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Report Submitted",
      description: "Your lost item report has been submitted successfully!",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Lost Item</CardTitle>
        <CardDescription>
          Provide details about the item you lost at FAST-NUCES Islamabad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="item-name" className="text-sm font-medium">Item Name</label>
              <Input id="item-name" placeholder="e.g. Laptop, ID Card, Wallet" required />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="stationery">Stationery</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="documents">ID/Documents</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea 
              id="description" 
              placeholder="Provide detailed description of the item (color, brand, identifying marks, etc.)" 
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="last-seen" className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Last Seen Location
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a-block">A-Block</SelectItem>
                  <SelectItem value="b-block">B-Block</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="cafeteria">Cafeteria</SelectItem>
                  <SelectItem value="sports-complex">Sports Complex</SelectItem>
                  <SelectItem value="outside">Outside Campus</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="date-lost" className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date Lost
              </label>
              <Input type="date" id="date-lost" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Upload Image (Optional)
            </label>
            <div className="border border-dashed border-border rounded-lg p-8 text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop an image or click to browse
              </p>
              <Button type="button" size="sm" variant="outline">Browse Files</Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="contact" className="text-sm font-medium">Contact Information</label>
            <Input id="contact" placeholder="Your email or phone number" required />
          </div>
          
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Your contact information will only be shared with verified staff members or the person who found your item.
            </p>
          </div>
          
          <Button type="submit" className="w-full">
            <FileCheck className="mr-2 h-4 w-4" />
            Submit Lost Item Report
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ReportFoundItemForm = () => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Report Submitted",
      description: "Thank you for reporting a found item!",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Found Item</CardTitle>
        <CardDescription>
          Provide details about the item you found at FAST-NUCES Islamabad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="item-name" className="text-sm font-medium">Item Name</label>
              <Input id="item-name" placeholder="e.g. Laptop, ID Card, Wallet" required />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="stationery">Stationery</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="documents">ID/Documents</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea 
              id="description" 
              placeholder="Provide a general description (avoid including unique identifying details that only the owner would know)"
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="found-location" className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Found Location
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a-block">A-Block</SelectItem>
                  <SelectItem value="b-block">B-Block</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="cafeteria">Cafeteria</SelectItem>
                  <SelectItem value="sports-complex">Sports Complex</SelectItem>
                  <SelectItem value="outside">Outside Campus</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="date-found" className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date Found
              </label>
              <Input type="date" id="date-found" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Upload Image
            </label>
            <div className="border border-dashed border-border rounded-lg p-8 text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop an image or click to browse
              </p>
              <Button type="button" size="sm" variant="outline">Browse Files</Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="contact" className="text-sm font-medium">Contact Information (Optional)</label>
            <Input id="contact" placeholder="Your email or phone number" />
            <p className="text-xs text-muted-foreground">
              Leave blank to report anonymously. The item will be directed to the appropriate lost & found office.
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Please turn in valuable items (electronics, wallets, IDs) to the nearest campus office if possible.
            </p>
          </div>
          
          <Button type="submit" className="w-full">
            <FileCheck className="mr-2 h-4 w-4" />
            Submit Found Item Report
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Report;
