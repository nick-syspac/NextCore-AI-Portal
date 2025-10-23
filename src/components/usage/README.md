# Usage Statistics Components

This directory contains comprehensive usage analytics and statistics components for the NextCore AI Cloud tenant dashboard.

## Components

### 1. Usage Stats Page (`/dashboard/[tenantSlug]/usage/page.tsx`)

Full-page analytics dashboard showing detailed usage statistics.

**Features:**
- Period selector (Today, Week, Month, Year)
- Key metrics cards (API Calls, Tokens Used, Total Cost)
- Daily usage trend chart
- Top models breakdown
- Cost breakdown by model
- Usage insights and recommendations

**Metrics Displayed:**
- Total API calls with success/failure breakdown
- Token usage (prompt vs completion)
- Cost tracking with per-call average
- Success rate percentage
- Daily usage trends
- Model-by-model analysis

### 2. Usage Overview Widget (`/components/usage/UsageOverview.tsx`)

Mini dashboard widget showing high-level usage summary.

**Features:**
- Compact 2x2 grid layout
- Four key metrics: API Calls, Tokens, Cost, Success Rate
- Color-coded stat cards
- Link to detailed analytics page
- Auto-refresh capability

**Usage:**
```tsx
import { UsageOverview } from '@/components/usage/UsageOverview';

<UsageOverview tenantSlug={tenantSlug} />
```

### 3. Quota Widget (`/components/usage/QuotaWidget.tsx`)

Displays usage against monthly quotas/limits.

**Features:**
- Progress bars for API calls, tokens, and spend
- Visual indicators for usage levels (blue/purple/red)
- Warning alerts when approaching limits
- Formatted numbers and currency
- Responsive design

**Usage:**
```tsx
import { QuotaWidget } from '@/components/usage/QuotaWidget';

<QuotaWidget tenantSlug={tenantSlug} />
```

### 4. Reusable Stats Components (`/components/stats/StatsComponents.tsx`)

Collection of reusable UI components for displaying statistics.

**Components:**
- `StatCard` - Full-featured stat card with trend indicators
- `MiniStat` - Compact stat display with color coding
- `ProgressBar` - Customizable progress indicator
- `UsageChart` - Bar chart visualization for usage data

**Example:**
```tsx
import { StatCard, MiniStat, ProgressBar } from '@/components/stats/StatsComponents';

<StatCard 
  title="API Calls" 
  value={15847} 
  change={12.5} 
  trend="up"
  icon="📊"
/>

<MiniStat label="Tokens" value="2.8M" color="purple" />

<ProgressBar 
  label="Usage" 
  value={1584} 
  max={5000} 
  color="blue"
/>
```

## Data Structure

### UsageStats Interface
```typescript
interface UsageStats {
  period: string;
  apiCalls: {
    total: number;
    successful: number;
    failed: number;
    change: number; // percentage
  };
  tokens: {
    total: number;
    prompt: number;
    completion: number;
    change: number;
  };
  costs: {
    total: number;
    breakdown: {
      model: string;
      cost: number;
      calls: number;
    }[];
    change: number;
  };
  topModels: {
    model: string;
    calls: number;
    tokens: number;
    cost: number;
  }[];
  dailyUsage: {
    date: string;
    calls: number;
    tokens: number;
    cost: number;
  }[];
}
```

## Integration with Backend

Currently using mock data. To integrate with real backend:

1. **Add API endpoint** in `src/lib/api.ts`:
```typescript
async getUsageStats(tenantSlug: string, authToken: string, period: string) {
  const response = await fetch(
    `${API_URL}/api/tenants/${tenantSlug}/usage/?period=${period}`,
    {
      headers: { 'Authorization': `Token ${authToken}` }
    }
  );
  return response.json();
}
```

2. **Create Django view** in `control-plane`:
```python
class TenantUsageStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, tenant_slug):
        period = request.query_params.get('period', 'month')
        # Query usage data from database
        stats = calculate_usage_stats(tenant_slug, period)
        return Response(stats)
```

3. **Replace mock data** in components with API calls

## Styling

All components use Tailwind CSS with consistent color schemes:
- **Blue** - Primary actions, main metrics
- **Green** - Success states, positive trends
- **Red** - Errors, warnings, negative trends
- **Purple** - Secondary metrics, completion data
- **Yellow** - Warnings, attention needed

## Features to Add

- [ ] Export usage data to CSV/PDF
- [ ] Custom date range selector
- [ ] Email reports configuration
- [ ] Budget alerts and notifications
- [ ] Comparison with previous periods
- [ ] Predictive cost forecasting
- [ ] Real-time usage tracking
- [ ] Usage by user/API key breakdown
- [ ] Geographic usage distribution
- [ ] Response time analytics

## Performance Considerations

- Components use lazy loading for heavy data
- Charts render client-side only
- Data fetching includes loading states
- Caching strategy for frequently accessed stats
- Pagination for large datasets
- Debouncing for period changes

## Accessibility

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- Color contrast compliance
- Focus indicators
- Responsive design for mobile devices
