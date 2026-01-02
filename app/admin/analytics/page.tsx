import { requireAdmin } from "@/lib/admin";
import {
  getTimePeriodComparison,
  getCustomerAnalytics,
  getProductPerformance,
} from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
} from "lucide-react";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const [monthComparison, yearComparison, customerAnalytics, productPerformance] =
    await Promise.all([
      getTimePeriodComparison("month"),
      getTimePeriodComparison("year"),
      getCustomerAnalytics(),
      getProductPerformance(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive insights into your store performance
        </p>
      </div>

      <Tabs defaultValue="comparison" className="space-y-6">
        <TabsList>
          <TabsTrigger value="comparison">Time Comparisons</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>This Month vs Last Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricCard
                  label="Revenue"
                  current={monthComparison.current.revenue}
                  previous={monthComparison.previous.revenue}
                  change={monthComparison.change.revenue}
                  format="currency"
                />
                <MetricCard
                  label="Orders"
                  current={monthComparison.current.orders}
                  previous={monthComparison.previous.orders}
                  change={monthComparison.change.orders}
                  format="number"
                />
                <MetricCard
                  label="Customers"
                  current={monthComparison.current.customers}
                  previous={monthComparison.previous.customers}
                  change={monthComparison.change.customers}
                  format="number"
                />
                <MetricCard
                  label="Average Order Value"
                  current={monthComparison.current.averageOrderValue}
                  previous={monthComparison.previous.averageOrderValue}
                  change={monthComparison.change.averageOrderValue}
                  format="currency"
                />
              </CardContent>
            </Card>

            {/* Yearly Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>This Year vs Last Year</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricCard
                  label="Revenue"
                  current={yearComparison.current.revenue}
                  previous={yearComparison.previous.revenue}
                  change={yearComparison.change.revenue}
                  format="currency"
                />
                <MetricCard
                  label="Orders"
                  current={yearComparison.current.orders}
                  previous={yearComparison.previous.orders}
                  change={yearComparison.change.orders}
                  format="number"
                />
                <MetricCard
                  label="Customers"
                  current={yearComparison.current.customers}
                  previous={yearComparison.previous.customers}
                  change={yearComparison.change.customers}
                  format="number"
                />
                <MetricCard
                  label="Average Order Value"
                  current={yearComparison.current.averageOrderValue}
                  previous={yearComparison.previous.averageOrderValue}
                  change={yearComparison.change.averageOrderValue}
                  format="currency"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Total Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {customerAnalytics.totalCustomers}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  New Customers (30 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {customerAnalytics.newCustomers}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Returning Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {customerAnalytics.returningCustomers}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Average Order Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  ${customerAnalytics.averageOrderValue.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Customer Lifetime Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  ${customerAnalytics.customerLifetimeValue.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Repeat Customer Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {customerAnalytics.repeatCustomerRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Selling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top 10 Best Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {productPerformance.bestSelling.length === 0 ? (
                    <p className="text-muted-foreground">No sales data available</p>
                  ) : (
                    productPerformance.bestSelling.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground w-6">
                            #{index + 1}
                          </span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            ${product.revenue.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.quantity} sold
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Worst Selling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                  Top 10 Worst Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {productPerformance.worstSelling.length === 0 ? (
                    <p className="text-muted-foreground">No sales data available</p>
                  ) : (
                    productPerformance.worstSelling.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground w-6">
                            #{index + 1}
                          </span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            ${product.revenue.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.quantity} sold
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* No Sales Products */}
          {productPerformance.noSales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-red-600" />
                  Products with No Sales ({productPerformance.noSales.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {productPerformance.noSales.map((product) => (
                    <div
                      key={product.id}
                      className="p-2 rounded border text-sm"
                    >
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {product.inventory}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  label,
  current,
  previous,
  change,
  format,
}: {
  label: string;
  current: number;
  previous: number;
  change: number;
  format: "currency" | "number";
}) {
  const isPositive = change >= 0;
  const formattedCurrent =
    format === "currency" ? `$${current.toFixed(2)}` : current.toString();
  const formattedChange = `${isPositive ? "+" : ""}${change.toFixed(1)}%`;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span
            className={`text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {formattedChange}
          </span>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold">{formattedCurrent}</p>
        <p className="text-sm text-muted-foreground">
          vs {format === "currency" ? `$${previous.toFixed(2)}` : previous}
        </p>
      </div>
    </div>
  );
}

