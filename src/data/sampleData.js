/**
 * Sample datasets for the analytics dashboard.
 * These provide realistic data to demonstrate all chart and table widgets.
 */

// Helper to generate dates
const d = (str) => str;

export const salesData = [
  { date: d("2024-01-01"), product: "Laptop", category: "Electronics", region: "North", revenue: 1200, quantity: 3, cost: 800 },
  { date: d("2024-01-03"), product: "Phone", category: "Electronics", region: "South", revenue: 800, quantity: 2, cost: 500 },
  { date: d("2024-01-05"), product: "Tablet", category: "Electronics", region: "East", revenue: 650, quantity: 1, cost: 400 },
  { date: d("2024-01-08"), product: "Desk", category: "Furniture", region: "East", revenue: 450, quantity: 1, cost: 300 },
  { date: d("2024-01-10"), product: "Chair", category: "Furniture", region: "West", revenue: 200, quantity: 4, cost: 120 },
  { date: d("2024-01-12"), product: "Monitor", category: "Electronics", region: "North", revenue: 950, quantity: 2, cost: 600 },
  { date: d("2024-01-15"), product: "Keyboard", category: "Electronics", region: "South", revenue: 150, quantity: 5, cost: 80 },
  { date: d("2024-01-18"), product: "Mouse", category: "Electronics", region: "West", revenue: 100, quantity: 8, cost: 50 },
  { date: d("2024-01-20"), product: "Bookshelf", category: "Furniture", region: "North", revenue: 380, quantity: 2, cost: 250 },
  { date: d("2024-01-22"), product: "Lamp", category: "Furniture", region: "East", revenue: 120, quantity: 3, cost: 70 },
  { date: d("2024-01-25"), product: "Laptop", category: "Electronics", region: "South", revenue: 2400, quantity: 6, cost: 1600 },
  { date: d("2024-01-28"), product: "Phone", category: "Electronics", region: "West", revenue: 1600, quantity: 4, cost: 1000 },
  { date: d("2024-02-01"), product: "Laptop", category: "Electronics", region: "North", revenue: 2400, quantity: 2, cost: 1600 },
  { date: d("2024-02-03"), product: "Desk", category: "Furniture", region: "South", revenue: 900, quantity: 2, cost: 600 },
  { date: d("2024-02-05"), product: "Monitor", category: "Electronics", region: "South", revenue: 600, quantity: 3, cost: 400 },
  { date: d("2024-02-08"), product: "Chair", category: "Furniture", region: "North", revenue: 400, quantity: 8, cost: 240 },
  { date: d("2024-02-10"), product: "Desk", category: "Furniture", region: "East", revenue: 900, quantity: 2, cost: 600 },
  { date: d("2024-02-12"), product: "Tablet", category: "Electronics", region: "West", revenue: 1300, quantity: 2, cost: 800 },
  { date: d("2024-02-15"), product: "Mouse", category: "Electronics", region: "West", revenue: 150, quantity: 10, cost: 80 },
  { date: d("2024-02-18"), product: "Keyboard", category: "Electronics", region: "East", revenue: 300, quantity: 6, cost: 180 },
  { date: d("2024-02-20"), product: "Bookshelf", category: "Furniture", region: "South", revenue: 760, quantity: 4, cost: 500 },
  { date: d("2024-02-22"), product: "Lamp", category: "Furniture", region: "North", revenue: 240, quantity: 6, cost: 140 },
  { date: d("2024-02-25"), product: "Laptop", category: "Electronics", region: "East", revenue: 3600, quantity: 3, cost: 2400 },
  { date: d("2024-02-28"), product: "Phone", category: "Electronics", region: "North", revenue: 2000, quantity: 5, cost: 1250 },
  { date: d("2024-03-01"), product: "Keyboard", category: "Electronics", region: "North", revenue: 300, quantity: 6, cost: 180 },
  { date: d("2024-03-03"), product: "Monitor", category: "Electronics", region: "East", revenue: 1900, quantity: 4, cost: 1200 },
  { date: d("2024-03-05"), product: "Chair", category: "Furniture", region: "South", revenue: 400, quantity: 8, cost: 240 },
  { date: d("2024-03-08"), product: "Desk", category: "Furniture", region: "West", revenue: 1350, quantity: 3, cost: 900 },
  { date: d("2024-03-10"), product: "Tablet", category: "Electronics", region: "South", revenue: 1950, quantity: 3, cost: 1200 },
  { date: d("2024-03-12"), product: "Lamp", category: "Furniture", region: "West", revenue: 160, quantity: 4, cost: 90 },
  { date: d("2024-03-15"), product: "Phone", category: "Electronics", region: "East", revenue: 3200, quantity: 8, cost: 2000 },
  { date: d("2024-03-18"), product: "Laptop", category: "Electronics", region: "West", revenue: 4800, quantity: 4, cost: 3200 },
  { date: d("2024-03-20"), product: "Mouse", category: "Electronics", region: "North", revenue: 200, quantity: 16, cost: 100 },
  { date: d("2024-03-22"), product: "Bookshelf", category: "Furniture", region: "East", revenue: 570, quantity: 3, cost: 375 },
  { date: d("2024-03-25"), product: "Chair", category: "Furniture", region: "West", revenue: 600, quantity: 12, cost: 360 },
  { date: d("2024-03-28"), product: "Keyboard", category: "Electronics", region: "South", revenue: 450, quantity: 9, cost: 270 },
  { date: d("2024-03-30"), product: "Monitor", category: "Electronics", region: "West", revenue: 1425, quantity: 3, cost: 900 },
  { date: d("2024-04-02"), product: "Laptop", category: "Electronics", region: "South", revenue: 6000, quantity: 5, cost: 4000 },
  { date: d("2024-04-05"), product: "Desk", category: "Furniture", region: "North", revenue: 1800, quantity: 4, cost: 1200 },
  { date: d("2024-04-08"), product: "Phone", category: "Electronics", region: "West", revenue: 2800, quantity: 7, cost: 1750 },
  { date: d("2024-04-10"), product: "Chair", category: "Furniture", region: "East", revenue: 350, quantity: 7, cost: 210 },
  { date: d("2024-04-12"), product: "Tablet", category: "Electronics", region: "North", revenue: 2600, quantity: 4, cost: 1600 },
  { date: d("2024-04-15"), product: "Lamp", category: "Furniture", region: "South", revenue: 280, quantity: 7, cost: 160 },
  { date: d("2024-04-18"), product: "Bookshelf", category: "Furniture", region: "West", revenue: 950, quantity: 5, cost: 625 },
  { date: d("2024-04-20"), product: "Mouse", category: "Electronics", region: "East", revenue: 250, quantity: 20, cost: 125 },
  { date: d("2024-04-22"), product: "Monitor", category: "Electronics", region: "North", revenue: 2375, quantity: 5, cost: 1500 },
  { date: d("2024-04-25"), product: "Keyboard", category: "Electronics", region: "West", revenue: 600, quantity: 12, cost: 360 },
  { date: d("2024-04-28"), product: "Desk", category: "Furniture", region: "South", revenue: 2250, quantity: 5, cost: 1500 },
  { date: d("2024-04-30"), product: "Laptop", category: "Electronics", region: "East", revenue: 4800, quantity: 4, cost: 3200 },
];

