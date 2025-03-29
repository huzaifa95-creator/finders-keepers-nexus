
import React, { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, SlidersHorizontal, PackageX, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from "@/lib/utils";

interface Item {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  location: string;
  createdAt: string;
  date: string;
  type: 'lost' | 'found';
  isHighValue: boolean;
  description: string;
  additionalDetails?: string;
}

const FoundItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isHighValue, setIsHighValue] = useState<string>("all");
  const { toast } = useToast();
  
  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('type', 'found');
      if (category !== 'all') params.append('category', category);
      if (location !== 'all') params.append('location', location);
      if (searchTerm) params.append('search', searchTerm);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      if (isHighValue !== 'all') params.append('isHighValue', isHighValue === 'yes' ? 'true' : 'false');
      
      const response = await fetch(`http://localhost:5000/api/items?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch found items');
      }
      
      const data = await response.json();
      console.log('Found items data:', data);
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching found items:', err);
      setError('Failed to load items. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to load found items. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchItems();
  }, []);

  // Handle filter application
  const handleApplyFilters = () => {
    fetchItems();
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setCategory("all");
    setLocation("all");
    setDateRange("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setIsHighValue("all");
    setSearchTerm("");
    // Reset and fetch
    setTimeout(fetchItems, 0);
  };

  // Update date range based on preset selection
  useEffect(() => {
    const now = new Date();
    
    if (dateRange === "today") {
      const today = new Date();
      setStartDate(today);
      setEndDate(today);
    } else if (dateRange === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      setStartDate(weekAgo);
      setEndDate(now);
    } else if (dateRange === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      setStartDate(monthAgo);
      setEndDate(now);
    } else if (dateRange === "all") {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [dateRange]);
  
  const uniqueLocations = ["all", ...Array.from(new Set(items.map(item => item.location)))];
  const categories = ["all", ...Array.from(new Set(items.map(item => item.category)))];

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Found Items</h1>
            <p className="text-muted-foreground">Browse items that have been found and reported by the community.</p>
          </div>
          
          <Button asChild>
            <a href="/report?type=found">Report a Found Item</a>
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, description, location..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
          
          {showFilters && (
            <div className="p-4 border border-border rounded-lg bg-card space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat === "all" ? "All Categories" : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc === "all" ? "All Locations" : loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">High Value Items</label>
                  <Select value={isHighValue} onValueChange={setIsHighValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="High value items" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="yes">High Value Only</SelectItem>
                      <SelectItem value="no">Standard Value Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Date Range</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {dateRange === "custom" && (
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PP") : "Start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PP") : "End date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={handleResetFilters}>Reset</Button>
                <Button size="sm" onClick={handleApplyFilters}>Apply Filters</Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Results */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
              {loading ? 'Loading items...' : `Showing ${items.length} results`}
            </p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, index) => (
                <Card key={index} className="h-[350px] animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <CardHeader className="p-4">
                    <div className="h-5 w-2/3 bg-muted rounded"></div>
                    <div className="h-4 w-1/3 bg-muted rounded mt-2"></div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-muted rounded"></div>
                      <div className="h-4 w-2/3 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <p className="text-lg font-medium text-destructive">{error}</p>
              <Button 
                onClick={() => fetchItems()} 
                variant="outline" 
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <ItemCard 
                  key={item._id}
                  id={item._id}
                  title={item.title}
                  category={item.category}
                  image={item.imageUrl ? `http://localhost:5000${item.imageUrl}` : '/placeholder.svg'}
                  location={item.location}
                  date={formatDate(item.date || item.createdAt)}
                  status="found"
                  isHighValue={item.isHighValue}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <PackageX className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-muted-foreground mb-4">There are no found items matching your criteria</p>
              <Button asChild>
                <a href="/report?type=found">Report a Found Item</a>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FoundItems;
