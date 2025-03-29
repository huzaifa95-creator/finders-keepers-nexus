import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar as CalendarIcon, Upload, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const AddItemForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: new Date(),
    type: 'found',
    isHighValue: false,
    additionalDetails: '',
    contactMethod: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'date') {
          // Fix: Ensure we're working with a Date object before calling toISOString
          const dateValue = value instanceof Date ? value.toISOString() : String(value);
          formDataToSend.append(key, dateValue);
        } else if (key === 'isHighValue') {
          formDataToSend.append(key, value ? 'true' : 'false');
        } else {
          formDataToSend.append(key, String(value));
        }
      });
      
      // Add image if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });
      
      if (!response.ok) {
        throw new Error('Failed to create item');
      }
      
      const data = await response.json();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        date: new Date(),
        type: 'found',
        isHighValue: false,
        additionalDetails: '',
        contactMethod: ''
      });
      setImageFile(null);
      setImagePreview(null);
      
      toast({
        title: "Item Added Successfully",
        description: `The ${data.type} item has been added to the system.`,
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Electronics",
    "Clothing",
    "Books",
    "Accessories",
    "ID Cards",
    "Keys",
    "Stationery",
    "Others"
  ];

  const locations = [
    "Library",
    "Cafeteria",
    "Classroom",
    "Laboratory",
    "Gymnasium",
    "Auditorium",
    "Parking Lot",
    "Hallway",
    "Other"
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Item</CardTitle>
        <CardDescription>
          Add a found item to the system that can be claimed by students.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Type</label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="found">Found Item</SelectItem>
                  <SelectItem value="lost">Lost Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief title describing the item"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of the item"
              className="min-h-[100px]"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select 
                value={formData.location} 
                onValueChange={(value) => handleSelectChange('location', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData({...formData, date})}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Method (Optional)</label>
              <Input 
                name="contactMethod"
                value={formData.contactMethod}
                onChange={handleInputChange}
                placeholder="Email, phone, or where to find"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Details (Optional)</label>
            <Textarea 
              name="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleInputChange}
              placeholder="Any other details that might help identify the item"
              className="min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Item Image (Optional)</label>
            <div className="flex items-center gap-4">
              <Input 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              
              {imagePreview && (
                <div className="h-16 w-16 rounded border overflow-hidden flex-shrink-0">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isHighValue"
              name="isHighValue"
              checked={formData.isHighValue}
              onChange={handleCheckboxChange}
              className="form-checkbox h-4 w-4"
            />
            <label htmlFor="isHighValue" className="text-sm font-medium flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              This is a high value item
            </label>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Item...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Add Item
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddItemForm;