// Generate daily user analytics data for 3 months
function generateUserAnalytics() {
  const data = [];
  const startDate = new Date("2024-01-01");
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();
    // Weekdays have more traffic
    const weekdayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1.0;
    // Gradual growth trend
    const growthFactor = 1 + i * 0.005;
    const baseUsers = Math.round((1200 + Math.random() * 400) * weekdayMultiplier * growthFactor);
    const sessions = Math.round(baseUsers * (2.5 + Math.random() * 1.0));
    const pageviews = Math.round(sessions * (2.2 + Math.random() * 0.8));
    const bounceRate = Math.round((35 + Math.random() * 20) * 10) / 10;
    const avgSession = Math.round((2.5 + Math.random() * 2.5) * 10) / 10;

    data.push({
      date: dateStr,
      users: baseUsers,
      sessions,
      pageviews,
      bounce_rate: bounceRate,
      avg_session: avgSession,
    });
  }
  return data;
}

export const userAnalytics = generateUserAnalytics();

export const marketingCampaigns = [
  { campaign: "Summer Sale", channel: "Email", impressions: 50000, clicks: 2500, conversions: 180, spend: 1200 },
  { campaign: "Black Friday", channel: "Social Media", impressions: 120000, clicks: 8500, conversions: 650, spend: 3500 },
  { campaign: "New Year Promo", channel: "Search", impressions: 85000, clicks: 5100, conversions: 420, spend: 2800 },
  { campaign: "Spring Collection", channel: "Email", impressions: 42000, clicks: 1900, conversions: 145, spend: 900 },
  { campaign: "Back to School", channel: "Social Media", impressions: 95000, clicks: 6200, conversions: 380, spend: 2100 },
  { campaign: "Holiday Special", channel: "Display", impressions: 200000, clicks: 4800, conversions: 290, spend: 4200 },
  { campaign: "Flash Sale", channel: "Email", impressions: 38000, clicks: 3200, conversions: 260, spend: 800 },
  { campaign: "Product Launch", channel: "Search", impressions: 110000, clicks: 7800, conversions: 520, spend: 5200 },
  { campaign: "Loyalty Rewards", channel: "Email", impressions: 28000, clicks: 2100, conversions: 310, spend: 600 },
  { campaign: "Weekend Deals", channel: "Social Media", impressions: 75000, clicks: 4500, conversions: 280, spend: 1800 },
  { campaign: "Clearance Event", channel: "Display", impressions: 160000, clicks: 3600, conversions: 210, spend: 3100 },
  { campaign: "VIP Access", channel: "Email", impressions: 15000, clicks: 1800, conversions: 195, spend: 450 },
  { campaign: "Brand Awareness", channel: "Display", impressions: 300000, clicks: 5400, conversions: 120, spend: 6000 },
  { campaign: "Retargeting Q1", channel: "Display", impressions: 180000, clicks: 9200, conversions: 480, spend: 3800 },
  { campaign: "Influencer Collab", channel: "Social Media", impressions: 250000, clicks: 12000, conversions: 720, spend: 8500 },
  { campaign: "App Install", channel: "Search", impressions: 90000, clicks: 6800, conversions: 890, spend: 4100 },
  { campaign: "Referral Program", channel: "Email", impressions: 22000, clicks: 1600, conversions: 340, spend: 350 },
  { campaign: "Seasonal Promo", channel: "Social Media", impressions: 68000, clicks: 3900, conversions: 230, spend: 1500 },
];

/**
 * Default data sources bundled with the application.
 * Each has a unique id, name, and the actual data rows.
 */
export const defaultDataSources = [
  {
    id: "sales-data",
    name: "Sales Data",
    type: "builtin",
    data: salesData,
    createdAt: "2024-01-01T00:00:00Z",
    lastModified: "2024-04-30T00:00:00Z",
  },
  {
    id: "user-analytics",
    name: "User Analytics",
    type: "builtin",
    data: userAnalytics,
    createdAt: "2024-01-01T00:00:00Z",
    lastModified: "2024-03-31T00:00:00Z",
  },
  {
    id: "marketing-campaigns",
    name: "Marketing Campaigns",
    type: "builtin",
    data: marketingCampaigns,
    createdAt: "2024-01-01T00:00:00Z",
    lastModified: "2024-04-01T00:00:00Z",
  },
];
